/*
  Warnings:

  - You are about to drop the `Pokemon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pokemon" DROP CONSTRAINT "Pokemon_ownerId_fkey";

-- DropTable
DROP TABLE "Pokemon";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "markerID" TEXT NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marker" (
    "id" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,

    CONSTRAINT "marker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_markerID_fkey" FOREIGN KEY ("markerID") REFERENCES "marker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marker" ADD CONSTRAINT "marker_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
