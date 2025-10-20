// lib/api.ts
export const API = (path: string) =>
  `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${path}`;

export async function jsonFetch<T>(
  path: string,
  opts: RequestInit & { withCreds?: boolean } = {},
): Promise<T> {
  const { withCreds, ...rest } = opts;
  const res = await fetch(API(path), {
    method: "GET",
    headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
    credentials: withCreds ? "include" : "same-origin",
    ...rest,
  });

  if (!res.ok) {

    let msg = "Server error";
    try {
      const j = await res.json();
      msg = (j?.message as string) || msg;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}
