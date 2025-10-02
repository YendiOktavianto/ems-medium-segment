export const MIN_PASSWORD_LENGTH = 8;

export const ERROR_MESSAGES = {
  requiredIdentifier: "username or email is required",
  requiredPassword: "password is required",
  shortPassword: `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  serverError: "server error, please try again later",
  unknownError: "something went wrong, please try again later",
};

export const ROLE_REDIRECT = {
  admin: "/admin",
  user: "/dashboard",
};
