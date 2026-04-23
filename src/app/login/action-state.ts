export type LoginActionState = {
  error: string | null;
  email: string;
};

export const initialLoginActionState: LoginActionState = {
  error: null,
  email: "",
};