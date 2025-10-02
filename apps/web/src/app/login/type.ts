export type FormState = {
  identifier: string;
  password_hash: string;
};

export type ErrorsState = FormState;

export type Role = "admin" | "user";
