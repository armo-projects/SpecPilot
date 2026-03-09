-- CreateEnum
CREATE TYPE "PromptArtifactMode" AS ENUM ('CODEX_READY');

-- CreateEnum
CREATE TYPE "PromptArtifactTarget" AS ENUM ('GENERIC');

-- CreateTable
CREATE TABLE "SpecPromptArtifact" (
    "id" TEXT NOT NULL,
    "specPlanId" TEXT NOT NULL,
    "mode" "PromptArtifactMode" NOT NULL,
    "target" "PromptArtifactTarget" NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'STARTED',
    "markdown" TEXT,
    "structuredData" JSONB,
    "modelUsed" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecPromptArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecPromptArtifact_specPlanId_mode_target_key" ON "SpecPromptArtifact"("specPlanId", "mode", "target");

-- CreateIndex
CREATE INDEX "SpecPromptArtifact_specPlanId_mode_idx" ON "SpecPromptArtifact"("specPlanId", "mode");

-- AddForeignKey
ALTER TABLE "SpecPromptArtifact" ADD CONSTRAINT "SpecPromptArtifact_specPlanId_fkey" FOREIGN KEY ("specPlanId") REFERENCES "SpecPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
