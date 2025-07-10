/*
  Warnings:

  - You are about to drop the column `contribution` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `growth` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `performance` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `skill` on the `Evaluation` table. All the data in the column will be lost.
  - Added the required column `patternId` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "EvaluationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluationId" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    CONSTRAINT "EvaluationItem_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "patternId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("comment", "createdAt", "employeeId", "grade", "id", "periodEnd", "periodStart", "totalScore", "updatedAt") SELECT "comment", "createdAt", "employeeId", "grade", "id", "periodEnd", "periodStart", "totalScore", "updatedAt" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
