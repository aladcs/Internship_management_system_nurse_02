import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

function isSafeSegment(value: string) {
  return value.length > 0 && !value.includes("/") && !value.includes("\\") && value !== "." && value !== "..";
}

export async function GET(
  _request: Request,
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

  const absolutePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "student-profile-images",
    studentId,
    fileName,
  );

  try {
    await access(absolutePath);
    const fileBuffer = await readFile(absolutePath);
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
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}