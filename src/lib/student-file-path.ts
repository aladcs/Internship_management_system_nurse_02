import path from "node:path";

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
    return value.replace(
      /^\/(uploads|storage)\/student-profile-images\//,
      "/intern/api/student-profile-images/",
    );
  }

  return value;
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
    return value.replace(
      /^\/(uploads|storage)\/student-files\//,
      "/intern/api/student-files/",
    );
  }

  return value;
}

export function getPrivateStorageRoot() {
  return path.join(process.cwd(), "storage");
}

export function resolveStoredAssetAbsolutePath(storedPath: string) {
  const normalizedPath = storedPath.replace(/\\/g, "/");

  if (LEGACY_PUBLIC_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
    return path.join(process.cwd(), "public", normalizedPath.replace(/^\//, ""));
  }

  if (PRIVATE_STORAGE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
    return path.join(process.cwd(), normalizedPath.replace(/^\//, ""));
  }

  return null;
}
