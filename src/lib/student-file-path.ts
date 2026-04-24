export function getStudentProfileImageSrc(value: string) {
  if (value.startsWith("/uploads/student-profile-images/")) {
    return value.replace(
      "/uploads/student-profile-images/",
      "/intern/api/student-profile-images/",
    );
  }

  return value;
}

export function getStudentAttachmentDownloadHref(value: string) {
  if (value.startsWith("/uploads/student-files/")) {
    return value.replace(
      "/uploads/student-files/",
      "/intern/api/student-files/",
    );
  }

  return value;
}
