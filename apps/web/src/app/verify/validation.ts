import { OTP_LENGTH, MESSAGES } from "./constants";

export const validateOTP = (code: string[]): string => {
  if (code.join("").length < OTP_LENGTH) return MESSAGES.incompleteCode;
  return "";
};
