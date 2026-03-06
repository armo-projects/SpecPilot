import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import type { DomainUser } from "@/types/domain";

const MOCK_PASSWORD_PLACEHOLDER = "mock-auth-not-enabled";

export async function getOrCreateMockUser(): Promise<DomainUser> {
  const user = await db.user.upsert({
    where: { email: env.MOCK_USER_EMAIL },
    create: {
      email: env.MOCK_USER_EMAIL,
      passwordHash: MOCK_PASSWORD_PLACEHOLDER
    },
    update: {}
  });

  return user;
}
