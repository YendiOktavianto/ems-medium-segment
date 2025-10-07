import { MIN_PASSWORD_LENGTH, ERROR_MESSAGES } from "./constants";

export const validateField = (name: string, value: string): string => {
  let error = "";
  if (name === "identifier") {
    if (!value) error = ERROR_MESSAGES.requiredIdentifier;
  } else if (name === "password") {
    if (!value) error = ERROR_MESSAGES.requiredPassword;
    else if (value.length < MIN_PASSWORD_LENGTH) error = ERROR_MESSAGES.shortPassword;
  }
  return error;
};
