-- CreateEnum
CREATE TYPE "SpecStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SpecPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('STARTED', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spec" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawPrompt" TEXT NOT NULL,
    "context" TEXT,
    "priority" "SpecPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "SpecStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecPlan" (
    "id" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "summary" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "frontendTasks" JSONB NOT NULL,
    "backendTasks" JSONB NOT NULL,
    "databaseSchema" JSONB NOT NULL,
    "apiEndpoints" JSONB NOT NULL,
    "edgeCases" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,
    "risks" JSONB NOT NULL,
    "rawAiResponse" JSONB NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationRun" (
    "id" TEXT NOT NULL,
    "specId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "tokensUsed" INTEGER,
    "latencyMs" INTEGER,

    CONSTRAINT "GenerationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Spec_userId_createdAt_idx" ON "Spec"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SpecPlan_specId_createdAt_idx" ON "SpecPlan"("specId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpecPlan_specId_version_key" ON "SpecPlan"("specId", "version");

-- CreateIndex
CREATE INDEX "GenerationRun_specId_startedAt_idx" ON "GenerationRun"("specId", "startedAt");

-- AddForeignKey
ALTER TABLE "Spec" ADD CONSTRAINT "Spec_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecPlan" ADD CONSTRAINT "SpecPlan_specId_fkey" FOREIGN KEY ("specId") REFERENCES "Spec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationRun" ADD CONSTRAINT "GenerationRun_specId_fkey" FOREIGN KEY ("specId") REFERENCES "Spec"("id") ON DELETE CASCADE ON UPDATE CASCADE;
