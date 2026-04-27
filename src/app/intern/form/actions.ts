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
import { getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { sendTelegramAdminAlert } from "@/lib/admin/telegram";
import { prisma } from "@/lib/prisma";
import {
  getPrivateStorageRoot,
  resolveStoredAssetAbsolutePath,
} from "@/lib/student-file-path";

const GENDER_VALUES = ["male", "female", "other", "prefer_not_to_say"] as const;
const EDUCATION_LEVEL_VALUES = ["diploma", "bachelor", "master", "doctorate", "other"] as const;
const PREFIX_VALUES = ["นาย", "นาง", "นางสาว"] as const;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

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
    fieldErrors[fieldName] = "กรุณากรอกข้อมูลนี้";
    return null;
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    fieldErrors[fieldName] = "กรุณาระบุวันที่ให้ถูกต้อง";
    return null;
  }

  return parsed;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function requireStudentOrAdminSession() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== ("student" satisfies UserRole) && session.role !== ("admin" satisfies UserRole)) {
    redirect(getRoleRedirectPath(session.role));
  }

  if (session.role === ("student" satisfies UserRole) && !session.studentHasAcceptedTos) {
    redirect(STUDENT_TOS_PATH);
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

  await sendTelegramAdminAlert({
    title: input.title,
    message: input.message,
    targetPath: input.targetPath,
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
  const session = await requireStudentOrAdminSession();
  const targetStudentId = String(formData.get("studentId") ?? "").trim();
  const values = getFormValues(formData);
  const fieldErrors: StudentFormFieldErrors = {};

  const student = await prisma.student.findUnique({
    where: {
      ...(session.role === "admin" ? { id: targetStudentId } : { userId: session.userId }),
    },
    select: {
      id: true,
      userId: true,
      submittedAt: true,
      internshipStatus: true,
      profileImagePath: true,
      profileImageName: true,
      profileImageMimeType: true,
      files: {
        select: {
          id: true,
          filePath: true,
        },
      },
    },
  });

  if (!student) {
    redirect(session.role === "admin" ? "/intern/admin/students" : "/intern/overview");
  }

  if (session.role === "student" && student.internshipStatus === "completed") {
    redirect("/intern/overview");
  }

  if (!values.prefix || !PREFIX_VALUES.includes(values.prefix as (typeof PREFIX_VALUES)[number])) {
    fieldErrors.prefix = "กรุณาเลือกคำนำหน้า";
  }

  if (!values.firstName) {
    fieldErrors.firstName = "กรุณากรอกชื่อ";
  }

  if (!values.lastName) {
    fieldErrors.lastName = "กรุณากรอกนามสกุล";
  }

  if (!values.gender || !GENDER_VALUES.includes(values.gender as Gender)) {
    fieldErrors.gender = "กรุณาเลือกเพศ";
  }

  const dateOfBirth = parseDate(values.dateOfBirth, "dateOfBirth", fieldErrors);

  if (!values.phoneNumber) {
    fieldErrors.phoneNumber = "กรุณากรอกหมายเลขโทรศัพท์";
  } else if (!isPhoneNumber(values.phoneNumber)) {
    fieldErrors.phoneNumber = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
  }

  if (!values.address) {
    fieldErrors.address = "กรุณากรอกที่อยู่";
  }

  if (!values.parentPhone) {
    fieldErrors.parentPhone = "กรุณากรอกเบอร์โทรผู้ปกครอง";
  } else if (!isPhoneNumber(values.parentPhone)) {
    fieldErrors.parentPhone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
  }

  if (!values.educationLevel || !EDUCATION_LEVEL_VALUES.includes(values.educationLevel as EducationLevel)) {
    fieldErrors.educationLevel = "กรุณาเลือกระดับการศึกษา";
  }

  if (!values.institution) {
    fieldErrors.institution = "กรุณากรอกสถาบันการศึกษา";
  }

  if (!values.faculty) {
    fieldErrors.faculty = "กรุณากรอกคณะ";
  }

  if (!values.major) {
    fieldErrors.major = "กรุณากรอกสาขาวิชา";
  }

  if (!values.coOpAdvisorName) {
    fieldErrors.coOpAdvisorName = "กรุณากรอกชื่ออาจารย์ที่ปรึกษาสหกิจ";
  }

  if (!values.coOpAdvisorPhone) {
    fieldErrors.coOpAdvisorPhone = "กรุณากรอกเบอร์โทรอาจารย์ที่ปรึกษาสหกิจ";
  } else if (!isPhoneNumber(values.coOpAdvisorPhone)) {
    fieldErrors.coOpAdvisorPhone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
  }

  if (!values.position) {
    fieldErrors.position = "กรุณากรอกตำแหน่งฝึกงาน";
  }

  if (!values.departmentUnit) {
    fieldErrors.departmentUnit = "กรุณากรอกแผนกหรือหน่วยงาน";
  }

  if (!values.supervisorName) {
    fieldErrors.supervisorName = "กรุณากรอกชื่อผู้ดูแล";
  }

  const startDate = parseDate(values.startDate, "startDate", fieldErrors);
  const endDate = parseDate(values.endDate, "endDate", fieldErrors);

  if (dateOfBirth && dateOfBirth > new Date()) {
    fieldErrors.dateOfBirth = "วันเกิดต้องเป็นวันที่ในอดีต";
  }

  if (startDate && endDate && endDate < startDate) {
    fieldErrors.endDate = "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น";
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
  const profileImageEntry = formData.get("profileImage");
  const newProfileImage = profileImageEntry instanceof File && profileImageEntry.size > 0 ? profileImageEntry : null;
  const removeProfileImage = String(formData.get("removeProfileImage") ?? "") === "true";

  if (newProfileImage) {
    if (!ALLOWED_PROFILE_IMAGE_TYPES.has(newProfileImage.type)) {
      fieldErrors.files = "รูปโปรไฟล์ต้องเป็นไฟล์ JPG หรือ PNG เท่านั้น";
    } else if (newProfileImage.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      fieldErrors.files = "รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB";
    }
  }

  const remainingExistingFileCount = student.files.filter((file) => !removeFileIds.includes(file.id)).length;

  if (remainingExistingFileCount + newFiles.length > MAX_FILE_COUNT) {
    fieldErrors.files = `คุณสามารถเก็บไฟล์ได้รวมสูงสุด ${MAX_FILE_COUNT} ไฟล์`;
  }

  for (const file of newFiles) {
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      fieldErrors.files = "อนุญาตเฉพาะไฟล์ PDF, JPG และ PNG เท่านั้น";
      break;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      fieldErrors.files = "แต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB";
      break;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation-error",
      message: "กรุณาแก้ไขข้อมูลในช่องที่แสดงข้อผิดพลาดแล้วลองอีกครั้ง",
      fieldErrors,
      values,
    };
  }

  const now = new Date();
  const fullName = [values.firstName, values.lastName].join(" ").trim();
  const privateStorageRoot = getPrivateStorageRoot();
  const uploadedFileDirectory = path.join(
    privateStorageRoot,
    "student-files",
    student.id,
  );
  const profileImageDirectory = path.join(
    privateStorageRoot,
    "student-profile-images",
    student.id,
  );
  const filesToDelete = student.files.filter((file) => removeFileIds.includes(file.id));
  const profileImageToDelete = student.profileImagePath
    ? resolveStoredAssetAbsolutePath(student.profileImagePath)
    : null;
  const writtenFiles: Array<{
    absolutePath: string;
    fileName: string;
    filePath: string;
    mimeType: string | null;
    sizeBytes: number;
  }> = [];
  let writtenProfileImage: {
    absolutePath: string;
    fileName: string;
    filePath: string;
    mimeType: string | null;
  } | null = null;

  try {
    if (newFiles.length > 0) {
      await mkdir(uploadedFileDirectory, { recursive: true });
    }

    if (newProfileImage) {
      await mkdir(profileImageDirectory, { recursive: true });
      const safeName = sanitizeFileName(newProfileImage.name || "profile-image");
      const storedFileName = `${Date.now()}-${randomUUID()}-${safeName}`;
      const absolutePath = path.join(profileImageDirectory, storedFileName);
      const storedPath = `/storage/student-profile-images/${student.id}/${storedFileName}`;
      const bytes = Buffer.from(await newProfileImage.arrayBuffer());

      await writeFile(absolutePath, bytes);

      writtenProfileImage = {
        absolutePath,
        fileName: newProfileImage.name,
        filePath: storedPath,
        mimeType: newProfileImage.type || null,
      };
    }

    for (const file of newFiles) {
      const safeName = sanitizeFileName(file.name || "attachment");
      const storedFileName = `${Date.now()}-${randomUUID()}-${safeName}`;
      const absolutePath = path.join(uploadedFileDirectory, storedFileName);
      const storedPath = `/storage/student-files/${student.id}/${storedFileName}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      await writeFile(absolutePath, bytes);

      writtenFiles.push({
        absolutePath,
        fileName: file.name,
        filePath: storedPath,
        mimeType: file.type || null,
        sizeBytes: file.size,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: student.userId,
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
          profileImagePath: writtenProfileImage
            ? writtenProfileImage.filePath
            : removeProfileImage
              ? null
              : undefined,
          profileImageName: writtenProfileImage
            ? writtenProfileImage.fileName
            : removeProfileImage
              ? null
              : undefined,
          profileImageMimeType: writtenProfileImage
            ? writtenProfileImage.mimeType
            : removeProfileImage
              ? null
              : undefined,
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
          lastStudentEditAt: session.role === "student" ? now : undefined,
          submittedAt: session.role === "student" ? (student.submittedAt ?? now) : undefined,
          internshipStatus:
            session.role === "student" && !student.submittedAt ? "pending" : undefined,
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

    if (session.role === "student" && !student.submittedAt) {
      await createNotificationEvent({
        studentId: student.id,
        type: "form_submitted",
        title: "นักศึกษาส่งแบบฟอร์มฝึกงานแล้ว",
        message: `${fullName} ส่งแบบฟอร์มฝึกงานเพื่อรอการตรวจสอบแล้ว`,
        targetPath: `/intern/admin/students/${student.id}`,
      });
    } else if (session.role === "student" && student.internshipStatus === "in_progress") {
      await createNotificationEvent({
        studentId: student.id,
        type: "form_updated_in_progress",
        title: "นักศึกษาอัปเดตแบบฟอร์มฝึกงาน",
        message: `${fullName} อัปเดตข้อมูลฝึกงานขณะที่สถานะเป็นกำลังดำเนินการ`,
        targetPath: `/intern/admin/students/${student.id}`,
      });
    }

    await Promise.all(
      filesToDelete.map(async (file) => {
        const absolutePath = resolveStoredAssetAbsolutePath(file.filePath);

        if (!absolutePath) {
          return;
        }

        try {
          await unlink(absolutePath);
        } catch {
          return;
        }
      }),
    );

    if ((writtenProfileImage || removeProfileImage) && profileImageToDelete) {
      try {
        await unlink(profileImageToDelete);
      } catch {
        // Ignore missing old profile image file.
      }
    }
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

    if (writtenProfileImage) {
      try {
        await unlink(writtenProfileImage.absolutePath);
      } catch {
        // Ignore cleanup failure for profile image.
      }
    }

    return {
      status: "error",
      message: "ไม่สามารถบันทึกแบบฟอร์มฝึกงานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/intern/form");
  revalidatePath("/intern/overview");
  revalidatePath("/intern/admin/students");
  revalidatePath(`/intern/admin/students/${student.id}`);
  revalidatePath(`/intern/admin/students/${student.id}/edit`);
  redirect(session.role === "admin" ? `/intern/admin/students/${student.id}` : "/intern/overview");
}