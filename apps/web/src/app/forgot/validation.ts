import { ERROR_MESSAGES } from "./constants";

export const validateEmail = (value: string): string => {
  if (!value) return ERROR_MESSAGES.requiredEmail;
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(value)) return ERROR_MESSAGES.invalidEmail;
  return "";
};
