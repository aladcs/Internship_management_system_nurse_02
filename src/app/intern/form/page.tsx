import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  createInitialStudentFormActionState,
  type StudentFormValues,
} from "@/app/intern/form/action-state";
import { StudentFormPage, type StudentFormPageProps } from "@/components/student/student-form-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แบบฟอร์มนักศึกษา | ระบบจัดการฝึกงาน",
  description: "แบบฟอร์มสำหรับส่งและแก้ไขข้อมูลการฝึกงานของนักศึกษา",
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

export default async function InternFormPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    redirect(getRoleRedirectPath(session.role));
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
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
      displayName:
        student.user.name?.trim() ||
        [student.firstName, student.lastName].filter(Boolean).join(" ").trim() ||
        student.user.email,
      email: student.user.email,
      status: student.internshipStatus,
      isReadOnly: student.internshipStatus === "completed",
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
  };

  return <StudentFormPage {...viewModel} />;
}