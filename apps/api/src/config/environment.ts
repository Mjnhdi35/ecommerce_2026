import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().min(1).max(65535).default(3000),

  BODY_LIMIT: z.string().min(1).default("100kb"),

  SLOW_REQUEST_MS: z.coerce.number().min(1).default(500),

  REQUEST_TIMEOUT_MS: z.coerce.number().min(1).default(10000),

  MONGO_URL: z
    .string()
    .url({
      message: "MONGO_URL must be a valid MongoDB connection URL",
    })
    .optional(),

  DB_NAME: z.string().min(1, "DB_NAME is required").default("ecommerce"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),

  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("7d"),
});

const env = process.env;
const parsedEnvironment = environmentSchema.parse({
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  BODY_LIMIT: env.BODY_LIMIT,
  SLOW_REQUEST_MS: env.SLOW_REQUEST_MS,
  REQUEST_TIMEOUT_MS: env.REQUEST_TIMEOUT_MS,
  MONGO_URL: env.MONGO_URL,
  DB_NAME: env.DB_NAME,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
});

export type Environment = z.infer<typeof environmentSchema>;
export { parsedEnvironment as environment };

export const {
  NODE_ENV,
  PORT,
  BODY_LIMIT,
  SLOW_REQUEST_MS,
  REQUEST_TIMEOUT_MS,
  MONGO_URL,
  DB_NAME,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = parsedEnvironment;
