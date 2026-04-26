import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { ObjectId, WithId } from "mongodb";
import { environment } from "../../config/environment";
import { User, UserRole } from "../users/user.model";
import {
  CreateUserInput,
  PublicUser,
  UpdateProfileInput,
  UserService,
} from "../users/user.service";
import { HttpError } from "../../shared/errors/http-error";
import { BootstrapLockRepository } from "./bootstrap-lock.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";

interface TokenPayload extends JwtPayload {
  sub: string;
  type: "access" | "refresh";
  role: UserRole;
  tokenId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: PublicUser;
}

export interface AuthSessionMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSession {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private bootstrapLockRepository: BootstrapLockRepository;
  private refreshTokenRepository: RefreshTokenRepository;
  private userService: UserService;

  constructor({
    bootstrapLockRepository,
    refreshTokenRepository,
    userService,
  }: {
    bootstrapLockRepository: BootstrapLockRepository;
    refreshTokenRepository: RefreshTokenRepository;
    userService: UserService;
  }) {
    this.bootstrapLockRepository = bootstrapLockRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.userService = userService;
  }

  public async register(
    input: CreateUserInput,
    metadata: AuthSessionMetadata = {},
  ): Promise<AuthResult> {
    let user = await this.userService.create({
      ...input,
      role: "user",
    });

    if (await this.shouldPromoteFirstAdmin()) {
      user = await this.userService.update(user._id.toHexString(), {
        role: "admin",
      });
    }

    const tokens = await this.issueTokenPair(user, metadata);

    return {
      user,
      ...tokens,
    };
  }

  public async login(
    email: string,
    password: string,
    metadata: AuthSessionMetadata = {},
  ): Promise<AuthResult> {
    const user = await this.userService.findByEmailWithPassword(email);

    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password");
    }

    const publicUser = this.toPublicUser(user);
    const tokens = await this.issueTokenPair(publicUser, metadata);

    return {
      user: publicUser,
      ...tokens,
    };
  }

  public async refresh(
    refreshToken: string,
    metadata: AuthSessionMetadata = {},
  ): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.rotateValidToken({
      tokenHash,
      userId: new ObjectId(payload.sub),
    });

    if (!storedToken) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const user = await this.userService.findById(payload.sub);

    return this.issueTokenPair(user, {
      ipAddress: metadata.ipAddress || storedToken.ipAddress,
      userAgent: metadata.userAgent || storedToken.userAgent,
    });
  }

  public async logout(refreshToken: string): Promise<void> {
    await this.revokeRefreshToken(this.hashToken(refreshToken));
  }

  public async getMe(userId: string): Promise<PublicUser> {
    return this.userService.findById(userId);
  }

  public async updateMe(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<PublicUser> {
    return this.userService.updateProfile(userId, input);
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.userService.changePassword(userId, currentPassword, newPassword);
    await this.revokeRefreshTokensByUserId(userId);
  }

  public async listSessions(userId: string): Promise<AuthSession[]> {
    const sessions = await this.refreshTokenRepository.findActiveByUserId(
      new ObjectId(userId),
    );

    return sessions.map((session) => ({
      id: session._id.toHexString(),
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    }));
  }

  public async logoutAll(userId: string): Promise<void> {
    await this.revokeRefreshTokensByUserId(userId);
  }

  public async revokeSession(userId: string, sessionId: string): Promise<void> {
    const result = await this.refreshTokenRepository.revokeByIdForUser({
      id: this.toObjectId(sessionId, "Invalid session id"),
      userId: new ObjectId(userId),
    });

    if (result.matchedCount === 0) {
      throw new HttpError(404, "Session not found");
    }
  }

  public async authenticateAccessToken(accessToken: string): Promise<AuthUser> {
    const tokenUser = this.verifyAccessToken(accessToken);

    try {
      const user = await this.userService.findById(tokenUser.id);

      return {
        id: user._id.toHexString(),
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof HttpError && error.statusCode === 404) {
        throw new HttpError(401, "Invalid access token");
      }

      throw error;
    }
  }

  public verifyAccessToken(accessToken: string): AuthUser {
    let payload: TokenPayload;

    try {
      payload = jwt.verify(
        accessToken,
        environment.JWT_ACCESS_SECRET,
      ) as TokenPayload;
    } catch {
      throw new HttpError(401, "Invalid access token");
    }

    if (payload.type !== "access" || !payload.sub) {
      throw new HttpError(401, "Invalid access token");
    }

    return {
      id: payload.sub,
      email: String(payload.email || ""),
      role: payload.role,
    };
  }

  private async issueTokenPair(
    user: PublicUser,
    metadata: AuthSessionMetadata = {},
  ): Promise<AuthTokens> {
    const userId = user._id.toHexString();
    const accessToken = this.signToken(
      {
        sub: userId,
        email: user.email,
        role: user.role,
        type: "access",
      },
      environment.JWT_ACCESS_SECRET,
      environment.JWT_ACCESS_EXPIRES_IN,
    );

    const refreshToken = this.signToken(
      {
        sub: userId,
        email: user.email,
        role: user.role,
        type: "refresh",
        tokenId: new ObjectId().toHexString(),
      },
      environment.JWT_REFRESH_SECRET,
      environment.JWT_REFRESH_EXPIRES_IN,
    );

    await this.refreshTokenRepository.insert({
      userId: new ObjectId(userId),
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(
        Date.now() + this.parseDurationToMs(environment.JWT_REFRESH_EXPIRES_IN),
      ),
      createdAt: new Date(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private signToken(
    payload: TokenPayload,
    secret: string,
    expiresIn: string,
  ): string {
    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, secret, options);
  }

  private verifyRefreshToken(refreshToken: string): TokenPayload {
    let payload: TokenPayload;

    try {
      payload = jwt.verify(
        refreshToken,
        environment.JWT_REFRESH_SECRET,
      ) as TokenPayload;
    } catch {
      throw new HttpError(401, "Invalid refresh token");
    }

    if (payload.type !== "refresh" || !payload.sub) {
      throw new HttpError(401, "Invalid refresh token");
    }

    return payload;
  }

  private async shouldPromoteFirstAdmin(): Promise<boolean> {
    if ((await this.userService.countByRole("admin")) > 0) {
      return false;
    }

    return this.bootstrapLockRepository.claimFirstAdminLock();
  }

  private async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.refreshTokenRepository.revokeByHash(tokenHash);
  }

  private async revokeRefreshTokensByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeByUserId(new ObjectId(userId));
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private toObjectId(value: string, message: string): ObjectId {
    if (!ObjectId.isValid(value)) {
      throw new HttpError(400, message);
    }

    return new ObjectId(value);
  }

  private parseDurationToMs(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error(`Invalid token duration: ${duration}`);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit as keyof typeof multipliers];
  }

  private toPublicUser(user: WithId<User>): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
