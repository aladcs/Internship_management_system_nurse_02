export type StudentFormValues = {
  prefix: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  parentPhone: string;
  educationLevel: string;
  institution: string;
  faculty: string;
  major: string;
  coOpAdvisorName: string;
  coOpAdvisorPhone: string;
  position: string;
  departmentUnit: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
  additionalDetails: string;
};

export type StudentFormFieldErrors = Partial<
  Record<keyof StudentFormValues | "attachments" | "portfolioAttachments" | "profileImage", string>
>;

export type StudentFormActionState = {
  status: "idle" | "validation-error" | "error";
  message: string | null;
  fieldErrors: StudentFormFieldErrors;
  values: StudentFormValues;
};

export function createInitialStudentFormActionState(
  values: StudentFormValues,
): StudentFormActionState {
  return {
    status: "idle",
    message: null,
    fieldErrors: {},
    values,
  };
}