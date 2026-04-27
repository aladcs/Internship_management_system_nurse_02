"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveNotificationTargetPath } from "@/lib/admin/notifications";
import { clearSession, readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

async function requireAdminSession() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  return session;
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function markAllNotificationsReadAction() {
  const session = await requireAdminSession();

  await prisma.adminNotificationReceipt.updateMany({
    where: {
      adminUserId: session.userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidatePath("/intern/dashboard");
  revalidatePath("/intern/admin/students");
  revalidatePath("/intern/notifications");
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireAdminSession();
  const notificationEventId = String(formData.get("notificationEventId") ?? "").trim();
  const fallbackTargetPath = String(formData.get("targetPath") ?? "/intern/admin/students").trim();

  if (!notificationEventId) {
    redirect(fallbackTargetPath || "/intern/admin/students");
  }

  const receipt = await prisma.adminNotificationReceipt.findFirst({
    where: {
      adminUserId: session.userId,
      notificationEventId,
    },
    select: {
      id: true,
      isRead: true,
      notificationEvent: {
        select: {
          targetPath: true,
          entityId: true,
          entityType: true,
        },
      },
    },
  });

  if (receipt && !receipt.isRead) {
    await prisma.adminNotificationReceipt.update({
      where: {
        id: receipt.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  revalidatePath("/intern/dashboard");
  revalidatePath("/intern/admin/students");
  revalidatePath("/intern/notifications");

  redirect(
    receipt
      ? resolveNotificationTargetPath(receipt.notificationEvent)
      : fallbackTargetPath || "/intern/admin/students",
  );
}