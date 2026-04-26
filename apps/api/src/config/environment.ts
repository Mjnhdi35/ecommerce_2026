import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().min(1).max(65535).default(3000),

  API_PREFIX: z
    .string()
    .regex(/^\/[a-z0-9/_-]*$/i)
    .default("/api/v1")
    .transform((value) => value.replace(/\/+$/, "") || "/"),

  BODY_LIMIT: z.string().min(1).default("100kb"),

  SLOW_REQUEST_MS: z.coerce.number().min(1).default(500),

  REQUEST_TIMEOUT_MS: z.coerce.number().min(1).default(10000),

  CLIENT_ORIGINS: z
    .string()
    .min(1)
    .default("http://localhost:5173,http://localhost:3000"),

  CSRF_SECRET: z
    .string()
    .min(32, "CSRF_SECRET must be at least 32 characters")
    .optional(),

  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).default(15 * 60 * 1000),

  AUTH_RATE_LIMIT_MAX: z.coerce.number().min(1).default(20),

  DEFAULT_CURRENCY: z.string().trim().min(3).max(3).default("VND"),

  MONGO_URL: z
    .string()
    .url({
      message: "MONGO_URL must be a valid MongoDB connection URL",
    }),

  DB_NAME: z.string().min(1, "DB_NAME is required").default("ecommerce"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_ACCESS_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/).default("15m"),

  JWT_REFRESH_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/).default("7d"),
}).superRefine((env, context) => {
  if (env.NODE_ENV === "production" && !env.CSRF_SECRET) {
    context.addIssue({
      code: "custom",
      message: "CSRF_SECRET is required in production",
      path: ["CSRF_SECRET"],
    });
  }
});

const env = process.env;
const rawEnvironment = environmentSchema.parse({
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  API_PREFIX: env.API_PREFIX,
  BODY_LIMIT: env.BODY_LIMIT,
  SLOW_REQUEST_MS: env.SLOW_REQUEST_MS,
  REQUEST_TIMEOUT_MS: env.REQUEST_TIMEOUT_MS,
  CLIENT_ORIGINS: env.CLIENT_ORIGINS,
  CSRF_SECRET: env.CSRF_SECRET,
  AUTH_RATE_LIMIT_WINDOW_MS: env.AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX: env.AUTH_RATE_LIMIT_MAX,
  DEFAULT_CURRENCY: env.DEFAULT_CURRENCY,
  MONGO_URL: env.MONGO_URL,
  DB_NAME: env.DB_NAME,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
});
const parsedEnvironment = {
  ...rawEnvironment,
  CSRF_SECRET: rawEnvironment.CSRF_SECRET || rawEnvironment.JWT_REFRESH_SECRET,
};

export type Environment = typeof parsedEnvironment;
export { parsedEnvironment as environment };

export const {
  NODE_ENV,
  PORT,
  API_PREFIX,
  BODY_LIMIT,
  SLOW_REQUEST_MS,
  REQUEST_TIMEOUT_MS,
  CLIENT_ORIGINS,
  CSRF_SECRET,
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX,
  DEFAULT_CURRENCY,
  MONGO_URL,
  DB_NAME,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = parsedEnvironment;
