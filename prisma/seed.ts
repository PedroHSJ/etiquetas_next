import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const seedFile = path.join(
    __dirname,
    "../supabase/seeds/001_initial_data.sql",
  );
  const sql = fs.readFileSync(seedFile, "utf8");

  console.log("Seeding database from", seedFile);

  // Split SQL commands by semicolon (simple split, assumes valid SQL with no complex delimiters)
  // Or execute the whole file if prisma.$executeRawUnsafe handles multiple statements
  // Prisma usually recommends one statement per call, but simpler seeds often work.
  // For safety, let's execute the raw SQL directly. PostgreSQL driver usually handles multiple statements.

  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("Seed executed successfully");
  } catch (e) {
    console.error("Error executing seed:", e);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
