import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

const envFiles = [".env", ".env.local"];

if (typeof process.loadEnvFile === "function") {
  for (const file of envFiles) {
    const filePath = resolve(process.cwd(), file);
    if (existsSync(filePath)) {
      process.loadEnvFile(filePath);
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  }
});
