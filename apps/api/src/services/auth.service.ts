import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Collection, Db, ObjectId, WithId } from "mongodb";
import { environment } from "../config/environment";
import { RefreshToken } from "../models/refreshToken";
import { User } from "../models/user";
import {
  CreateUserInput,
  HttpError,
  PublicUser,
  UserService,
} from "./user.service";

const REFRESH_TOKEN_COLLECTION = "refresh_tokens";

interface TokenPayload extends JwtPayload {
  sub: string;
  type: "access" | "refresh";
  tokenId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: PublicUser;
}

export class AuthService {
  private refreshTokens: Collection<RefreshToken>;
  private userService: UserService;

  constructor({
    db,
    userService,
  }: {
    db: Db;
    userService: UserService;
  }) {
    this.refreshTokens = db.collection<RefreshToken>(
      REFRESH_TOKEN_COLLECTION,
    );
    this.userService = userService;
  }

  public async register(input: CreateUserInput): Promise<AuthResult> {
    const user = await this.userService.create(input);
    const tokens = await this.issueTokenPair(user._id.toHexString(), user.email);

    return {
      user,
      ...tokens,
    };
  }

  public async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userService.findByEmailWithPassword(email);

    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password");
    }

    const tokens = await this.issueTokenPair(user._id.toHexString(), user.email);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.refreshTokens.findOne({
      tokenHash,
      userId: new ObjectId(payload.sub),
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const user = await this.userService.findById(payload.sub);
    await this.revokeRefreshToken(tokenHash);

    return this.issueTokenPair(user._id.toHexString(), user.email);
  }

  public async logout(refreshToken: string): Promise<void> {
    await this.revokeRefreshToken(this.hashToken(refreshToken));
  }

  public verifyAccessToken(accessToken: string): AuthUser {
    const payload = jwt.verify(
      accessToken,
      environment.JWT_ACCESS_SECRET,
    ) as TokenPayload;

    if (payload.type !== "access" || !payload.sub) {
      throw new HttpError(401, "Invalid access token");
    }

    return {
      id: payload.sub,
      email: String(payload.email || ""),
    };
  }

  private async issueTokenPair(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = this.signToken(
      {
        sub: userId,
        email,
        type: "access",
      },
      environment.JWT_ACCESS_SECRET,
      environment.JWT_ACCESS_EXPIRES_IN,
    );

    const refreshToken = this.signToken(
      {
        sub: userId,
        email,
        type: "refresh",
        tokenId: new ObjectId().toHexString(),
      },
      environment.JWT_REFRESH_SECRET,
      environment.JWT_REFRESH_EXPIRES_IN,
    );

    await this.refreshTokens.insertOne({
      userId: new ObjectId(userId),
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(
        Date.now() + this.parseDurationToMs(environment.JWT_REFRESH_EXPIRES_IN),
      ),
      createdAt: new Date(),
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
    const payload = jwt.verify(
      refreshToken,
      environment.JWT_REFRESH_SECRET,
    ) as TokenPayload;

    if (payload.type !== "refresh" || !payload.sub) {
      throw new HttpError(401, "Invalid refresh token");
    }

    return payload;
  }

  private async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.refreshTokens.updateOne(
      {
        tokenHash,
        revokedAt: { $exists: false },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
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
