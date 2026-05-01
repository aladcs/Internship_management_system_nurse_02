export type ChangeDisplayNameActionState = {
  error: string | null;
  success: string | null;
  fieldErrors: {
    name?: string;
  };
  value: string;
};

export const initialChangeDisplayNameActionState: ChangeDisplayNameActionState = {
  error: null,
  success: null,
  fieldErrors: {},
  value: "",
};