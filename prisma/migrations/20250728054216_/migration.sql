/*
  Warnings:

  - Changed the type of `kakaoId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "kakaoId",
ADD COLUMN     "kakaoId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_kakaoId_key" ON "User"("kakaoId");
