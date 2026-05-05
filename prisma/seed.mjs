import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed login users.");
  }

  return process.env.DATABASE_URL;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(getDatabaseUrl()),
});

function getSeedLoginPassword() {
  const password = process.env.SEED_LOGIN_PASSWORD?.trim();

  if (!password) {
    throw new Error("SEED_LOGIN_PASSWORD is required to seed login users.");
  }

  return password;
}

const defaultPassword = getSeedLoginPassword();

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

async function backfillAdminNotificationReceipts() {
  const [admins, notificationEvents] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
      },
    }),
    prisma.notificationEvent.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  if (admins.length === 0 || notificationEvents.length === 0) {
    return 0;
  }

  const existingReceipts = await prisma.adminNotificationReceipt.findMany({
    where: {
      adminUserId: {
        in: admins.map((admin) => admin.id),
      },
      notificationEventId: {
        in: notificationEvents.map((notificationEvent) => notificationEvent.id),
      },
    },
    select: {
      adminUserId: true,
      notificationEventId: true,
    },
  });

  const existingReceiptKeys = new Set(
    existingReceipts.map((receipt) => `${receipt.adminUserId}:${receipt.notificationEventId}`),
  );

  const receiptsToCreate = notificationEvents.flatMap((notificationEvent) => (
    admins.flatMap((admin) => {
      const key = `${admin.id}:${notificationEvent.id}`;

      if (existingReceiptKeys.has(key)) {
        return [];
      }

      return [{
        id: randomUUID(),
        adminUserId: admin.id,
        notificationEventId: notificationEvent.id,
        createdAt: notificationEvent.createdAt,
        updatedAt: notificationEvent.updatedAt,
      }];
    })
  ));

  if (receiptsToCreate.length === 0) {
    return 0;
  }

  await prisma.adminNotificationReceipt.createMany({
    data: receiptsToCreate,
    skipDuplicates: true,
  });

  return receiptsToCreate.length;
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

  const createdReceiptCount = await backfillAdminNotificationReceipts();

  console.log("Seeded login users:");
  console.log(`- super_admin: nupong.pr@cmu.ac.th / ${defaultPassword}`);
  console.log(`- admin: admin.demo@cmu.ac.th / ${defaultPassword}`);
  console.log(`- student: student.demo@cmu.ac.th / ${defaultPassword}`);
  console.log(`- backfilled notification receipts for admins: ${createdReceiptCount}`);
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
