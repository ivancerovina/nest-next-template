import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
  connectionString: process.env.DATABASE_URL,
}));
