import {
  MeshStandardMaterial,
  MeshLambertMaterial,
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
// Original local surface finish: no external images or environment maps.
function finish() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const data = ctx.createImageData(128, 128);
  for (let y = 0; y < 128; y++)
    for (let x = 0; x < 128; x++) {
      const v = 140 + ((x * 17 + y * 7) % 13);
      const i = (y * 128 + x) * 4;
      data.data.set([v, v, v, 255], i);
    }
  ctx.putImageData(data, 0, 0);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}
let palette: Record<string, MeshStandardMaterial> | null = null;
let lowPalette: Record<string, MeshLambertMaterial> | null = null;
export function materials(
  quality = "Balanced",
): Record<string, MeshStandardMaterial | MeshLambertMaterial> {
  if (quality === "Performance") {
    if (lowPalette) return lowPalette;
    const normal = materials("Balanced");
    lowPalette = Object.fromEntries(
      Object.entries(normal).map(([key, mat]) => [
        key,
        new MeshLambertMaterial({
          color: mat.color,
          emissive: mat.emissive,
          emissiveIntensity: mat.emissiveIntensity,
        }),
      ]),
    );
    return lowPalette;
  }
  if (palette) return palette;
  const rough = finish();
  const make = (color: string, metalness: number, roughness: number) =>
    new MeshStandardMaterial({
      color,
      metalness,
      roughness,
      roughnessMap: rough,
    });
  palette = {
    steel: make("#303a43", 0.75, 0.4),
    aluminum: make("#a6afb5", 0.8, 0.32),
    edge: make("#d3d9dc", 0.7, 0.3),
    black: make("#10171b", 0.1, 0.66),
    polymer: make("#20282c", 0.05, 0.72),
    pcb: make("#164b3c", 0.22, 0.6),
    pcbBlue: make("#173c50", 0.2, 0.58),
    copper: make("#b97b47", 0.82, 0.3),
    gold: make("#c2a052", 0.76, 0.35),
    silicon: make("#354a59", 0.48, 0.21),
    ceramic: make("#53616e", 0.2, 0.5),
    label: make("#dad9ca", 0.05, 0.8),
    supply: make("#438a9b", 0.5, 0.4),
    return: make("#b38159", 0.5, 0.4),
    led: new MeshStandardMaterial({
      color: "#8cdebc",
      emissive: "#53ae8e",
      emissiveIntensity: 0.7,
    }),
    amber: new MeshStandardMaterial({
      color: "#b88e49",
      emissive: "#a7611b",
      emissiveIntensity: 0.5,
    }),
  };
  return palette;
}
export const MATERIAL_KEYS = [
  "steel",
  "aluminum",
  "edge",
  "black",
  "polymer",
  "pcb",
  "pcbBlue",
  "copper",
  "gold",
  "silicon",
  "ceramic",
  "label",
  "supply",
  "return",
  "led",
  "amber",
];
