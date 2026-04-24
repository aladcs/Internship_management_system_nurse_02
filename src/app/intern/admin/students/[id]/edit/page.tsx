import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  createInitialStudentFormActionState,
  type StudentFormValues,
} from "@/app/intern/form/action-state";
import { saveStudentFormAction } from "@/app/intern/form/actions";
import { logoutAction } from "@/app/intern/admin/students/actions";
import { StudentFormPage, type StudentFormPageProps } from "@/components/student/student-form-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แก้ไขข้อมูลนักศึกษา | ระบบจัดการฝึกงาน",
  description: "มุมมองสำหรับผู้ดูแลเพื่อแก้ไขข้อมูลฝึกงานของนักศึกษา",
};

function formatDateInput(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

function formatFileDate(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
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

export default async function InternAdminStudentEditPage({
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
      submittedAt: true,
      firstName: true,
      lastName: true,
      prefix: true,
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
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const initialValues: StudentFormValues = {
    prefix: student.prefix ?? "",
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    gender: student.gender ?? "",
    dateOfBirth: formatDateInput(student.dateOfBirth),
    phoneNumber: student.phoneNumber ?? "",
    address: student.address ?? "",
    parentPhone: student.parentPhone ?? "",
    educationLevel: student.educationLevel ?? "",
    institution: student.institution ?? "",
    faculty: student.faculty ?? "",
    major: student.major ?? "",
    coOpAdvisorName: student.coOpAdvisorName ?? "",
    coOpAdvisorPhone: student.coOpAdvisorPhone ?? "",
    position: student.internshipRecord?.position ?? "",
    departmentUnit: student.internshipRecord?.departmentUnit ?? "",
    supervisorName: student.internshipRecord?.supervisorName ?? "",
    startDate: formatDateInput(student.internshipRecord?.startDate),
    endDate: formatDateInput(student.internshipRecord?.endDate),
    additionalDetails: student.internshipRecord?.additionalDetails ?? "",
  };

  const viewModel: StudentFormPageProps = {
    currentUser: {
      email: session.email,
      name: session.name,
    },
    student: {
      displayName: getDisplayName(student),
      email: student.user.email,
      status: student.internshipStatus,
      isReadOnly: false,
      hasSubmitted: Boolean(student.submittedAt),
    },
    existingFiles: student.files.map((file) => {
      const metaParts = [file.mimeType, formatFileSize(file.sizeBytes), formatFileDate(file.createdAt)].filter(Boolean);

      return {
        id: file.id,
        name: file.fileName,
        meta: metaParts.join(" • "),
      };
    }),
    initialState: createInitialStudentFormActionState(initialValues),
    mode: "admin",
    backHref: `/intern/admin/students/${student.id}`,
    backLabel: "กลับไปหน้ารายละเอียดนักศึกษา",
    cancelHref: `/intern/admin/students/${student.id}`,
    saveAction: saveStudentFormAction,
    logoutAction,
    hiddenFields: [
      {
        name: "studentId",
        value: student.id,
      },
    ],
  };

  return <StudentFormPage {...viewModel} />;
}