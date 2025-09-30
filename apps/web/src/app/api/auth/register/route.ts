export async function POST(req: Request) {
  const be = process.env.NEST_API ?? "http://localhost:4000";
  const body = await req.json();

  function toIDPhone(raw: unknown) {
    const digits = String(raw ?? "").replace(/\D/g, "");
    if (!digits) return "";                                
    
    let d = digits;
    if (d.startsWith("0")) d = "62" + d.slice(1);
    if (!d.startsWith("62")) d = "62" + d;
    return "+" + d;
  }

  const payload = {
    username: body.username,
    email: body.email,
    phone: toIDPhone(body.phone_number),
    password: body.password,
  };

  const res = await fetch(`${be}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return new Response(JSON.stringify(json), { status: res.status });
}
