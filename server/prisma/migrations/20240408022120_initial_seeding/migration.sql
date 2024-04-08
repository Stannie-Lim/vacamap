/*
  Warnings:

  - You are about to drop the column `ownerID` on the `marker` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "marker" DROP CONSTRAINT "marker_ownerID_fkey";

-- AlterTable
ALTER TABLE "marker" DROP COLUMN "ownerID";
