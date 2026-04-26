import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().min(1).max(65535).default(3000),

  MONGO_URL: z
    .string()
    .url({
      message: "MONGO_URL must be a valid MongoDB connection URL",
    })
    .optional(),

  DB_NAME: z.string().min(1, "DB_NAME is required").default("ecommerce"),
});

const env = process.env;
const parsedEnvironment = environmentSchema.parse({
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  MONGO_URL: env.MONGO_URL,
  DB_NAME: env.DB_NAME,
});

const environment = environmentSchema.parse(process.env);

export type Environment = z.infer<typeof environmentSchema>;
export { parsedEnvironment as environment };

export const { NODE_ENV, PORT, MONGO_URL, DB_NAME } = parsedEnvironment;
