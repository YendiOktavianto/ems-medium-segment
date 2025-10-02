export const validatePassword = (password: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,30}$/;
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 30) return "Password must be at most 30 characters";
  if (!regex.test(password))
    return "Password must contain uppercase, lowercase, number, and symbol";
  return "";
};

export const validateConfirm = (password: string, confirm: string) => {
  if (!confirm) return "Confirm password is required";
  if (password !== confirm) return "Passwords do not match";
  return "";
};

export const evaluatePasswordStrength = (pwd: string) => {
  if (pwd.length < 8) return "weak";
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

  const score = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  if (score === 4) return "strong";
  if (score >= 2) return "medium";
  return "weak";
};
