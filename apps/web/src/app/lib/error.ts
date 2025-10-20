export function errorMessage(err: unknown, fallback = "Server error") {
  if (err instanceof Error && typeof err.message === "string") return err.message;
  if (typeof err === "string") return err;
  return fallback;
}
