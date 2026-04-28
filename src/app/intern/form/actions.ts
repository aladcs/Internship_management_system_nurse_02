"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type EducationLevel,
  type Gender,
  type InternshipStatus,
  type UserRole,
} from "@prisma/client";
import {
  type StudentFormActionState,
  type StudentFormFieldErrors,
  type StudentFormValues,
} from "@/app/intern/form/action-state";
import { clearSession, readSession } from "@/lib/auth/session";
import { createAdminNotificationEvent } from "@/lib/admin/notifications";
import { getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { isStudentEditableStatus } from "@/lib/internship-status";
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

function parseDate(
  value: string,
  fieldName: keyof StudentFormValues,
  fieldErrors: StudentFormFieldErrors,
  options?: { required?: boolean },
) {
  if (!value) {
    if (options?.required !== false) {
      fieldErrors[fieldName] = "กรุณากรอกข้อมูลนี้";
    }

    return null;
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    fieldErrors[fieldName] = "กรุณาระบุวันที่ให้ถูกต้อง";
    return null;
  }

  return parsed;
}

function summarizeActorName(values: StudentFormValues, fallbackEmail: string) {
  const fullName = [values.firstName, values.lastName].filter(Boolean).join(" ").trim();

  return fullName || fallbackEmail;
}

function countFileChanges(input: {
  removedFileIds: string[];
  newFiles: File[];
  removeProfileImage: boolean;
  newProfileImage: File | null;
}) {
  return input.removedFileIds.length + input.newFiles.length + (input.removeProfileImage || input.newProfileImage ? 1 : 0);
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
  const requestedIntent = String(formData.get("intent") ?? "").trim();
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

  if (session.role === "student" && !isStudentEditableStatus(student.internshipStatus)) {
    redirect("/intern/overview");
  }

  const studentIntent =
    session.role === "admin"
      ? "admin_save"
      : requestedIntent === "submit" || requestedIntent === "save_changes"
        ? requestedIntent
        : student.internshipStatus === "draft"
          ? "submit"
          : "save_changes";
  const requiresCompleteForm = true;

  if (requiresCompleteForm && (!values.prefix || !PREFIX_VALUES.includes(values.prefix as (typeof PREFIX_VALUES)[number]))) {
    fieldErrors.prefix = "กรุณาเลือกคำนำหน้า";
  } else if (values.prefix && !PREFIX_VALUES.includes(values.prefix as (typeof PREFIX_VALUES)[number])) {
    fieldErrors.prefix = "กรุณาเลือกคำนำหน้า";
  }

  if (requiresCompleteForm && !values.firstName) {
    fieldErrors.firstName = "กรุณากรอกชื่อ";
  }

  if (requiresCompleteForm && !values.lastName) {
    fieldErrors.lastName = "กรุณากรอกนามสกุล";
  }

  if (requiresCompleteForm && (!values.gender || !GENDER_VALUES.includes(values.gender as Gender))) {
    fieldErrors.gender = "กรุณาเลือกเพศ";
  } else if (values.gender && !GENDER_VALUES.includes(values.gender as Gender)) {
    fieldErrors.gender = "กรุณาเลือกเพศ";
  }

  const dateOfBirth = parseDate(values.dateOfBirth, "dateOfBirth", fieldErrors, {
    required: requiresCompleteForm,
  });

  if (requiresCompleteForm && !values.phoneNumber) {
    fieldErrors.phoneNumber = "กรุณากรอกหมายเลขโทรศัพท์";
  } else if (values.phoneNumber && !isPhoneNumber(values.phoneNumber)) {
    fieldErrors.phoneNumber = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
  }

  if (requiresCompleteForm && !values.address) {
    fieldErrors.address = "กรุณากรอกที่อยู่";
  }

  if (requiresCompleteForm && !values.parentPhone) {
    fieldErrors.parentPhone = "กรุณากรอกเบอร์โทรผู้ปกครอง";
  } else if (values.parentPhone && !isPhoneNumber(values.parentPhone)) {
    fieldErrors.parentPhone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
  }

  if (requiresCompleteForm && (!values.educationLevel || !EDUCATION_LEVEL_VALUES.includes(values.educationLevel as EducationLevel))) {
    fieldErrors.educationLevel = "กรุณาเลือกระดับการศึกษา";
  } else if (values.educationLevel && !EDUCATION_LEVEL_VALUES.includes(values.educationLevel as EducationLevel)) {
    fieldErrors.educationLevel = "กรุณาเลือกระดับการศึกษา";
  }

  if (requiresCompleteForm && !values.institution) {
    fieldErrors.institution = "กรุณากรอกสถาบันการศึกษา";
  }

  if (requiresCompleteForm && !values.faculty) {
    fieldErrors.faculty = "กรุณากรอกคณะ";
  }

  if (requiresCompleteForm && !values.major) {
    fieldErrors.major = "กรุณากรอกสาขาวิชา";
  }

  if (requiresCompleteForm && !values.coOpAdvisorName) {
    fieldErrors.coOpAdvisorName = "กรุณากรอกชื่ออาจารย์ที่ปรึกษาสหกิจ";
  }

  if (requiresCompleteForm && !values.coOpAdvisorPhone) {
    fieldErrors.coOpAdvisorPhone = "กรุณากรอกเบอร์โทรอาจารย์ที่ปรึกษาสหกิจ";
  } else if (values.coOpAdvisorPhone && !isPhoneNumber(values.coOpAdvisorPhone)) {
    fieldErrors.coOpAdvisorPhone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
  }

  if (requiresCompleteForm && !values.position) {
    fieldErrors.position = "กรุณากรอกตำแหน่งฝึกงาน";
  }

  if (requiresCompleteForm && !values.departmentUnit) {
    fieldErrors.departmentUnit = "กรุณากรอกแผนกหรือหน่วยงาน";
  }

  if (requiresCompleteForm && !values.supervisorName) {
    fieldErrors.supervisorName = "กรุณากรอกชื่อผู้ดูแล";
  }

  const startDate = parseDate(values.startDate, "startDate", fieldErrors, {
    required: requiresCompleteForm,
  });
  const endDate = parseDate(values.endDate, "endDate", fieldErrors, {
    required: requiresCompleteForm,
  });

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
  const displayName = summarizeActorName(values, session.email);
  const fullName = [values.firstName, values.lastName].join(" ").trim();
  const fileChangeCount = countFileChanges({
    removedFileIds: removeFileIds,
    newFiles,
    removeProfileImage,
    newProfileImage,
  });
  const hasFileChanges = fileChangeCount > 0;
  const previousStatus = student.internshipStatus;
  let nextStudentStatus: InternshipStatus = student.internshipStatus;
  let nextSubmittedAt = student.submittedAt;

  if (session.role === "student") {
    if (studentIntent === "submit") {
      nextStudentStatus = previousStatus === "needs_fix" ? "pending" : previousStatus === "draft" ? "pending" : previousStatus;
      nextSubmittedAt = now;
    }
  }

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
          name: fullName || null,
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
          submittedAt: session.role === "student" ? nextSubmittedAt : undefined,
          internshipStatus: session.role === "student" ? nextStudentStatus : undefined,
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

      if (session.role === "student") {
        if (studentIntent === "submit") {
          await tx.activityLog.create({
            data: {
              actorId: session.userId,
              studentId: student.id,
              action: previousStatus === "needs_fix" ? "student_resubmitted_form" : "student_submitted_form",
              message:
                previousStatus === "needs_fix"
                  ? `${displayName} แก้ไขข้อมูลและส่งแบบฟอร์มกลับมาให้ตรวจสอบอีกครั้ง`
                  : `${displayName} ส่งแบบฟอร์มฝึกงานเพื่อรอการตรวจสอบ`,
              metadata: {
                fromStatus: previousStatus,
                toStatus: nextStudentStatus,
                intent: studentIntent,
              },
            },
          });
        } else {
          await tx.activityLog.create({
            data: {
              actorId: session.userId,
              studentId: student.id,
              action: "student_edited_form",
              message: `${displayName} แก้ไขข้อมูลฝึกงาน`,
              metadata: {
                status: previousStatus,
                intent: studentIntent,
              },
            },
          });
        }

        if (writtenFiles.length > 0) {
          await tx.activityLog.create({
            data: {
              actorId: session.userId,
              studentId: student.id,
              action: "student_uploaded_files",
              message: `${displayName} อัปโหลดไฟล์ ${writtenFiles.length} ไฟล์`,
              metadata: {
                fileCount: writtenFiles.length,
                status: previousStatus,
              },
            },
          });
        }

        if (removeFileIds.length > 0) {
          await tx.activityLog.create({
            data: {
              actorId: session.userId,
              studentId: student.id,
              action: "student_removed_files",
              message: `${displayName} ลบหรือแทนที่ไฟล์ ${removeFileIds.length} ไฟล์`,
              metadata: {
                fileCount: removeFileIds.length,
                status: previousStatus,
              },
            },
          });
        }
      } else {
        await tx.activityLog.create({
          data: {
            actorId: session.userId,
            studentId: student.id,
            action: "admin_edited_student_data",
            message: `${session.name?.trim() || session.email} แก้ไขข้อมูลนักศึกษา`,
            metadata: {
              status: previousStatus,
              fileChangeCount,
            },
          },
        });
      }
    });

    if (session.role === "student" && studentIntent === "submit" && previousStatus === "draft") {
      await createAdminNotificationEvent({
        studentId: student.id,
        type: "form_submitted",
        title: "นักศึกษาส่งแบบฟอร์มฝึกงานแล้ว",
        message: `${displayName} ส่งแบบฟอร์มฝึกงานเพื่อรอการตรวจสอบแล้ว`,
        targetPath: `/intern/admin/students/${student.id}`,
      });
    } else if (session.role === "student" && studentIntent === "submit" && previousStatus === "needs_fix") {
      await createAdminNotificationEvent({
        studentId: student.id,
        type: "form_resubmitted",
        title: "นักศึกษาส่งแบบฟอร์มกลับมาอีกครั้ง",
        message: `${displayName} แก้ไขข้อมูลตามคำแนะนำและส่งกลับมาให้ตรวจสอบอีกครั้ง`,
        targetPath: `/intern/admin/students/${student.id}`,
      });
    }

    if (session.role === "student" && previousStatus === "in_progress") {
      await createAdminNotificationEvent({
        studentId: student.id,
        type: "form_updated_in_progress",
        title: "นักศึกษาอัปเดตแบบฟอร์มฝึกงาน",
        message: `${displayName} อัปเดตข้อมูลฝึกงานขณะที่สถานะเป็นอนุมัติแล้ว / กำลังฝึกงาน`,
        targetPath: `/intern/admin/students/${student.id}`,
      });

      if (hasFileChanges) {
        await createAdminNotificationEvent({
          studentId: student.id,
          type: "file_changed_in_progress",
          title: "นักศึกษาเปลี่ยนไฟล์ระหว่างฝึกงาน",
          message: `${displayName} เปลี่ยนแปลงไฟล์แนบขณะที่สถานะเป็นอนุมัติแล้ว / กำลังฝึกงาน`,
          targetPath: `/intern/admin/students/${student.id}`,
        });
      }
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