"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type EducationLevel,
  type Gender,
  type NotificationType,
  type UserRole,
} from "@prisma/client";
import {
  type StudentFormActionState,
  type StudentFormFieldErrors,
  type StudentFormValues,
} from "@/app/intern/form/action-state";
import { clearSession, readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

const GENDER_VALUES = ["male", "female", "other", "prefer_not_to_say"] as const;
const EDUCATION_LEVEL_VALUES = ["diploma", "bachelor", "master", "doctorate", "other"] as const;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function getFormValues(formData: FormData): StudentFormValues {
  return {
    prefix: normalizeText(formData.get("prefix")),
    firstName: normalizeText(formData.get("firstName")),
    lastName: normalizeText(formData.get("lastName")),
    gender: normalizeText(formData.get("gender")),
    dateOfBirth: normalizeText(formData.get("dateOfBirth")),
    phoneNumber: normalizeText(formData.get("phoneNumber")),
    address: normalizeText(formData.get("address")),
    parentPhone: normalizeText(formData.get("parentPhone")),
    educationLevel: normalizeText(formData.get("educationLevel")),
    institution: normalizeText(formData.get("institution")),
    faculty: normalizeText(formData.get("faculty")),
    major: normalizeText(formData.get("major")),
    coOpAdvisorName: normalizeText(formData.get("coOpAdvisorName")),
    coOpAdvisorPhone: normalizeText(formData.get("coOpAdvisorPhone")),
    position: normalizeText(formData.get("position")),
    departmentUnit: normalizeText(formData.get("departmentUnit")),
    supervisorName: normalizeText(formData.get("supervisorName")),
    startDate: normalizeText(formData.get("startDate")),
    endDate: normalizeText(formData.get("endDate")),
    additionalDetails: normalizeText(formData.get("additionalDetails")),
  };
}

function isPhoneNumber(value: string) {
  return /^[0-9+()\-\s]{8,20}$/.test(value);
}

function parseDate(value: string, fieldName: keyof StudentFormValues, fieldErrors: StudentFormFieldErrors) {
  if (!value) {
    fieldErrors[fieldName] = "This field is required.";
    return null;
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    fieldErrors[fieldName] = "Enter a valid date.";
    return null;
  }

  return parsed;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function requireStudentSession() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== ("student" satisfies UserRole)) {
    redirect(getRoleRedirectPath(session.role));
  }

  return session;
}

async function createNotificationEvent(input: {
  studentId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetPath: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: "admin",
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    return;
  }

  await prisma.notificationEvent.create({
    data: {
      studentId: input.studentId,
      type: input.type,
      title: input.title,
      message: input.message,
      targetPath: input.targetPath,
      receipts: {
        createMany: {
          data: admins.map((admin) => ({
            adminUserId: admin.id,
          })),
        },
      },
    },
  });
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function saveStudentFormAction(
  _previousState: StudentFormActionState,
  formData: FormData,
): Promise<StudentFormActionState> {
  const session = await requireStudentSession();
  const values = getFormValues(formData);
  const fieldErrors: StudentFormFieldErrors = {};

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      id: true,
      submittedAt: true,
      internshipStatus: true,
      files: {
        select: {
          id: true,
          filePath: true,
        },
      },
    },
  });

  if (!student) {
    redirect("/intern/overview");
  }

  if (student.internshipStatus === "completed") {
    redirect("/intern/overview");
  }

  if (!values.firstName) {
    fieldErrors.firstName = "Enter your first name.";
  }

  if (!values.lastName) {
    fieldErrors.lastName = "Enter your last name.";
  }

  if (!values.gender || !GENDER_VALUES.includes(values.gender as Gender)) {
    fieldErrors.gender = "Select your gender.";
  }

  const dateOfBirth = parseDate(values.dateOfBirth, "dateOfBirth", fieldErrors);

  if (!values.phoneNumber) {
    fieldErrors.phoneNumber = "Enter your phone number.";
  } else if (!isPhoneNumber(values.phoneNumber)) {
    fieldErrors.phoneNumber = "Enter a valid phone number.";
  }

  if (!values.address) {
    fieldErrors.address = "Enter your address.";
  }

  if (!values.parentPhone) {
    fieldErrors.parentPhone = "Enter your parent phone number.";
  } else if (!isPhoneNumber(values.parentPhone)) {
    fieldErrors.parentPhone = "Enter a valid phone number.";
  }

  if (!values.educationLevel || !EDUCATION_LEVEL_VALUES.includes(values.educationLevel as EducationLevel)) {
    fieldErrors.educationLevel = "Select your education level.";
  }

  if (!values.institution) {
    fieldErrors.institution = "Enter your institution.";
  }

  if (!values.faculty) {
    fieldErrors.faculty = "Enter your faculty.";
  }

  if (!values.major) {
    fieldErrors.major = "Enter your major.";
  }

  if (!values.coOpAdvisorName) {
    fieldErrors.coOpAdvisorName = "Enter your co-op advisor name.";
  }

  if (!values.coOpAdvisorPhone) {
    fieldErrors.coOpAdvisorPhone = "Enter your co-op advisor phone.";
  } else if (!isPhoneNumber(values.coOpAdvisorPhone)) {
    fieldErrors.coOpAdvisorPhone = "Enter a valid phone number.";
  }

  if (!values.position) {
    fieldErrors.position = "Enter your internship position.";
  }

  if (!values.departmentUnit) {
    fieldErrors.departmentUnit = "Enter the department or unit.";
  }

  if (!values.supervisorName) {
    fieldErrors.supervisorName = "Enter your supervisor name.";
  }

  const startDate = parseDate(values.startDate, "startDate", fieldErrors);
  const endDate = parseDate(values.endDate, "endDate", fieldErrors);

  if (dateOfBirth && dateOfBirth > new Date()) {
    fieldErrors.dateOfBirth = "Date of birth must be in the past.";
  }

  if (startDate && endDate && endDate < startDate) {
    fieldErrors.endDate = "End date must be on or after the start date.";
  }

  const removeFileIds = Array.from(
    new Set(
      formData
        .getAll("removeFileIds")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  const newFiles = formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const remainingExistingFileCount = student.files.filter((file) => !removeFileIds.includes(file.id)).length;

  if (remainingExistingFileCount + newFiles.length > MAX_FILE_COUNT) {
    fieldErrors.files = `You can keep up to ${MAX_FILE_COUNT} files in total.`;
  }

  for (const file of newFiles) {
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      fieldErrors.files = "Only PDF, JPG, and PNG files are allowed.";
      break;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      fieldErrors.files = "Each file must be 5 MB or smaller.";
      break;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation-error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
      values,
    };
  }

  const now = new Date();
  const fullName = [values.firstName, values.lastName].join(" ").trim();
  const uploadedFileDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "student-files",
    student.id,
  );
  const filesToDelete = student.files.filter((file) => removeFileIds.includes(file.id));
  const writtenFiles: Array<{
    absolutePath: string;
    fileName: string;
    filePath: string;
    mimeType: string | null;
    sizeBytes: number;
  }> = [];

  try {
    if (newFiles.length > 0) {
      await mkdir(uploadedFileDirectory, { recursive: true });
    }

    for (const file of newFiles) {
      const safeName = sanitizeFileName(file.name || "attachment");
      const storedFileName = `${Date.now()}-${randomUUID()}-${safeName}`;
      const absolutePath = path.join(uploadedFileDirectory, storedFileName);
      const publicPath = `/uploads/student-files/${student.id}/${storedFileName}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      await writeFile(absolutePath, bytes);

      writtenFiles.push({
        absolutePath,
        fileName: file.name,
        filePath: publicPath,
        mimeType: file.type || null,
        sizeBytes: file.size,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: session.userId,
        },
        data: {
          name: fullName,
        },
      });

      await tx.student.update({
        where: {
          id: student.id,
        },
        data: {
          prefix: values.prefix || null,
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender as Gender,
          dateOfBirth,
          phoneNumber: values.phoneNumber,
          address: values.address,
          parentPhone: values.parentPhone,
          educationLevel: values.educationLevel as EducationLevel,
          institution: values.institution,
          faculty: values.faculty,
          major: values.major,
          coOpAdvisorName: values.coOpAdvisorName,
          coOpAdvisorPhone: values.coOpAdvisorPhone,
          lastStudentEditAt: now,
          submittedAt: student.submittedAt ?? now,
          internshipStatus: student.submittedAt ? undefined : "pending",
        },
      });

      await tx.internship.upsert({
        where: {
          studentId: student.id,
        },
        update: {
          position: values.position,
          departmentUnit: values.departmentUnit,
          supervisorName: values.supervisorName,
          startDate,
          endDate,
          additionalDetails: values.additionalDetails || null,
        },
        create: {
          studentId: student.id,
          position: values.position,
          departmentUnit: values.departmentUnit,
          supervisorName: values.supervisorName,
          startDate,
          endDate,
          additionalDetails: values.additionalDetails || null,
        },
      });

      if (removeFileIds.length > 0) {
        await tx.uploadedFile.deleteMany({
          where: {
            id: {
              in: removeFileIds,
            },
            studentId: student.id,
          },
        });
      }

      if (writtenFiles.length > 0) {
        await tx.uploadedFile.createMany({
          data: writtenFiles.map((file) => ({
            studentId: student.id,
            fileName: file.fileName,
            filePath: file.filePath,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
          })),
        });
      }
    });

    if (!student.submittedAt) {
      await createNotificationEvent({
        studentId: student.id,
        type: "form_submitted",
        title: "Student submitted internship form",
        message: `${fullName} submitted the internship form for review.`,
        targetPath: `/intern/admin/students/${student.id}`,
      });
    } else if (student.internshipStatus === "in_progress") {
      await createNotificationEvent({
        studentId: student.id,
        type: "form_updated_in_progress",
        title: "Student updated internship form",
        message: `${fullName} updated the internship record while status is in progress.`,
        targetPath: `/intern/admin/students/${student.id}`,
      });
    }

    await Promise.all(
      filesToDelete.map(async (file) => {
        const absolutePath = path.join(process.cwd(), "public", file.filePath.replace(/^\//, ""));

        try {
          await unlink(absolutePath);
        } catch {
          return;
        }
      }),
    );
  } catch {
    await Promise.all(
      writtenFiles.map(async (file) => {
        try {
          await unlink(file.absolutePath);
        } catch {
          return;
        }
      }),
    );

    return {
      status: "error",
      message: "Unable to save your internship form right now. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/intern/form");
  revalidatePath("/intern/overview");
  redirect("/intern/overview");
}