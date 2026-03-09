const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const fallbackEmail = "demo@specpilot.app";

async function main() {
  const email = process.env.MOCK_USER_EMAIL ?? fallbackEmail;

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash: "mock-auth-not-enabled"
    },
    update: {}
  });

  console.log(`Seeded mock user: ${email}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
