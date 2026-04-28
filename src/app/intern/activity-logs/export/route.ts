import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import {
  filterAdminActivityLogs,
  getActorRoleLabel,
  type ActivityCategoryFilter,
  type ActivityRoleFilter,
} from "@/lib/admin/activity-log-shared";
import { getAdminActivityLogPageData } from "@/lib/admin/activity-logs";
import { readSession } from "@/lib/auth/session";

function normalizeRoleFilter(value: string | null): ActivityRoleFilter {
  if (value === "admin" || value === "student") {
    return value;
  }

  return "all";
}

function normalizeCategoryFilter(value: string | null): ActivityCategoryFilter {
  if (value === "submission" || value === "edit" || value === "file" || value === "status" || value === "other") {
    return value;
  }

  return "all";
}

function formatTimestampForFileName(date = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";

  return `${getPart("year")}${getPart("month")}${getPart("day")}-${getPart("hour")}${getPart("minute")}`;
}

export async function GET(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const roleFilter = normalizeRoleFilter(searchParams.get("role"));
  const categoryFilter = normalizeCategoryFilter(searchParams.get("category"));
  const query = searchParams.get("q");

  const activityLogPageData = await getAdminActivityLogPageData();
  const exportedLogs = filterAdminActivityLogs(activityLogPageData.activityLogs, {
    query,
    role: roleFilter,
    category: categoryFilter,
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GitHub Copilot";
  workbook.created = new Date();
  workbook.modified = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "หัวข้อ", key: "label", width: 24 },
    { header: "ค่า", key: "value", width: 48 },
  ];
  summarySheet.addRows([
    { label: "ส่งออกเมื่อ", value: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) },
    { label: "ผู้ส่งออก", value: session.name?.trim() || session.email },
    { label: "จำนวนรายการ", value: exportedLogs.length.toString() },
    { label: "บทบาทที่กรอง", value: roleFilter },
    { label: "ประเภทกิจกรรมที่กรอง", value: categoryFilter },
    { label: "คำค้นหา", value: query?.trim() || "-" },
  ]);
  summarySheet.getRow(1).font = { bold: true };

  const sheet = workbook.addWorksheet("Activity Logs", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "เวลา", key: "createdAtLabel", width: 24 },
    { header: "เวลาย่อ", key: "relativeTimeLabel", width: 18 },
    { header: "ผู้ดำเนินการ", key: "actorLabel", width: 26 },
    { header: "อีเมลผู้ดำเนินการ", key: "actorEmail", width: 32 },
    { header: "บทบาท", key: "actorRoleLabel", width: 18 },
    { header: "ประเภทกิจกรรม", key: "actionCategoryLabel", width: 20 },
    { header: "Action", key: "actionLabel", width: 28 },
    { header: "ข้อความกิจกรรม", key: "message", width: 56 },
    { header: "นักศึกษา", key: "studentLabel", width: 28 },
    { header: "อีเมลนักศึกษา", key: "studentEmail", width: 32 },
    { header: "ลิงก์รายละเอียด", key: "targetPath", width: 36 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFAA74AB" },
  };
  sheet.autoFilter = {
    from: "A1",
    to: "K1",
  };

  exportedLogs.forEach((entry) => {
    sheet.addRow({
      createdAtLabel: entry.createdAtLabel,
      relativeTimeLabel: entry.relativeTimeLabel,
      actorLabel: entry.actorLabel,
      actorEmail: entry.actorEmail ?? "-",
      actorRoleLabel: getActorRoleLabel(entry.actorRole),
      actionCategoryLabel: entry.actionCategoryLabel,
      actionLabel: entry.actionLabel,
      message: entry.message,
      studentLabel: entry.studentLabel,
      studentEmail: entry.studentEmail,
      targetPath: entry.targetPath,
    });
  });

  sheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: "top", wrapText: true };

    if (rowNumber > 1) {
      row.height = 28;
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `activity-logs-${formatTimestampForFileName()}.xlsx`;

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}