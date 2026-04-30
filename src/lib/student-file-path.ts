import path from "node:path";
import { withAppBasePath } from "@/lib/app-paths";

const LEGACY_PUBLIC_PREFIXES = [
  "/uploads/student-files/",
  "/uploads/student-profile-images/",
] as const;

const PRIVATE_STORAGE_PREFIXES = [
  "/storage/student-files/",
  "/storage/student-profile-images/",
] as const;

export function getStudentProfileImageSrc(value: string) {
  if (
    value.startsWith("/uploads/student-profile-images/") ||
    value.startsWith("/storage/student-profile-images/")
  ) {
    return withAppBasePath(value.replace(
      /^\/(uploads|storage)\/student-profile-images\//,
      "/api/student-profile-images/",
    ));
  }

  return value.startsWith("/") ? withAppBasePath(value) : value;
}

export function getStudentProfileImageDownloadHref(value: string) {
  const resolvedValue = getStudentProfileImageSrc(value);

  if (resolvedValue.includes("?")) {
    return `${resolvedValue}&download=1`;
  }

  return `${resolvedValue}?download=1`;
}

export function getStudentAttachmentDownloadHref(value: string) {
  if (
    value.startsWith("/uploads/student-files/") ||
    value.startsWith("/storage/student-files/")
  ) {
    return withAppBasePath(value.replace(
      /^\/(uploads|storage)\/student-files\//,
      "/api/student-files/",
    ));
  }

  return value.startsWith("/") ? withAppBasePath(value) : value;
}

export function getPrivateStorageRoot() {
  return path.join(process.cwd(), "storage");
}

function getPublicUploadsRoot() {
  return path.join(process.cwd(), "public", "uploads");
}

export function resolveStoredAssetAbsolutePath(storedPath: string) {
  const normalizedPath = storedPath.replace(/\\/g, "/");

  if (LEGACY_PUBLIC_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
    const relativePath = normalizedPath.replace(/^\/uploads\//, "");

    return path.join(getPublicUploadsRoot(), relativePath);
  }

  if (PRIVATE_STORAGE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
    const relativePath = normalizedPath.replace(/^\/storage\//, "");

    return path.join(getPrivateStorageRoot(), relativePath);
  }

  return null;
}
