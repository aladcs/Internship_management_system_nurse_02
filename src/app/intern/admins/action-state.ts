export type AdminListItem = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
};

export type SaveAdminActionState = {
  status: "idle" | "validation-error" | "created" | "updated" | "error";
  message: string | null;
  fieldErrors: {
    name?: string;
    email?: string;
  };
  values: {
    name: string;
    email: string;
  };
  admin: AdminListItem | null;
  generatedPassword: string | null;
};

export const initialSaveAdminActionState: SaveAdminActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {
    name: "",
    email: "",
  },
  admin: null,
  generatedPassword: null,
};

export type DeleteAdminActionState = {
  status: "idle" | "error" | "deleted";
  message: string | null;
  deletedAdminId: string | null;
};

export const initialDeleteAdminActionState: DeleteAdminActionState = {
  status: "idle",
  message: null,
  deletedAdminId: null,
};