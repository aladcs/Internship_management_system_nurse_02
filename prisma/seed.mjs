import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed login users.");
  }

  return process.env.DATABASE_URL;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(getDatabaseUrl()),
});
const defaultPassword = process.env.SEED_LOGIN_PASSWORD ?? "Password123!";

async function upsertUser({ email, name, role, createdById }) {
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      createdById,
      passwordHash,
    },
    create: {
      email,
      name,
      role,
      createdById,
      passwordHash,
    },
  });
}

async function main() {
  const superAdmin = await upsertUser({
    email: "nupong.pr@cmu.ac.th",
    name: "Nupong Pr",
    role: "super_admin",
    createdById: null,
  });

  const admin = await upsertUser({
    email: "admin.demo@cmu.ac.th",
    name: "Demo Admin",
    role: "admin",
    createdById: superAdmin.id,
  });

  const student = await upsertUser({
    email: "student.demo@cmu.ac.th",
    name: "Demo Student",
    role: "student",
    createdById: admin.id,
  });

  await prisma.student.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      firstName: "Demo",
      lastName: "Student",
    },
  });

  console.log("Seeded login users:");
  console.log(`- super_admin: nupong.pr@cmu.ac.th / ${defaultPassword}`);
  console.log(`- admin: admin.demo@cmu.ac.th / ${defaultPassword}`);
  console.log(`- student: student.demo@cmu.ac.th / ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed login users.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });