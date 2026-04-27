import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentOverviewPage, type StudentOverviewPageProps } from "@/components/student/student-overview-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { formatInternshipStatusLabel } from "@/lib/internship-status";
import { prisma } from "@/lib/prisma";
import { getStudentAttachmentDownloadHref } from "@/lib/student-file-path";
import { clearSession } from "@/lib/auth/session";
import {
  getStudentProfileImageDownloadHref,
  getStudentProfileImageSrc,
} from "@/lib/student-file-path";

export const metadata: Metadata = {
  title: "ภาพรวมของนักศึกษา | ระบบจัดการฝึกงาน",
  description: "พื้นที่ของนักศึกษาสำหรับดูความคืบหน้าการฝึกงาน ข้อมูลส่วนตัว และไฟล์ที่อัปโหลด",
};

const EMPTY_VALUE = "ยังไม่ได้ระบุ";

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return EMPTY_VALUE;
  }

  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

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

export default async function InternOverviewPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    redirect(getRoleRedirectPath(session.role));
  }

  if (!session.studentHasAcceptedTos) {
    redirect(STUDENT_TOS_PATH);
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
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
    },
  });

  if (!student) {
    await clearSession();
    redirect("/login?cmu=student_profile_missing");
  }

  const canEdit = student.internshipStatus !== "completed";
  const hasStartedForm = Boolean(
    student.submittedAt ||
      student.lastStudentEditAt ||
      student.prefix ||
      student.gender ||
      student.dateOfBirth ||
      student.phoneNumber ||
      student.address ||
      student.parentPhone ||
      student.educationLevel ||
      student.institution ||
      student.faculty ||
      student.major ||
      student.coOpAdvisorName ||
      student.coOpAdvisorPhone ||
      student.internshipRecord?.position ||
      student.internshipRecord?.departmentUnit ||
      student.internshipRecord?.supervisorName ||
      student.internshipRecord?.startDate ||
      student.internshipRecord?.endDate ||
      student.internshipRecord?.additionalDetails ||
      student.files.length > 0,
  );

  const viewModel: StudentOverviewPageProps = {
    currentUser: {
      email: session.email,
      name: session.name,
    },
    student: {
      firstName: getFirstName(student),
      displayName: getDisplayName(student),
      email: student.user.email,
      status: student.internshipStatus,
      statusLabel: formatInternshipStatusLabel(student.internshipStatus),
      canEdit,
      hasStartedForm,
      completionNote:
        student.internshipStatus === "completed"
          ? "ข้อมูลฝึกงานของคุณเสร็จสมบูรณ์และเป็นแบบอ่านอย่างเดียวแล้ว"
          : null,
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
        { label: "หมายเลขโทรศัพท์", value: student.phoneNumber || EMPTY_VALUE },
        { label: "เพศ", value: formatGender(student.gender) },
        { label: "วันเกิด", value: formatDate(student.dateOfBirth) },
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
          value: formatDate(student.internshipRecord?.startDate),
        },
        {
          label: "วันสิ้นสุด",
          value: formatDate(student.internshipRecord?.endDate),
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
        const metaParts = [file.mimeType, formatFileSize(file.sizeBytes), formatDateTime(file.createdAt)].filter(Boolean);

        return {
          id: file.id,
          name: file.fileName,
          href: getStudentAttachmentDownloadHref(file.filePath),
          meta: metaParts.join(" • "),
        };
      }),
      summary: {
        lastUpdatedLabel: formatDateTime(student.lastStudentEditAt ?? student.updatedAt) ?? EMPTY_VALUE,
        submittedAtLabel: formatDateTime(student.submittedAt) ?? "ยังไม่ได้ส่ง",
      },
    },
  };

  return <StudentOverviewPage {...viewModel} />;
}