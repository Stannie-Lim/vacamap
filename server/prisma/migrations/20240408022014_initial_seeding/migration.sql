/*
  Warnings:

  - Added the required column `lat` to the `marker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `marker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "marker" ADD COLUMN     "lat" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "lng" DECIMAL(65,30) NOT NULL;
