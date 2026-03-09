const fallbackEmail = "demo@specpilot.app";

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const email = process.env.MOCK_USER_EMAIL ?? fallbackEmail;

  try {
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash: "mock-auth-not-enabled"
      },
      update: {}
    });

    console.log(`Seeded mock user: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
