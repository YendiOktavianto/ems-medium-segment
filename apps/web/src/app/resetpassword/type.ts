export type ResetPasswordForm = {
  password: string;
  confirm: string;
};

export type PasswordStrength = "weak" | "medium" | "strong" | "";
