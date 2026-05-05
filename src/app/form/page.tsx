import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  createInitialStudentFormActionState,
  type StudentFormValues,
} from "@/app/form/action-state";
import { StudentFormPage, type StudentFormPageProps } from "@/components/student/student-form-page";
import { clearSession, readSession } from "@/lib/auth/session";
import { getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { formatThaiDateTime } from "@/lib/date-format";
import { prisma } from "@/lib/prisma";
import {
  getStudentAttachmentDownloadHref,
  getStudentProfileImageDownloadHref,
  getStudentProfileImageSrc,
} from "@/lib/student-file-path";

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

  if (!session.studentHasAcceptedTos) {
    redirect(STUDENT_TOS_PATH);
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      internshipStatus: true,
      submittedAt: true,
      profileImagePath: true,
      profileImageName: true,
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
          category: true,
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
        take: 1,
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
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    await clearSession();
    redirect("/login?cmu=student_profile_missing");
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
      latestReviewComment: student.reviewComments[0]
        ? {
            id: student.reviewComments[0].id,
            message: student.reviewComments[0].message,
            createdAtLabel: formatThaiDateTime(student.reviewComments[0].createdAt),
            adminLabel:
              student.reviewComments[0].admin?.name?.trim() ||
              student.reviewComments[0].admin?.email ||
              "ผู้ดูแลระบบ",
          }
        : null,
    },
    existingFiles: student.files.map((file) => {
      const metaParts = [file.mimeType, formatFileSize(file.sizeBytes), formatThaiDateTime(file.createdAt)].filter(Boolean);

      return {
        id: file.id,
        category: file.category,
        name: file.fileName,
        href: getStudentAttachmentDownloadHref(file.filePath),
        meta: metaParts.join(" • "),
      };
    }),
    profileImage:
      student.profileImagePath
        ? {
            src: getStudentProfileImageSrc(student.profileImagePath),
            name: student.profileImageName ?? "รูปโปรไฟล์นักศึกษา",
            downloadHref: getStudentProfileImageDownloadHref(student.profileImagePath),
          }
        : null,
    initialState: createInitialStudentFormActionState(initialValues),
  };

  return <StudentFormPage {...viewModel} />;
}
