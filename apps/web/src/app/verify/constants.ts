export const OTP_LENGTH = 4;

export const MESSAGES = {
  incompleteCode: "Please enter the complete 4-digit code",
  invalidCode: "Invalid verification code",
  success: "Verification successful! Redirecting...",
  resendSuccess: (email: string) => `Verification code has been resent to ${email}`,
};
