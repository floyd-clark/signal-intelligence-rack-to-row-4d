import { Assembly, type RenderAsset } from "../../scene/hardware/assembly";
import { materials } from "../../scene/hardware/materials";
import type { Architecture } from "../types";
import { nvl72, helios, ironwood } from "./heroes";
import { rubin, rubinTray } from "./rubin";
import {
  eia,
  orv3,
  dgx,
  trainium,
  maia,
  cerebras,
  cray,
  dgxTray,
  wafer,
  blade,
  heatExchanger,
  enterpriseTray,
} from "./families";
import { trayDetails, chipDetails, part, type ModelOptions } from "./common";
export const builders: Record<
  string,
  (a: Assembly, d: Architecture, o: ModelOptions) => void
> = {
  nvl72,
  helios,
  ironwood,
  eia,
  orv3,
  dgx,
  trainium,
  maia,
  cerebras,
  cray,
  rubin,
};
export function buildModel(
  d: Architecture,
  o: ModelOptions,
  palette?: Parameters<Assembly["finish"]>[0],
): RenderAsset {
  let contextOnly = false;
  class LevelAssembly extends Assembly {
    override add(...args: Parameters<Assembly["add"]>) {
      const record = d.components.find((p) => p.id === args[0]);
      if (
        (o.view === "rack" || o.view === "row") &&
        record &&
        record.level > o.level
      ) {
        args[2].dispose();
        return;
      }
      if (contextOnly) args[0] = "";
      super.add(...args);
    }
  }
  const a = new LevelAssembly();
  if (o.view === "tray") {
    if (d.shape === "rubin") rubinTray(a, d, o);
    else if (d.shape === "eia" || d.shape === "orv3") enterpriseTray(a, d, o);
    else if (d.shape === "dgx") dgxTray(a, d, o);
    else if (d.shape === "cray") blade(a, d, o);
    else if (d.shape === "cerebras") {
      wafer(a, part(d, "chip/1.1"), 2.5);
      a.box(part(d, "tray/1"), "steel", [0, -0.25, 0], [3.3, 0.3, 3.3], 0.1);
    } else trayDetails(a, d, o);
  } else if (o.view === "chip")
    ["eia", "orv3"].includes(d.shape)
      ? enterpriseTray(a, d, o)
      : d.shape === "cerebras"
        ? wafer(a, part(d, "chip/1.1"), 2.5)
        : chipDetails(a, d, o);
  else if (o.view === "component") {
    if (o.concept === "cooling" && d.cooling !== "air") heatExchanger(a, d, 0);
    else if (o.concept === "power" && d.cooling === "air") {
      const id = part(d, "power/1");
      a.box(id, "polymer", [0, 0, 0], [0.35, 0.2, 3.5], 0.1);
      for (let i = 0; i < 8; i++) {
        a.box(id, "edge", [0, 0.13, -1.5 + i * 0.4], [0.23, 0.07, 0.22], 0.1);
        a.box(id, "black", [0, 0.18, -1.5 + i * 0.4], [0.16, 0.03, 0.14]);
      }
      a.pipe(
        id,
        "polymer",
        [
          [0, 0, -1.7],
          [0, 0, -2.1],
          [0.6, 0.1, -2.1],
        ],
        0.06,
        10,
      );
    } else if (o.concept === "power") {
      a.box(part(d, "power/1"), "copper", [0, 0, 0], [0.4, 0.15, 3.5], 0.1);
      for (let i = 0; i < 8; i++) {
        a.box(
          part(d, "power/1"),
          "polymer",
          [0, 0.14, -1.5 + i * 0.4],
          [0.65, 0.12, 0.2],
          0.1,
        );
        a.bolt(part(d, "power/1"), [0, 0.23, -1.5 + i * 0.4], 0.06);
      }
    } else if (d.shape === "cray") blade(a, d, o);
    else trayDetails(a, d, o);
  } else if (o.view === "topology") topology(a, d);
  else {
    const build = builders[d.shape];
    if (!build) throw Error("Model under construction: " + d.familyName);
    build(a, d, o);
    if (o.view === "row") {
      contextOnly = true;
      for (const x of [-d.width - 1, d.width + 1])
        a.withTransform([x, 0, 0], [1, 1, 1], () =>
          build(a, d, { ...o, explode: 0 }),
        );
      contextOnly = false;
    }
  }
  for (const [id, owner] of a.owners) {
    const record = d.components.find((p) => p.id === id);
    owner.kind = record
      ? `${d.familyName}: ${record.name} / ${record.concept}`
      : `${d.familyName}: illustrative assembly`;
  }
  return a.finish(palette || materials(o.quality));
}
function topology(a: Assembly, d: Architecture) {
  const id = part(d, "network");
  if (d.shape === "ironwood") {
    for (let i = 0; i < 64; i++) {
      const x = i % 4,
        y = Math.floor(i / 4) % 4,
        z = Math.floor(i / 16);
      const p: [number, number, number] = [
        (x - 1.5) * 0.65,
        y * 0.65 + 0.4,
        (z - 1.5) * 0.65,
      ];
      a.box(
        part(d, `chip/${Math.floor(i / 4) + 1}.${(i % 4) + 1}`),
        "ceramic",
        p,
        [0.17, 0.13, 0.17],
        0.12,
      );
      for (let axis = 0; axis < 3; axis++) {
        const n = [x, y, z];
        n[axis] = (n[axis] + 1) % 4;
        const end: [number, number, number] = [
          (n[0] - 1.5) * 0.65,
          n[1] * 0.65 + 0.4,
          (n[2] - 1.5) * 0.65,
        ];
        if ([x, y, z][axis] < 3)
          a.pipe(
            part(d, "fabric/ici"),
            ["supply", "copper", "pcbBlue"][axis],
            [p, end],
            0.009,
            4,
          );
        else {
          const middle = p.map((v, k) => (k === axis ? v + 0.3 : v + 0.18)) as [
            number,
            number,
            number,
          ];
          a.pipe(
            part(d, "fabric/ici"),
            ["supply", "copper", "pcbBlue"][axis],
            [
              p,
              middle,
              [...end.map((v, k) => (k === axis ? v - 0.3 : v + 0.18))] as [
                number,
                number,
                number,
              ],
              end,
            ],
            0.007,
            8,
          );
        }
      }
    }
    a.box(part(d, "fabric/ocs"), "steel", [2.15, 1.4, 0], [0.5, 1.9, 0.5], 0.1);
    for (let y = 0.7; y < 2.3; y += 0.2)
      a.box(part(d, "fabric/ocs"), "gold", [2.15, y, 0.28], [0.35, 0.07, 0.07]);
  } else if (d.shape === "cerebras") {
    for (let i = 0; i < 3; i++)
      a.withTransform([(i - 1) * 1.4, 1.6, 0], [0.42, 0.42, 0.42], () =>
        wafer(a, part(d, `chip/${i + 1}.1`), 2.5, true),
      );
    for (let i = 0; i < 2; i++)
      a.pipe(
        id,
        "copper",
        [
          [i * 1.4 - 1.4, 1.6, 0.2],
          [i * 1.4 - 0.7, 1.6, 0.35],
          [i * 1.4, 1.6, 0.2],
        ],
        0.025,
        8,
      );
    a.box(id, "steel", [0, 0.35, 0], [3.8, 0.2, 0.6], 0.1);
  } else if (
    ["nvl72", "rubin", "helios", "dgx", "trainium"].includes(d.shape)
  ) {
    const count = d.shape === "dgx" ? 8 : d.shape === "trainium" ? 48 : 72;
    const cols = d.shape === "dgx" ? 4 : 9;
    const switches = ["nvl72", "rubin"].includes(d.shape)
      ? 9
      : d.shape === "helios"
        ? 4
        : d.shape === "dgx"
          ? 2
          : 3;
    for (let i = 0; i < count; i++) {
      const x = ((i % cols) - (cols - 1) / 2) * 0.4,
        y = 0.45 + Math.floor(i / cols) * 0.35;
      const tray = d.shape === "dgx" ? 1 : Math.floor(i / 4) + 1,
        chip = d.shape === "dgx" ? i + 1 : (i % 4) + 1;
      const chipId = part(d, `chip/${tray}.${chip}`);
      a.box(chipId, "ceramic", [x, y, 0.35], [0.16, 0.1, 0.16], 0.12);
      const dest = ((i % switches) - (switches - 1) / 2) * 0.4;
      a.pipe(
        id,
        "supply",
        [
          [x, y, 0.35],
          [x, y, -0.4],
          [dest, 3.6, -0.4],
        ],
        0.009,
        6,
      );
    }
    for (let i = 0; i < switches; i++)
      a.box(
        d.shape === "dgx" ? id : part(d, `fabric/${i + 1}`),
        "steel",
        [(i - (switches - 1) / 2) * 0.4, 3.6, -0.4],
        [0.29, d.shape === "helios" ? 0.4 : 0.15, 0.35],
        0.12,
      );
  } else {
    for (let i = 0; i < 8; i++) {
      const x = ((i % 4) - 1.5) * 0.7,
        y = 0.7 + Math.floor(i / 4) * 0.8;
      a.box(
        part(d, `tray/${Math.min(i + 1, d.layout.trays)}`),
        "pcbBlue",
        [x, y, 0.3],
        [0.35, 0.2, 0.5],
        0.12,
      );
      a.pipe(
        id,
        "supply",
        [
          [x, y, 0.3],
          [x, y, -0.4],
          [0, 2.9, -0.4],
        ],
        0.015,
        8,
      );
    }
    a.box(id, "steel", [0, 2.9, -0.4], [1.2, 0.22, 0.5], 0.12);
  }
}
