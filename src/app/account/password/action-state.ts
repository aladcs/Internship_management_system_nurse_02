export type ChangePasswordActionState = {
  error: string | null;
  success: string | null;
};

export const initialChangePasswordActionState: ChangePasswordActionState = {
  error: null,
  success: null,
};