"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

/* ---------------- Types ---------------- */
type FeatureIconKey = "FaBolt" | "FaChartBar" | "FaLock";

type Content = {
  hero: {
    heading: string;
    subheading: string;
    // tetap pakai field ini untuk URL gambar hero agar kompatibel
    videoSrc: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    brand: string;
    body: string;
    stats: { value: string; text: string }[];
    companyCta: { label: string; href: string };
  };
  features: { iconKey: FeatureIconKey; title: string; desc: string }[];
  products: {
    tiles: { value: string; text: string }[];
    stable: { title: string; body: string; imageSrc: string };
  };
  leadership: { name: string; role: string; img: string }[];
  contacts: { name: string; number: string; role: string; img: string }[];
  location: {
    address: string;
    hours: string;
    phone: string;
    mapsUrl: string;
    iframeSrc: string;
  };
};

/* ---------------- Defaults & Template ---------------- */
const DEFAULTS: Content = {
  hero: {
    heading: "",
    subheading: "",
    videoSrc: "",
    primaryCta: { label: "", href: "" },
    secondaryCta: { label: "", href: "" },
  },
  about: {
    brand: "",
    body: "",
    stats: [],
    companyCta: { label: "", href: "" },
  },
  features: [],
  products: {
    tiles: [],
    stable: { title: "", body: "", imageSrc: "" },
  },
  leadership: [],
  contacts: [],
  location: {
    address: "",
    hours: "",
    phone: "",
    mapsUrl: "",
    iframeSrc: "",
  },
};

// Template awal (boleh dihapus jika tidak perlu)
const TEMPLATE_LANDING: Content = {
  hero: {
    heading: "Intelligent Energy Management for a Smarter, Sustainable Future",
    subheading:
      "Power management system offers a cutting-edge platform for real-time energy monitoring and management, helping you optimize consumption, reduce costs, and promote sustainability—all through a secure and intuitive interface.",
    videoSrc: "/hero.jpg", // sekarang dianggap gambar, bukan video
    primaryCta: { label: "Experience It Now", href: "/register" },
    secondaryCta: { label: "Discover More Features", href: "/discover" },
  },
  about: {
    brand: "PowerSys",
    body:
      "Power Monitoring System is an intelligent energy management platform designed to help businesses monitor, analyze, and optimize their power usage in real time. With advanced analytics and secure infrastructure, PowerSys empowers organizations to reduce costs and embrace a sustainable future.",
    stats: [
      { value: "3k+", text: "Businesses already trust Power Monitoring System" },
      { value: "20%", text: "Average energy savings per client" },
      { value: "24/7", text: "Secure monitoring & support" },
    ],
    companyCta: { label: "Learn More About Our Company", href: "/about" },
  },
  features: [
    {
      iconKey: "FaBolt",
      title: "Real-Time Monitoring",
      desc: "Monitor your devices instantly and gain full control over your energy usage in real time.",
    },
    {
      iconKey: "FaChartBar",
      title: "Energy Analytics",
      desc: "Visualize your energy consumption through detailed, interactive analytics and actionable insights.",
    },
    {
      iconKey: "FaLock",
      title: "Data Security",
      desc: "All your data is encrypted and protected with industry-standard security measures for complete peace of mind.",
    },
  ],
  products: {
    tiles: [
      {
        value: "3k +",
        text: "Businesses already Running on Power Management System",
      },
      {
        value: "",
        text: "PowerSys integrates effortlessly with your existing infrastructure, ensuring a smooth transition without disruptions to your daily workflow.",
      },
    ],
    stable: {
      title: "Stable Performance",
      body:
        "No asset volatility – reliable, consistent, and predictable performance. With PowerSys, your operations remain uninterrupted, ensuring smooth performance that scales with your business. Designed for durability and long-term stability, our system provides confidence at every step of your energy journey.",
      imageSrc: "/monitoring.png",
    },
  },
  leadership: [
    {
      name: "Alice Williams",
      role: "CEO - Leading the company's vision for sustainable energy solutions.",
      img: "/profile.svg",
    },
    {
      name: "Robert Brown",
      role: "CTO - Overseeing technological innovation and product development.",
      img: "/profile.svg",
    },
    {
      name: "Emma Davis",
      role: "COO - Managing operations to ensure efficiency and growth.",
      img: "/profile.svg",
    },
  ],
  contacts: [
    { name: "David", number: "6281234567890", role: "Sales Manager", img: "/profile.svg" },
    { name: "Sophia", number: "6289876543210", role: "Customer Support", img: "/profile.svg" },
    { name: "Michael", number: "6281122334455", role: "Technical Support", img: "/profile.svg" },
  ],
  location: {
    address:
      "Jl. Kp Pamahan No 63 Kel. Jatimekar, Kel. Jatiasih Bekasi - Jawa Barat.",
    hours: "Monday – Friday, 09:00 – 17:30",
    phone: "+62 812 3456 7890",
    mapsUrl: "https://maps.app.goo.gl/gvk4YYXyBh6SgBPQA",
    iframeSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.635313053707!2d106.8302673153913!3d-6.208763662548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e7f2e7d2bb%3A0x9f1a6e6d4e02a2e7!2sJakarta!5e0!3m2!1sen!2sid!4v1691234567890!5m2!1sen!2sid",
  },
};

const ICON_OPTIONS: FeatureIconKey[] = ["FaBolt", "FaChartBar", "FaLock"];

// <<< Tanpa slug: kunci dokumen tunggal >>>
const CONTENT_KEY = process.env.NEXT_PUBLIC_CONTENT_KEY ?? "landing";

/* ---------------- Utils ---------------- */
function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  if (typeof window !== "undefined" && location.protocol === "https:" && base.startsWith("http://")) {
    console.warn("[upload] Mixed content: API http di page https");
  }
  return base;
}
function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
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
function allowlistedEmbed(src: string): string {
  try {
    const u = new URL(src);
    const okHost = /(^|\.)google\.(com|co\.\w+)$/i.test(u.hostname);
    const okPath = u.pathname.includes("/maps") && (u.pathname.includes("/embed") || u.search.includes("pb="));
    return okHost && okPath ? src : "";
  } catch {
    return "";
  }
}

/* ---------------- Upload helper (patched) ---------------- */
async function uploadImageToServer(file: File, fieldName = "file"): Promise<string> {
  const base = getApiBase();
  const token = (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
  const form = new FormData();
  form.append(fieldName, file);

  // Bisa override via ENV kalau route backend beda
  const primaryPath = process.env.NEXT_PUBLIC_UPLOAD_PATH || "/api/v1/upload";
  const candidates = [primaryPath, "/upload"]; // fallback umum; tambah path lain kalau perlu

  let lastErr: any = null;

  for (const path of candidates) {
    const url = joinUrl(base, path);
    try {
      console.debug("[upload] POST", url);
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
          console.warn("[upload] 404 on", url, "→ trying next path");
          continue; // coba kandidat berikutnya
        }
        throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`);
      }

      const json = await res.json();
      const urlOut = json?.url ?? json?.path ?? json?.location ?? json?.secure_url ?? "";
      if (!urlOut) throw new Error("Upload response missing url|path|location");
      return urlOut;
    } catch (e) {
      lastErr = e;
      // untuk error selain 404 (mis. network/CORS), hentikan loop
      if (!(e instanceof Error && String(e.message).includes("404"))) break;
    }
  }

  throw lastErr ?? new Error("Upload failed for all candidate paths");
}

/* ---------------- Component ---------------- */
export default function AdminFolderEditor() {
  const router = useRouter();

  const [content, setContent] = useState<Content>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "Hero" | "About" | "Features" | "Products" | "Leadership" | "Contacts" | "Location"
  >("Hero");

  // Load from Nest API (flexible shape + deep merge)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const base = getApiBase();
        const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(CONTENT_KEY)}`);
        console.debug("[content] GET", url);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`${res.status} ${res.statusText}${txt ? ` – ${txt}` : ""}`);
        }
        const raw = await res.json();
        const loaded = "data" in raw ? raw.data : raw; // bisa {data: ...} atau langsung Content
        if (mounted) setContent(deepMerge(DEFAULTS, loaded));
      } catch (e: any) {
        setError(`Load failed: ${e?.message ?? "Unknown error"}`);
        setContent(DEFAULTS);
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
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(CONTENT_KEY)}`);
      const sanitized: Content = {
        ...content,
        location: { ...content.location, iframeSrc: allowlistedEmbed(content.location.iframeSrc) },
      };
      console.debug("[content] PUT", url);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: sanitized, updatedBy: "admin@powersys" }),
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
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(CONTENT_KEY)}`);
      console.debug("[content] RESET", url);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const raw = await res.json();
      const loaded = "data" in raw ? raw.data : raw;
      setContent(deepMerge(DEFAULTS, loaded));
    } catch (e: any) {
      setError(`Reload failed: ${e?.message ?? "Unknown error"}`);
    }
  }

  function useTemplate() {
    // deep clone agar tidak share reference
    setContent(JSON.parse(JSON.stringify(TEMPLATE_LANDING)));
  }

  const tabs = useMemo(
    () =>
      [
        "Hero",
        "About",
        "Features",
        "Products",
        "Leadership",
        "Contacts",
        "Location",
      ] as const,
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
      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-[#041023]/60 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-medium text-sm md:text-base">Edit Landing Page</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-3 py-2 rounded-xl border border-[#6fb6ff]/40 hover:bg-white/5 text-sm"
            >
              Preview Site
            </button>
            <button
              onClick={useTemplate}
              className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-sm"
              title="Use landing template"
            >
              Use Template
            </button>
            <button
              onClick={resetFromServer}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-sm"
              title="Reload from server"
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
        <aside className="w-[240px] rounded-2xl p-3 bg-white/5 border border-white/10 md:sticky md:top-[84px]">
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

        {/* Editor Panel */}
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
                label="Heading"
                value={content.hero.heading}
                onChange={(v) =>
                  setContent({ ...content, hero: { ...content.hero, heading: v } })
                }
              />
              <Textarea
                label="Subheading"
                value={content.hero.subheading}
                onChange={(v) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, subheading: v },
                  })
                }
              />

              {/* Upload gambar hero (disimpan ke hero.videoSrc supaya kompatibel) */}
              <UploadImage
                label="Hero Image"
                value={content.hero.videoSrc}
                onChange={(url) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, videoSrc: url },
                  })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Primary CTA Label"
                  value={content.hero.primaryCta.label}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        primaryCta: { ...content.hero.primaryCta, label: v },
                      },
                    })
                  }
                />
                <Input
                  label="Primary CTA Href"
                  value={content.hero.primaryCta.href}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        primaryCta: { ...content.hero.primaryCta, href: v },
                      },
                    })
                  }
                />
                <Input
                  label="Secondary CTA Label"
                  value={content.hero.secondaryCta.label}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        secondaryCta: { ...content.hero.secondaryCta, label: v },
                      },
                    })
                  }
                />
                <Input
                  label="Secondary CTA Href"
                  value={content.hero.secondaryCta.href}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        secondaryCta: { ...content.hero.secondaryCta, href: v },
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {activeTab === "About" && (
            <div className="space-y-4">
              <Input
                label="Brand"
                value={content.about.brand}
                onChange={(v) =>
                  setContent({ ...content, about: { ...content.about, brand: v } })
                }
              />
              <Textarea
                label="Body"
                value={content.about.body}
                onChange={(v) =>
                  setContent({ ...content, about: { ...content.about, body: v } })
                }
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-[#7ec7ff]">Stats</h4>
                  <AddBtn
                    onClick={() =>
                      setContent({
                        ...content,
                        about: {
                          ...content.about,
                          stats: [...content.about.stats, { value: "", text: "" }],
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-3">
                  {content.about.stats.map((s, i) => (
                    <div
                      key={i}
                      className="
                        grid grid-cols-1
                        md:[grid-template-columns:160px_minmax(0,1fr)_auto]
                        gap-3 items-center
                      "
                    >
                      <div className="min-w-0">
                        <Input
                          label="Value"
                          value={s.value}
                          onChange={(v) => {
                            const stats = [...content.about.stats];
                            stats[i] = { ...s, value: v };
                            setContent({
                              ...content,
                              about: { ...content.about, stats },
                            });
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <Input
                          label="Text"
                          value={s.text}
                          onChange={(v) => {
                            const stats = [...content.about.stats];
                            stats[i] = { ...s, text: v };
                            setContent({
                              ...content,
                              about: { ...content.about, stats },
                            });
                          }}
                        />
                      </div>
                      <RemoveBtn
                        onClick={() => {
                          const stats = content.about.stats.filter(
                            (_, idx) => idx !== i
                          );
                          setContent({
                            ...content,
                            about: { ...content.about, stats },
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company CTA Label"
                  value={content.about.companyCta.label}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        companyCta: {
                          ...content.about.companyCta,
                          label: v,
                        },
                      },
                    })
                  }
                />
                <Input
                  label="Company CTA Href"
                  value={content.about.companyCta.href}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        companyCta: {
                          ...content.about.companyCta,
                          href: v,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {activeTab === "Features" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-[#7ec7ff]">Features</h4>
                <AddBtn
                  onClick={() =>
                    setContent({
                      ...content,
                      features: [
                        ...content.features,
                        { iconKey: "FaBolt", title: "", desc: "" },
                      ],
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                {content.features.map((f, i) => (
                  <div
                    key={i}
                    className="
                      rounded-xl border border-white/10 p-3
                      grid grid-cols-1
                      md:[grid-template-columns:160px_minmax(0,1fr)_minmax(0,1fr)_auto]
                      gap-3
                    "
                  >
                    <div className="min-w-0">
                      <Select
                        label="Icon"
                        value={f.iconKey}
                        options={ICON_OPTIONS}
                        onChange={(v) => {
                          const features = [...content.features];
                          features[i] = { ...f, iconKey: v as FeatureIconKey };
                          setContent({ ...content, features });
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <Input
                        label="Title"
                        value={f.title}
                        onChange={(v) => {
                          const features = [...content.features];
                          features[i] = { ...f, title: v };
                          setContent({ ...content, features });
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <Input
                        label="Description"
                        value={f.desc}
                        onChange={(v) => {
                          const features = [...content.features];
                          features[i] = { ...f, desc: v };
                          setContent({ ...content, features });
                        }}
                      />
                    </div>
                    <RemoveBtn
                      onClick={() => {
                        const features = content.features.filter(
                          (_, idx) => idx !== i
                        );
                        setContent({ ...content, features });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Products" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-[#7ec7ff]">Tiles</h4>
                  <AddBtn
                    onClick={() =>
                      setContent({
                        ...content,
                        products: {
                          ...content.products,
                          tiles: [
                            ...content.products.tiles,
                            { value: "", text: "" },
                          ],
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-3">
                  {content.products.tiles.map((t, i) => (
                    <div
                      key={i}
                      className="
                        grid grid-cols-1
                        md:[grid-template-columns:140px_minmax(0,1fr)_auto]
                        gap-3 items-center
                      "
                    >
                      <div className="min-w-0">
                        <Input
                          label="Value"
                          value={t.value}
                          onChange={(v) => {
                            const tiles = [...content.products.tiles];
                            tiles[i] = { ...t, value: v };
                            setContent({
                              ...content,
                              products: { ...content.products, tiles },
                            });
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <Input
                          label="Text"
                          value={t.text}
                          onChange={(v) => {
                            const tiles = [...content.products.tiles];
                            tiles[i] = { ...t, text: v };
                            setContent({
                              ...content,
                              products: { ...content.products, tiles },
                            });
                          }}
                        />
                      </div>
                      <RemoveBtn
                        onClick={() => {
                          const tiles = content.products.tiles.filter(
                            (_, idx) => idx !== i
                          );
                          setContent({
                            ...content,
                            products: { ...content.products, tiles },
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Stable Title"
                  value={content.products.stable.title}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      products: {
                        ...content.products,
                        stable: { ...content.products.stable, title: v },
                      },
                    })
                  }
                />
                {/* Upload gambar stable */}
                <UploadImage
                  label="Stable Image"
                  value={content.products.stable.imageSrc}
                  onChange={(url) =>
                    setContent({
                      ...content,
                      products: {
                        ...content.products,
                        stable: { ...content.products.stable, imageSrc: url },
                      },
                    })
                  }
                />
              </div>
              <Textarea
                label="Stable Body"
                value={content.products.stable.body}
                onChange={(v) =>
                  setContent({
                    ...content,
                    products: {
                      ...content.products,
                      stable: { ...content.products.stable, body: v },
                    },
                  })
                }
              />
            </div>
          )}

          {activeTab === "Leadership" && (
            <ArrayPeopleEditor
              title="Leadership Team"
              items={content.leadership}
              onChange={(items) => setContent({ ...content, leadership: items })}
            />
          )}

          {activeTab === "Contacts" && (
            <ArrayPeopleEditor
              title="Contacts / WhatsApp"
              items={content.contacts}
              phoneField
              onChange={(items) => setContent({ ...content, contacts: items })}
            />
          )}

          {activeTab === "Location" && (
            <div className="space-y-4">
              <Input
                label="Address"
                value={content.location.address}
                onChange={(v) =>
                  setContent({
                    ...content,
                    location: { ...content.location, address: v },
                  })
                }
              />
              <Input
                label="Hours"
                value={content.location.hours}
                onChange={(v) =>
                  setContent({
                    ...content,
                    location: { ...content.location, hours: v },
                  })
                }
              />
              <Input
                label="Phone"
                value={content.location.phone}
                onChange={(v) =>
                  setContent({
                    ...content,
                    location: { ...content.location, phone: v },
                  })
                }
              />
              <Input
                label="Google Maps URL"
                value={content.location.mapsUrl}
                onChange={(v) =>
                  setContent({
                    ...content,
                    location: { ...content.location, mapsUrl: v },
                  })
                }
              />
              <Textarea
                label="Google Maps iframe Src"
                value={content.location.iframeSrc}
                onChange={(v) =>
                  setContent({
                    ...content,
                    location: { ...content.location, iframeSrc: v },
                  })
                }
              />
              <p className="text-xs text-white/60">
                Tip: iframe src bisa langsung dipaste dari Google Maps → “Share”
                → “Embed a map”.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
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
  value: string; // URL hasil upload (atau kosong)
  onChange: (url: string) => void;
  accept?: string;
  fieldName?: string; // untuk kompatibilitas endpoint kalau beda
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
      // teruskan fieldName ke helper
      const url = await uploadImageToServer(file, fieldName);
      onChange(url);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Unknown error";
      setErr(
        msg.includes("404")
          ? `Endpoint upload tidak ditemukan (404). Cek NEXT_PUBLIC_UPLOAD_PATH / prefix route backend. Detail: ${msg}`
          : `Upload gagal: ${msg}`
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>

      {/* Area pilih/drag file */}
      <label
        onDragOver={(e) => { e.preventDefault(); }}
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
            {uploading
              ? "Uploading…"
              : value
              ? "Ubah gambar"
              : "Pilih atau tarik-lepas gambar ke sini"}
          </div>
          <div className="text-xs text-white/60">PNG · JPG · WEBP</div>
        </div>
      </label>

      {/* Preview + tombol hapus */}
      {value && (
        <div className="mt-3 flex items-start gap-3">
          <img
            src={value}
            alt="preview"
            className="w-32 h-24 object-cover rounded-lg border border-white/10"
          />
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

      {/* Alternatif: paste URL manual */}
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

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <select
        className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
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

function ArrayPeopleEditor({
  title,
  items,
  onChange,
  phoneField = false,
}: {
  title: string;
  items: { name: string; role: string; img: string; number?: string }[];
  onChange: (items: any[]) => void;
  phoneField?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#7ec7ff]">{title}</h4>
        <AddBtn
          onClick={() =>
            onChange([
              ...items,
              {
                name: "",
                role: "",
                img: "/profile.svg",
                ...(phoneField ? { number: "" } : {}),
              },
            ])
          }
        />
      </div>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div
            key={i}
            className={`
              rounded-xl border border-white/10 p-3 grid gap-3
              grid-cols-1
              ${
                phoneField
                  ? "md:[grid-template-columns:repeat(4,minmax(0,1fr))_auto]"
                  : "md:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              }
            `}
          >
            <div className="min-w-0">
              <Input
                label="Name"
                value={p.name}
                onChange={(v) => {
                  const arr = [...items];
                  arr[i] = { ...p, name: v };
                  onChange(arr);
                }}
              />
            </div>
            <div className="min-w-0">
              <Input
                label="Role"
                value={p.role}
                onChange={(v) => {
                  const arr = [...items];
                  arr[i] = { ...p, role: v };
                  onChange(arr);
                }}
              />
            </div>

            {/* Upload avatar */}
            <div className="min-w-0">
              <UploadImage
                label="Image"
                value={p.img}
                onChange={(url) => {
                  const arr = [...items];
                  arr[i] = { ...p, img: url };
                  onChange(arr);
                }}
              />
            </div>

            {phoneField ? (
              <>
                <div className="min-w-0">
                  <Input
                    label="Phone (62...)"
                    value={(p as any).number ?? ""}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[i] = { ...p, number: v } as any;
                      onChange(arr);
                    }}
                  />
                </div>
                <RemoveBtn
                  onClick={() => {
                    const arr = items.filter((_, idx) => idx !== i);
                    onChange(arr);
                  }}
                />
              </>
            ) : (
              <RemoveBtn
                onClick={() => {
                  const arr = items.filter((_, idx) => idx !== i);
                  onChange(arr);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
