import type { Architecture } from "./types";
const cache = new Map<string, Architecture>();
export function resolveArchitecture(
  base: Architecture,
  variant: string,
): Architecture {
  if (variant !== "rubin" || base.architectureId !== "CAT-04") return base;
  const key = base.architectureId + variant;
  if (cache.has(key)) return cache.get(key)!;
  const a: Architecture = {
    ...base,
    modelFidelityScore: null,
    humanReview: undefined,
    familyName: "NVIDIA Vera Rubin NVL72",
    generation: "Vera / Rubin / NVLink 6",
    unitOfComparison: "One 72-GPU Vera Rubin reference rack",
    assetRefs: ["models/rubin"],
    powerTree: [
      "AC input",
      "Four 110 kW shelves",
      "54 V liquid-cooled busbar",
      "Vera/Rubin trays",
    ],
    networkFabrics: ["NVLink 6", "ConnectX-9 / BlueField-4"],
    shape: "rubin",
    releaseStatus:
      "Published generation hardware manual; deployment not inferred",
    power:
      "Four 110 kW shelves; six 18.3 kW air-cooled PSUs each; 54 V liquid-cooled busbar",
    fabric: "Rack-wide sixth-generation NVLink / nine switch trays",
    scaleOut: "ConnectX-9 / BlueField-4",
    sourceRefs: ["rubin"],
    claims: [
      ["Compute trays", 18, "tray"],
      ["GPUs", 72, "GPU"],
      ["Vera CPUs", 36, "CPU"],
      ["NVLink 6 trays", 9, "tray"],
      ["Power shelves", 4, "shelf"],
      ["PSUs per shelf", 6, "PSU"],
      ["Shelf rating", 110, "kW"],
      ["PSU rating", 18.3, "kW"],
      ["DC output", 54, "V"],
    ].map(([name, value, unit]) => ({
      name: String(name),
      value: Number(value),
      unit: String(unit),
      scope: "DGX Vera Rubin NVL72 user guide hardware configuration",
      source: "rubin",
      checkedDate: "2026-10-15",
      qualifier:
        "Generation-specific; not inherited from GB300 or a deployed-site assertion",
    })),
    layout: { ...base.layout, shelves: 4 },
    components: base.components
      .filter(
        (p) => !p.id.includes("/power/") || Number(p.id.split("/").at(-1)) <= 4,
      )
      .map((p) => ({
        ...p,
        name: p.name
          .replaceAll(base.familyName, "NVIDIA Vera Rubin NVL72")
          .replaceAll(base.generation, "Vera / Rubin")
          .replaceAll("Grace", "Vera")
          .replaceAll("fifth-generation", "sixth-generation"),
        sourceRefs: ["rubin"],
      })),
    differentiator: "Two-board Vera/Rubin trays and four taller power shelves",
    disclosureBanner:
      "Vera Rubin generation delta: sourced quantities and component changes, original illustrative mechanical layout; no deployed-site claim.",
    variants: base.variants.map((v) => ({ ...v, modelled: true })),
  };
  cache.set(key, a);
  return a;
}
