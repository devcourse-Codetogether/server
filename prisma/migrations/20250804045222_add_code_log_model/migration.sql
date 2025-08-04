/*
  Warnings:

  - You are about to drop the column `codeLogs` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "codeLogs";

-- CreateTable
CREATE TABLE "CodeLog" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeLog_sessionId_idx" ON "CodeLog"("sessionId");

-- CreateIndex
CREATE INDEX "CodeLog_senderId_idx" ON "CodeLog"("senderId");

-- AddForeignKey
ALTER TABLE "CodeLog" ADD CONSTRAINT "CodeLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeLog" ADD CONSTRAINT "CodeLog_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
