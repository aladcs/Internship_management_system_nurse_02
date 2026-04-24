import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { resolveStoredAssetAbsolutePath } from "@/lib/student-file-path";

function isSafeSegment(value: string) {
  return value.length > 0 && !value.includes("/") && !value.includes("\\") && value !== "." && value !== "..";
}

async function canAccessStudentAsset(studentId: string) {
  const session = await readSession();

  if (!session) {
    return false;
  }

  if (session.role === "admin") {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    return Boolean(student);
  }

  if (session.role !== "student") {
    return false;
  }

  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      userId: session.userId,
    },
    select: { id: true },
  });

  return Boolean(student);
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      studentId: string;
      fileName: string;
    }>;
  },
) {
  const { studentId, fileName } = await context.params;

  if (!isSafeSegment(studentId) || !isSafeSegment(fileName)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (!(await canAccessStudentAsset(studentId))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      profileImagePath: true,
    },
  });

  if (!student?.profileImagePath || !student.profileImagePath.endsWith(`/${fileName}`)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const absolutePath = resolveStoredAssetAbsolutePath(student.profileImagePath);

  if (!absolutePath) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    await access(absolutePath);
    const fileBuffer = await readFile(absolutePath);
    const shouldDownload = new URL(request.url).searchParams.get("download") === "1";
    const ext = path.extname(fileName).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        ...(shouldDownload
          ? {
              "Content-Disposition": `attachment; filename="${fileName.replace(/"/g, "")}"`,
            }
          : {}),
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}