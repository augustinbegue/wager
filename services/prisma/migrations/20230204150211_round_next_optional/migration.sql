-- DropForeignKey
ALTER TABLE "cupRounds" DROP CONSTRAINT "cupRounds_nextId_fkey";

-- AlterTable
ALTER TABLE "cupRounds" ALTER COLUMN "nextId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cupRounds" ADD CONSTRAINT "cupRounds_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "cupRounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
