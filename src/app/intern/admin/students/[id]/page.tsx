import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminStudentDetailPage, type AdminStudentDetailPageProps } from "@/components/admin/admin-student-detail-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Student Detail | Internship Management System",
  description: "Admin view for reviewing a student's internship record and updating status.",
};

const EMPTY_VALUE = "Not provided";

function formatStatusLabel(status: AdminStudentDetailPageProps["student"]["status"]) {
  if (status === "in_progress") {
    return "In Progress";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return EMPTY_VALUE;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatGender(value: string | null) {
  if (!value) {
    return EMPTY_VALUE;
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatEducationLevel(value: string | null) {
  if (!value) {
    return EMPTY_VALUE;
  }

  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
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
    notFound();
  }

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
      statusLabel: formatStatusLabel(student.internshipStatus),
      completionNote:
        student.internshipStatus === "completed"
          ? "This internship record is complete and locked for student edits."
          : null,
      personal: [
        { label: "Full name", value: getDisplayName(student) },
        { label: "Email", value: student.user.email },
        { label: "Prefix", value: student.prefix || EMPTY_VALUE },
        { label: "Phone number", value: student.phoneNumber || EMPTY_VALUE },
        { label: "Gender", value: formatGender(student.gender) },
        { label: "Date of birth", value: formatDate(student.dateOfBirth) },
        { label: "Address", value: student.address || EMPTY_VALUE },
        { label: "Parent phone", value: student.parentPhone || EMPTY_VALUE },
      ],
      internship: [
        {
          label: "Internship status",
          value: formatStatusLabel(student.internshipStatus),
        },
        {
          label: "Position",
          value: student.internshipRecord?.position || EMPTY_VALUE,
        },
        {
          label: "Department / unit",
          value: student.internshipRecord?.departmentUnit || EMPTY_VALUE,
        },
        {
          label: "Supervisor",
          value: student.internshipRecord?.supervisorName || EMPTY_VALUE,
        },
        {
          label: "Start date",
          value: formatDate(student.internshipRecord?.startDate),
        },
        {
          label: "End date",
          value: formatDate(student.internshipRecord?.endDate),
        },
        {
          label: "Additional details",
          value: student.internshipRecord?.additionalDetails || EMPTY_VALUE,
        },
      ],
      education: [
        {
          label: "Education level",
          value: formatEducationLevel(student.educationLevel),
        },
        { label: "Institution", value: student.institution || EMPTY_VALUE },
        { label: "Faculty", value: student.faculty || EMPTY_VALUE },
        { label: "Major", value: student.major || EMPTY_VALUE },
        {
          label: "Co-op advisor",
          value: student.coOpAdvisorName || EMPTY_VALUE,
        },
        {
          label: "Advisor phone",
          value: student.coOpAdvisorPhone || EMPTY_VALUE,
        },
      ],
      files: student.files.map((file) => {
        const metaParts = [file.mimeType, formatFileSize(file.sizeBytes), formatDateTime(file.createdAt)].filter(Boolean);

        return {
          id: file.id,
          name: file.fileName,
          href: file.filePath,
          meta: metaParts.join(" • "),
        };
      }),
      summary: {
        lastUpdatedLabel: formatDateTime(student.lastStudentEditAt ?? student.updatedAt) ?? EMPTY_VALUE,
        submittedAtLabel: formatDateTime(student.submittedAt) ?? "Not submitted yet",
      },
    },
  };

  return <AdminStudentDetailPage {...viewModel} />;
}