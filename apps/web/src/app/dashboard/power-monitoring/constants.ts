export const POWER_SECTIONS = [
  { key: "Voltage",      id: "voltage" },
  { key: "Current",      id: "current" },
  { key: "Frequency",    id: "frequency" },
  { key: "Power Factor", id: "power-factor" },
  { key: "Power",        id: "power" },
  { key: "Energy Usage", id: "energy-usage" },
] as const;

export type PowerKey = typeof POWER_SECTIONS[number]["key"];
export const slugify = (s: string) => s.toLowerCase().replace(/ /g, "-");
export const CARD_BG = "#032d7a";
