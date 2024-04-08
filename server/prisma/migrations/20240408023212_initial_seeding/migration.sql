/*
  Warnings:

  - Added the required column `base64Photo` to the `photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "photo" ADD COLUMN     "base64Photo" TEXT NOT NULL;
