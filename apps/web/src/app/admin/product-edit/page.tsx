"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

/* ---------------- Types ---------------- */
type Feature = { title: string; desc: string; img: string };
type Step = { title: string; desc: string };
type Benefit = { title: string; desc: string };
type Comparison = { title: string; desc: string };
type Testimonial = { name: string; role: string; feedback: string; avatar: string };

type ProductContent = {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    heroImg: string; // background hero
  };
  advantages: string[];
  features: Feature[];
  steps: Step[];
  benefits: Benefit[];
  comparisons: Comparison[];
  testimonials: Testimonial[];
};

/* ---------------- Defaults & Template ---------------- */
const DEFAULTS: ProductContent = {
  hero: { title: "", subtitle: "", ctaLabel: "", ctaHref: "", heroImg: "" },
  advantages: [],
  features: [],
  steps: [],
  benefits: [],
  comparisons: [],
  testimonials: [],
};

// Template awal yang match ProductPage
const TEMPLATE_PRODUCT: ProductContent = {
  hero: {
    title: "Smart Lamp Monitoring Kit",
    subtitle:
      "Integrated hardware and software solution for real-time lamp monitoring, control, and energy optimization.",
    ctaLabel: "Get Started",
    ctaHref: "/register",
    heroImg: "/product-hero.jpg",
  },
  advantages: [
    "All-in-one solution: hardware + software package.",
    "Monitor lamps in real-time from anywhere.",
    "Automated scheduling reduces energy costs.",
    "Easy installation with step-by-step guide.",
    "Secure cloud connection and encrypted data.",
  ],
  features: [
    {
      title: "Hardware Kit",
      desc: "Includes smart sensors for your lamps. Visualize connections with our setup diagram for easy installation.",
      img: "/monitoring.png",
    },
    {
      title: "Web App",
      desc: "Control and monitor lamps remotely. Dashboard includes real-time status, energy consumption charts, and interactive controls.",
      img: "/monitoring.png",
    },
    {
      title: "Analytics & Reports",
      desc: "Track energy usage, monitor efficiency, generate actionable insights. Charts, bar graphs, and PDF export included.",
      img: "/monitoring.png",
    },
  ],
  steps: [
    {
      title: "Install Devices",
      desc: "Mount controllers and sensors to lamps following our guide. Connect each device securely to the network.",
    },
    {
      title: "Connect to App",
      desc: "Link devices via Wi-Fi or IoT gateway. Ensure each lamp is registered and visible on the dashboard.",
    },
    {
      title: "Monitor & Optimize",
      desc: "Access real-time data, receive alerts, and automate schedules. Analyze energy consumption for cost savings.",
    },
  ],
  benefits: [
    { title: "Reduce Energy Costs", desc: "Save up to 30% on electricity by automating schedules and monitoring usage." },
    { title: "Save Time & Maintenance", desc: "Automated alerts reduce manual inspection and ensure timely maintenance." },
    { title: "Data-Driven Decisions", desc: "Analytics provide actionable insights to optimize operations and performance." },
    { title: "Secure & Reliable", desc: "Encrypted data and secure cloud connection ensures safety of all information." },
  ],
  comparisons: [
    { title: "Stability & Reliability", desc: "System uptime is 99.9% with minimal maintenance." },
    { title: "Scalability", desc: "Easily expand to multiple locations or lamp groups without performance drop." },
    { title: "Integration", desc: "Compatible with other IoT systems and third-party apps." },
    { title: "Performance", desc: "Real-time response under 2 seconds and optimized resource usage." },
  ],
  testimonials: [
    {
      name: "Alice Johnson",
      role: "Facility Manager, GreenTech Co.",
      feedback:
        "Monitoring multiple lamps has never been easier. The integrated system is seamless!",
      avatar: "/profile.svg",
    },
    {
      name: "Mark Davis",
      role: "Operations Lead, BrightEnergy",
      feedback:
        "Installation was simple and the dashboard is extremely intuitive. Energy savings are noticeable!",
      avatar: "/profile.svg",
    },
    {
      name: "Sophia Lee",
      role: "Energy Analyst, EcoSmart",
      feedback: "I love the analytics feature. It helps me track energy usage efficiently.",
      avatar: "/profile.svg",
    },
    {
      name: "John Smith",
      role: "Maintenance Supervisor, UrbanLights",
      feedback: "The remote control works perfectly. I can manage lamps from anywhere.",
      avatar: "/profile.svg",
    },
  ],
};

/* ---------------- Env Keys ---------------- */
const PRODUCT_KEY = process.env.NEXT_PUBLIC_PRODUCT_KEY ?? "product"; // key dokumen product
const UPLOAD_PATH = process.env.NEXT_PUBLIC_UPLOAD_PATH || "/api/v1/upload";

/* ---------------- Utils ---------------- */
function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  return base.replace(/\/+$/, "");
}
function joinUrl(base: string, path: string) {
  return `${base}/${path.replace(/^\/+/, "")}`;
}
function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (Array.isArray(base)) return ((patch as any) ?? (base as any)) as T;
  if (typeof base === "object" && base) {
    const out: any = Array.isArray(base) ? [] : { ...base };
    for (const k in base as any) {
      const bv = (base as any)[k];
      const pv = (patch as any)?.[k];
      out[k] =
        typeof bv === "object" && bv && !Array.isArray(bv)
          ? deepMerge(bv, (pv as any) ?? {})
          : (pv ?? bv);
    }
    for (const k in patch as any) if (!(k in out)) out[k] = (patch as any)[k];
    return out;
  }
  return (patch as T) ?? base;
}

/* ---------------- Upload helper (dengan fallback 404) ---------------- */
async function uploadImageToServer(file: File, fieldName = "file"): Promise<string> {
  const base = getApiBase();
  const token = (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
  const form = new FormData();
  form.append(fieldName, file);

  const primaryPath = UPLOAD_PATH || "/api/v1/upload";
  const candidates = [primaryPath, "/upload"]; // fallback umum

  let lastErr: any = null;

  for (const path of candidates) {
    const url = joinUrl(base, path);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });

      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail =
            typeof j?.message === "string"
              ? j.message
              : Array.isArray(j?.message)
              ? j.message.join(", ")
              : JSON.stringify(j);
        } catch {
          detail = await res.text().catch(() => "");
        }
        if (res.status === 404) {
          lastErr = new Error(`404 Not Found on ${url}${detail ? ` – ${detail}` : ""}`);
          continue; // coba path berikutnya
        }
        throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`);
      }

      const json = await res.json();
      let out = json?.url ?? json?.path ?? json?.location ?? json?.secure_url ?? "";
      if (!out) throw new Error("Upload response missing url|path|location");
      if (!/^https?:\/\//i.test(out)) out = joinUrl(base, String(out));
      return out;
    } catch (e) {
      lastErr = e;
      // kalau error bukan 404, hentikan loop
      if (!(e instanceof Error && String(e.message).includes("404"))) break;
    }
  }

  throw lastErr ?? new Error("Upload failed for all candidate paths");
}

/* ---------------- Component ---------------- */
export default function AdminProductEditor() {
  const router = useRouter();

  const [content, setContent] = useState<ProductContent>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<
    "Hero" | "Advantages" | "Features" | "Steps" | "Benefits" | "Comparisons" | "Testimonials"
  >("Hero");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load initial
  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const base = getApiBase();
        const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const raw = await res.json();
        const loaded: ProductContent = "data" in raw ? raw.data : raw;
        if (mounted) setContent(deepMerge(DEFAULTS, loaded));
      } catch (e: any) {
        // kalau belum ada dokumen, pakai template
        setContent(TEMPLATE_PRODUCT);
        setError(`Load failed, using template: ${e?.message ?? "Unknown error"}`);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const base = getApiBase();
      const token = (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: content, updatedBy: "admin@powersys" }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail =
            typeof j?.message === "string"
              ? j.message
              : Array.isArray(j?.message)
              ? j.message.join(", ")
              : JSON.stringify(j);
        } catch {
          detail = await res.text().catch(() => "");
        }
        throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`);
      }
    } catch (e: any) {
      setError(`Save failed: ${e?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function resetFromServer() {
    setError("");
    try {
      const base = getApiBase();
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const raw = await res.json();
      const loaded: ProductContent = "data" in raw ? raw.data : raw;
      setContent(deepMerge(DEFAULTS, loaded));
    } catch (e: any) {
      setError(`Reload failed: ${e?.message ?? "Unknown error"}`);
    }
  }

  function useTemplate() {
    setContent(JSON.parse(JSON.stringify(TEMPLATE_PRODUCT)));
  }

  const tabs = useMemo(
    () =>
      ["Hero", "Advantages", "Features", "Steps", "Benefits", "Comparisons", "Testimonials"] as const,
    []
  );

  return (
    <main
      className="
        flex flex-col
        mx-auto sm:mr-8 rounded-2xl
        box-border
        h-[84dvh] max-h-[100dvh]
        overflow-hidden
        pb-[max(env(safe-area-inset-bottom),12px)]
      "
      style={{
        background:
          "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)",
      }}
    >
      {/* Topbar */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-[#041023]/60 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-medium text-sm md:text-base">Edit Product Page</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/product")}
              className="px-3 py-2 rounded-xl border border-[#6fb6ff]/40 hover:bg-white/5 text-sm"
            >
              Preview Page
            </button>
            <button
              onClick={useTemplate}
              className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-sm"
              title="Use template"
            >
              Use Template
            </button>
            <button
              onClick={resetFromServer}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-sm"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d9bf0] hover:bg-[#1277c9] disabled:opacity-60 text-sm font-medium shadow-lg shadow-blue-900/40"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        className="
          mx-auto max-w-7xl px-4 py-6
          grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6
          flex-1 min-h-0 w-full
        "
      >
        {/* Tabs */}
        <aside className="w-[240px] rounded-2xl p-3 bg-white/5 border border-white/10 md:sticky md:top-[84px] h-fit">
          <ul className="space-y-1">
            {tabs.map((t) => (
              <li key={t}>
                <button
                  onClick={() => setActiveTab(t)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                    activeTab === t
                      ? "bg-[#072b56] text-[#7ec7ff] border border-[#1d9bf0]/30"
                      : "hover:bg-white/5 text-white/90"
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
          {error && (
            <p className="mt-3 text-xs text-red-300 bg-red-900/30 border border-red-700/30 rounded-lg p-2">
              {error}
            </p>
          )}
        </aside>

        {/* Panel kanan (scroll only here) */}
        <section
          className="
            rounded-2xl p-5 bg-white/5 border border-white/10
            min-w-0 min-h-0 h-full overflow-y-auto
            [scrollbar-gutter:stable]
          "
        >
          {activeTab === "Hero" && (
            <div className="space-y-4">
              <Input
                label="Title"
                value={content.hero.title}
                onChange={(v) => setContent({ ...content, hero: { ...content.hero, title: v } })}
              />
              <Textarea
                label="Subtitle"
                value={content.hero.subtitle}
                onChange={(v) => setContent({ ...content, hero: { ...content.hero, subtitle: v } })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="CTA Label"
                  value={content.hero.ctaLabel}
                  onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaLabel: v } })}
                />
                <Input
                  label="CTA Href"
                  value={content.hero.ctaHref}
                  onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaHref: v } })}
                />
              </div>
              <UploadImage
                label="Hero Background"
                value={content.hero.heroImg}
                onChange={(url) => setContent({ ...content, hero: { ...content.hero, heroImg: url } })}
              />
            </div>
          )}

          {activeTab === "Advantages" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-[#7ec7ff]">Advantages</h4>
                <AddBtn onClick={() => setContent({ ...content, advantages: [...content.advantages, ""] })} />
              </div>
              <div className="space-y-3">
                {content.advantages.map((adv, i) => (
                  <div key={i} className="grid grid-cols-1 sm:[grid-template-columns:minmax(0,1fr)_auto] gap-3 items-center">
                    <Input
                      label={`Item ${i + 1}`}
                      value={adv}
                      onChange={(v) => {
                        const a = [...content.advantages];
                        a[i] = v;
                        setContent({ ...content, advantages: a });
                      }}
                    />
                    <RemoveBtn
                      onClick={() => {
                        const a = content.advantages.filter((_, idx) => idx !== i);
                        setContent({ ...content, advantages: a });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Features" && (
            <ListWithImageEditor<Feature>
              title="Features"
              items={content.features}
              schema={[
                { key: "title", label: "Title", type: "input" },
                { key: "desc", label: "Description", type: "textarea" },
                { key: "img", label: "Image", type: "image" },
              ]}
              onAdd={() => setContent({ ...content, features: [...content.features, { title: "", desc: "", img: "" }] })}
              onChange={(items) => setContent({ ...content, features: items })}
            />
          )}

          {activeTab === "Steps" && (
            <ListSimpleEditor<Step>
              title="Steps"
              items={content.steps}
              schema={[
                { key: "title", label: "Title", type: "input" },
                { key: "desc", label: "Description", type: "textarea" },
              ]}
              onAdd={() => setContent({ ...content, steps: [...content.steps, { title: "", desc: "" }] })}
              onChange={(items) => setContent({ ...content, steps: items })}
            />
          )}

          {activeTab === "Benefits" && (
            <ListSimpleEditor<Benefit>
              title="Benefits"
              items={content.benefits}
              schema={[
                { key: "title", label: "Title", type: "input" },
                { key: "desc", label: "Description", type: "textarea" },
              ]}
              onAdd={() => setContent({ ...content, benefits: [...content.benefits, { title: "", desc: "" }] })}
              onChange={(items) => setContent({ ...content, benefits: items })}
            />
          )}

          {activeTab === "Comparisons" && (
            <ListSimpleEditor<Comparison>
              title="Why Choose Us"
              items={content.comparisons}
              schema={[
                { key: "title", label: "Title", type: "input" },
                { key: "desc", label: "Description", type: "textarea" },
              ]}
              onAdd={() => setContent({ ...content, comparisons: [...content.comparisons, { title: "", desc: "" }] })}
              onChange={(items) => setContent({ ...content, comparisons: items })}
            />
          )}

          {activeTab === "Testimonials" && (
            <ListWithImageEditor<Testimonial>
              title="Testimonials"
              items={content.testimonials}
              schema={[
                { key: "name", label: "Name", type: "input" },
                { key: "role", label: "Role", type: "input" },
                { key: "feedback", label: "Feedback", type: "textarea" },
                { key: "avatar", label: "Avatar", type: "image" },
              ]}
              onAdd={() =>
                setContent({
                  ...content,
                  testimonials: [...content.testimonials, { name: "", role: "", feedback: "", avatar: "/profile.svg" }],
                })
              }
              onChange={(items) => setContent({ ...content, testimonials: items })}
            />
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------- Reusable Editors ---------- */
function ListSimpleEditor<T extends Record<string, any>>({
  title,
  items,
  schema,
  onAdd,
  onChange,
}: {
  title: string;
  items: T[];
  schema: { key: keyof T; label: string; type: "input" | "textarea" }[];
  onAdd: () => void;
  onChange: (items: T[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#7ec7ff]">{title}</h4>
        <AddBtn onClick={onAdd} />
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3 grid gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              {schema.map((f) =>
                f.type === "input" ? (
                  <Input
                    key={String(f.key)}
                    label={f.label}
                    value={String(it[f.key] ?? "")}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[i] = { ...arr[i], [f.key]: v };
                      onChange(arr);
                    }}
                  />
                ) : (
                  <Textarea
                    key={String(f.key)}
                    label={f.label}
                    value={String(it[f.key] ?? "")}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[i] = { ...arr[i], [f.key]: v };
                      onChange(arr);
                    }}
                  />
                )
              )}
            </div>
            <div className="flex justify-end">
              <RemoveBtn onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListWithImageEditor<T extends Record<string, any>>({
  title,
  items,
  schema,
  onAdd,
  onChange,
}: {
  title: string;
  items: T[];
  schema: { key: keyof T; label: string; type: "input" | "textarea" | "image" }[];
  onAdd: () => void;
  onChange: (items: T[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#7ec7ff]">{title}</h4>
        <AddBtn onClick={onAdd} />
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3 grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schema.map((f) => {
                if (f.type === "image") {
                  return (
                    <UploadImage
                      key={String(f.key)}
                      label={f.label}
                      value={String(it[f.key] ?? "")}
                      onChange={(url) => {
                        const arr = [...items];
                        arr[i] = { ...arr[i], [f.key]: url };
                        onChange(arr);
                      }}
                    />
                  );
                }
                if (f.type === "textarea") {
                  return (
                    <Textarea
                      key={String(f.key)}
                      label={f.label}
                      value={String(it[f.key] ?? "")}
                      onChange={(v) => {
                        const arr = [...items];
                        arr[i] = { ...arr[i], [f.key]: v };
                        onChange(arr);
                      }}
                    />
                  );
                }
                return (
                  <Input
                    key={String(f.key)}
                    label={f.label}
                    value={String(it[f.key] ?? "")}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[i] = { ...arr[i], [f.key]: v };
                      onChange(arr);
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-end">
              <RemoveBtn onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Small UI components ---------- */
function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <input
        className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <textarea
        className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1d9bf0]/40 text-[#7ec7ff] hover:bg-[#072b56]/40"
    >
      <Plus className="w-4 h-4" /> Add
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-red-500/30 text-red-300 hover:bg-red-900/20 px-3 py-2"
      title="Remove"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

/* ---------- Upload Image Component ---------- */
function UploadImage({
  label,
  value,
  onChange,
  accept = "image/*",
  fieldName = "file",
  maxMB = 5,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  fieldName?: string;
  maxMB?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string>("");

  async function handleFile(file: File) {
    setErr("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("File harus berupa gambar.");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setErr(`Ukuran gambar maksimal ${maxMB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageToServer(file, fieldName);
      onChange(url);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Unknown error";
      setErr(
        msg.includes("404")
          ? `Endpoint upload tidak ditemukan (404). Cek NEXT_PUBLIC_UPLOAD_PATH / prefix backend. Detail: ${msg}`
          : `Upload gagal: ${msg}`
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`block rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition ${
          uploading ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-white/90">
            {uploading ? "Uploading…" : value ? "Ubah gambar" : "Pilih / drag & drop gambar di sini"}
          </div>
          <div className="text-xs text-white/60">PNG · JPG · WEBP</div>
        </div>
      </label>

      {value && (
        <div className="mt-3 flex items-start gap-3">
          <img src={value} alt="preview" className="w-32 h-24 object-cover rounded-lg border border-white/10" />
          <button
            type="button"
            className="h-9 px-3 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-900/20 text-sm"
            onClick={() => onChange("")}
            title="Hapus gambar"
          >
            Hapus
          </button>
        </div>
      )}

      <div className="mt-3">
        <input
          className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
          placeholder="atau paste URL gambar di sini…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {err && (
        <p className="mt-2 text-xs text-red-300 bg-red-900/30 border border-red-700/30 rounded-lg p-2">
          {err}
        </p>
      )}
    </div>
  );
}
