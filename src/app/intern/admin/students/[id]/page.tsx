import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminStudentDetailPage, type AdminStudentDetailPageProps } from "@/components/admin/admin-student-detail-page";
import { readSession } from "@/lib/auth/session";
import { formatThaiDate, formatThaiDateTime } from "@/lib/date-format";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import {
  formatInternshipStatusLabel,
  getAllowedAdminStatusTransitions,
  getAdminStatusTransitionBlockReason,
} from "@/lib/internship-status";
import { prisma } from "@/lib/prisma";
import {
  getStudentAttachmentDownloadHref,
  getStudentProfileImageDownloadHref,
  getStudentProfileImageSrc,
} from "@/lib/student-file-path";

export const metadata: Metadata = {
  title: "รายละเอียดนักศึกษา | ระบบจัดการฝึกงาน",
  description: "มุมมองสำหรับผู้ดูแลเพื่อตรวจสอบข้อมูลฝึกงานของนักศึกษาและอัปเดตสถานะ",
};

const EMPTY_VALUE = "ยังไม่ได้ระบุ";

function formatGender(value: string | null) {
  if (!value) {
    return EMPTY_VALUE;
  }

  const labels: Record<string, string> = {
    male: "ชาย",
    female: "หญิง",
    other: "อื่น ๆ",
    prefer_not_to_say: "ไม่ระบุ",
  };

  return labels[value] ?? EMPTY_VALUE;
}

function formatEducationLevel(value: string | null) {
  if (!value) {
    return EMPTY_VALUE;
  }

  const labels: Record<string, string> = {
    diploma: "ประกาศนียบัตร",
    bachelor: "ปริญญาตรี",
    master: "ปริญญาโท",
    doctorate: "ปริญญาเอก",
    other: "อื่น ๆ",
  };

  return labels[value] ?? EMPTY_VALUE;
}

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes || sizeBytes <= 0) {
    return null;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDisplayName(student: {
  firstName: string | null;
  lastName: string | null;
  user: {
    name: string | null;
    email: string;
  };
}) {
  const profileName = [student.firstName, student.lastName].filter(Boolean).join(" ").trim();

  return student.user.name?.trim() || profileName || student.user.email;
}

function getFirstName(student: {
  firstName: string | null;
  user: {
    name: string | null;
    email: string;
  };
}) {
  if (student.firstName?.trim()) {
    return student.firstName.trim();
  }

  if (student.user.name?.trim()) {
    return student.user.name.trim().split(/\s+/)[0] ?? student.user.name.trim();
  }

  return student.user.email.split("@")[0];
}

export default async function InternAdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      internshipStatus: true,
      prefix: true,
      firstName: true,
      lastName: true,
      gender: true,
      dateOfBirth: true,
      phoneNumber: true,
      address: true,
      parentPhone: true,
      educationLevel: true,
      institution: true,
      faculty: true,
      major: true,
      coOpAdvisorName: true,
      coOpAdvisorPhone: true,
      submittedAt: true,
      lastStudentEditAt: true,
      updatedAt: true,
      profileImagePath: true,
      profileImageName: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      internshipRecord: {
        select: {
          position: true,
          departmentUnit: true,
          supervisorName: true,
          startDate: true,
          endDate: true,
          additionalDetails: true,
        },
      },
      files: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          fileName: true,
          filePath: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
      reviewComments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          message: true,
          createdAt: true,
          admin: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      activityLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          action: true,
          message: true,
          createdAt: true,
          actor: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  if (!student.submittedAt) {
    notFound();
  }

  const latestActivity = student.activityLogs[0] ?? null;
  const latestUpdateMoment = latestActivity?.createdAt ?? student.lastStudentEditAt ?? student.updatedAt;
  const latestUpdateActor = latestActivity?.actor ?? null;
  const latestUpdateActorLabel = latestUpdateActor?.name?.trim() || latestUpdateActor?.email || (latestActivity ? "ระบบ" : null);

  const viewModel: AdminStudentDetailPageProps = {
    currentUser: {
      email: session.email,
      name: session.name,
    },
    student: {
      id: student.id,
      firstName: getFirstName(student),
      displayName: getDisplayName(student),
      email: student.user.email,
      status: student.internshipStatus,
      hasSubmitted: Boolean(student.submittedAt),
      statusLabel: formatInternshipStatusLabel(student.internshipStatus),
      completionNote:
        student.internshipStatus === "completed"
          ? "ข้อมูลฝึกงานนี้เสร็จสมบูรณ์แล้วและนักศึกษาไม่สามารถแก้ไขได้"
          : null,
      statusControl: {
          allowedTransitions: getAllowedAdminStatusTransitions(student.internshipStatus),
        blockReason: getAdminStatusTransitionBlockReason({
          status: student.internshipStatus,
          submittedAt: student.submittedAt,
        }),
      },
      profileImage:
        student.profileImagePath
          ? {
              src: getStudentProfileImageSrc(student.profileImagePath),
              name: student.profileImageName ?? "รูปโปรไฟล์นักศึกษา",
              downloadHref: getStudentProfileImageDownloadHref(student.profileImagePath),
            }
          : null,
      personal: [
        { label: "ชื่อ - นามสกุล", value: getDisplayName(student) },
        { label: "อีเมล", value: student.user.email },
        { label: "คำนำหน้า", value: student.prefix || EMPTY_VALUE },
        { label: "หมายเลขโทรศัพท์", value: student.phoneNumber || EMPTY_VALUE },
        { label: "เพศ", value: formatGender(student.gender) },
        { label: "วันเกิด", value: formatThaiDate(student.dateOfBirth, EMPTY_VALUE) },
        { label: "ที่อยู่", value: student.address || EMPTY_VALUE },
        { label: "เบอร์โทรผู้ปกครอง", value: student.parentPhone || EMPTY_VALUE },
      ],
      internship: [
        {
          label: "สถานะการฝึกงาน",
          value: formatInternshipStatusLabel(student.internshipStatus),
        },
        {
          label: "ตำแหน่ง",
          value: student.internshipRecord?.position || EMPTY_VALUE,
        },
        {
          label: "แผนก / หน่วยงาน",
          value: student.internshipRecord?.departmentUnit || EMPTY_VALUE,
        },
        {
          label: "ผู้ดูแล",
          value: student.internshipRecord?.supervisorName || EMPTY_VALUE,
        },
        {
          label: "วันเริ่มต้น",
          value: formatThaiDate(student.internshipRecord?.startDate, EMPTY_VALUE),
        },
        {
          label: "วันสิ้นสุด",
          value: formatThaiDate(student.internshipRecord?.endDate, EMPTY_VALUE),
        },
        {
          label: "รายละเอียดเพิ่มเติม",
          value: student.internshipRecord?.additionalDetails || EMPTY_VALUE,
        },
      ],
      education: [
        {
          label: "ระดับการศึกษา",
          value: formatEducationLevel(student.educationLevel),
        },
        { label: "สถาบัน", value: student.institution || EMPTY_VALUE },
        { label: "คณะ", value: student.faculty || EMPTY_VALUE },
        { label: "สาขาวิชา", value: student.major || EMPTY_VALUE },
        {
          label: "อาจารย์ที่ปรึกษาสหกิจ",
          value: student.coOpAdvisorName || EMPTY_VALUE,
        },
        {
          label: "เบอร์โทรอาจารย์ที่ปรึกษา",
          value: student.coOpAdvisorPhone || EMPTY_VALUE,
        },
      ],
      files: student.files.map((file) => {
        const metaParts = [file.mimeType, formatFileSize(file.sizeBytes), formatThaiDateTime(file.createdAt)].filter(Boolean);

        return {
          id: file.id,
          name: file.fileName,
          href: getStudentAttachmentDownloadHref(file.filePath),
          meta: metaParts.join(" • "),
        };
      }),
      reviewHistory: student.reviewComments.map((comment) => ({
        id: comment.id,
        message: comment.message,
        createdAtLabel: formatThaiDateTime(comment.createdAt, EMPTY_VALUE),
        adminLabel: comment.admin?.name?.trim() || comment.admin?.email || "ผู้ดูแลที่ถูกลบ",
      })),
      activityLog: student.activityLogs.map((entry) => ({
        id: entry.id,
        action: entry.action,
        message: entry.message,
        createdAtLabel: formatThaiDateTime(entry.createdAt, EMPTY_VALUE),
        actorLabel: entry.actor?.name?.trim() || entry.actor?.email || "ระบบ",
      })),
      summary: {
        lastUpdatedLabel: formatThaiDateTime(latestUpdateMoment, EMPTY_VALUE),
        lastUpdatedByLabel: latestUpdateActorLabel,
        lastUpdatedByEmail: latestUpdateActor?.email ?? null,
        submittedAtLabel: formatThaiDateTime(student.submittedAt, "ยังไม่ได้ส่ง"),
      },
    },
  };

  return <AdminStudentDetailPage {...viewModel} />;
}