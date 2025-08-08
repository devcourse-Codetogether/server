/*
  Warnings:

  - You are about to drop the column `chatLogs` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `isEnded` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Session" DROP COLUMN "chatLogs",
DROP COLUMN "isEnded";

-- CreateTable
CREATE TABLE "public"."CodeDoc" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "binaryDoc" BYTEA NOT NULL,

    CONSTRAINT "CodeDoc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CodeDoc" ADD CONSTRAINT "CodeDoc_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
