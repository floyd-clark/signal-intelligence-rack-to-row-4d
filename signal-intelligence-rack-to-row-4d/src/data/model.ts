import { z } from "zod";
import catalog from "./components/catalog.json";
import fs from "./profiles/fs-concept.json";
import nv from "./profiles/nvidia-gb200.json";
import tp from "./profiles/google-ironwood.json";
export const profiles = [fs, nv, tp];
export type Profile = typeof fs;
export type ProfileId =
  | "FS_CONCEPT"
  | "NVIDIA_GB200_NVL72_REFERENCE"
  | "GOOGLE_IRONWOOD_TPU_REFERENCE";
export type Family =
  | "mechanical"
  | "compute"
  | "memory"
  | "power"
  | "cooling"
  | "network"
  | "management"
  | "storage"
  | "safety"
  | "facility";
export interface ComponentRecord {
  id: string;
  type: string;
  displayName: string;
  vendorProfile: ProfileId;
  family: Family;
  parentId: string | null;
  physicalLocation: {
    row: string;
    rack: string;
    ru?: string;
    tray?: string;
    frontRear?: string;
  };
  modelNodeId: string;
  shortDescription: string;
  whatItDoes: string;
  whyItMatters: string;
  normalOperatingPrinciple: string;
  failureModes: string[];
  primaryFailureSignature: string;
  secondarySignatures: string[];
  alternativeExplanations: string[];
  telemetryKeys: string[];
  evidenceToCollect: string[];
  safeTriageSteps: string[];
  proposedContainment: string[];
  ownerFunctions: string[];
  validationTests: string[];
  exitCriteria: string[];
  downstreamDependencyIds: string[];
  npiGates: string[];
  sourceIds: string[];
  provenance:
    | "primary-vendor"
    | "industry-standard"
    | "user-provided"
    | "illustrative"
    | "simulation";
  confidence: "verified" | "well-supported" | "illustrative" | "unverified";
  applicabilityNotes: string;
  level: number;
  position: [number, number, number];
  size: [number, number, number];
}
const nonempty = z.string().min(1);
const arr = z.array(nonempty).min(1);
export const recordSchema = z.object({
  id: nonempty,
  type: nonempty,
  displayName: nonempty,
  vendorProfile: z.enum([
    "FS_CONCEPT",
    "NVIDIA_GB200_NVL72_REFERENCE",
    "GOOGLE_IRONWOOD_TPU_REFERENCE",
  ]),
  family: z.enum([
    "mechanical",
    "compute",
    "memory",
    "power",
    "cooling",
    "network",
    "management",
    "storage",
    "safety",
    "facility",
  ]),
  parentId: nonempty.nullable(),
  physicalLocation: z.object({ row: nonempty, rack: nonempty }),
  modelNodeId: nonempty,
  shortDescription: nonempty,
  whatItDoes: nonempty,
  whyItMatters: nonempty,
  normalOperatingPrinciple: nonempty,
  failureModes: arr,
  primaryFailureSignature: nonempty,
  secondarySignatures: arr,
  alternativeExplanations: arr,
  telemetryKeys: arr,
  evidenceToCollect: arr,
  safeTriageSteps: arr,
  proposedContainment: arr,
  ownerFunctions: arr,
  validationTests: arr,
  exitCriteria: arr,
  downstreamDependencyIds: z.array(nonempty),
  npiGates: arr,
  sourceIds: arr,
  provenance: z.enum([
    "primary-vendor",
    "industry-standard",
    "user-provided",
    "illustrative",
    "simulation",
  ]),
  confidence: z.enum([
    "verified",
    "well-supported",
    "illustrative",
    "unverified",
  ]),
  applicabilityNotes: nonempty,
});
export const colors: Record<string, string> = {
  mechanical: "#718699",
  compute: "#61b7ae",
  memory: "#b5a0d8",
  power: "#d7b370",
  cooling: "#4aa6c8",
  network: "#79b18d",
  management: "#9cacc7",
  storage: "#c19571",
  safety: "#d47b75",
  facility: "#798d9c",
};
export function inventory(profile: ProfileId, racks = 8) {
  const p = profiles.find((x) => x.id === profile)!;
  const records: ComponentRecord[] = [];
  function add(
    type: string,
    r: number,
    parentId: string | null,
    position: [number, number, number],
    size: [number, number, number],
    suffix = "",
  ) {
    const c = catalog.find((x) => x.type === type)!;
    const id = `${profile}/R${r}/${type}${suffix}`;
    const rec: ComponentRecord = {
      id,
      type,
      displayName: `${type === "accelerator" ? (profile === "GOOGLE_IRONWOOD_TPU_REFERENCE" ? "Ironwood TPU" : profile === "NVIDIA_GB200_NVL72_REFERENCE" ? "B200 GPU" : "GPU accelerator") : type === "cpu" && profile === "NVIDIA_GB200_NVL72_REFERENCE" ? "Grace CPU" : type.replaceAll("-", " ")}${suffix ? " " + suffix : ""}`,
      vendorProfile: profile,
      family: c.family as Family,
      parentId,
      physicalLocation: {
        row: "ROW-01",
        rack: r ? "RACK-" + String(r).padStart(2, "0") : "SHARED",
        frontRear: position[2] < 0 ? "rear" : "front",
      },
      modelNodeId: id,
      shortDescription: c.principle,
      whatItDoes: c.principle,
      whyItMatters: `${c.signature} can compromise ${c.family === "memory" ? "data integrity and usable memory capacity" : c.family === "cooling" ? "thermal headroom and sustained workload capacity" : c.family === "power" ? "available power and redundancy margin" : c.family === "network" ? "communication availability and collective progress" : c.family === "mechanical" ? "service fit, alignment and safe assembly" : c.family === "storage" ? "boot or checkpoint completion" : "traceable readiness and recoverability"}. Correlate evidence before assigning a cause.`,
      normalOperatingPrinciple: c.principle,
      failureModes: [c.signature, c.alternative],
      primaryFailureSignature: c.signature,
      secondarySignatures: [
        `Secondary: ${c.family === "network" ? "job stalls without a compute hardware alarm" : c.family === "cooling" ? "thermal throttling may follow the hydraulic event" : "readiness or performance may degrade downstream"}`,
      ],
      alternativeExplanations: [
        c.alternative,
        "Stale or missing telemetry is not proof of a physical failure",
      ],
      telemetryKeys: [
        c.family === "cooling"
          ? "flow_Lmin"
          : c.family === "power"
            ? "power_kW"
            : c.family === "memory"
              ? "ecc_count"
              : c.family === "network"
                ? "link_Gbps"
                : "health_state",
      ],
      evidenceToCollect: [
        c.evidence,
        `Correlate ${type} serial/revision and the event timestamp with adjacent independent telemetry`,
      ],
      safeTriageSteps: [
        `Collect ${type} logs and ${c.evidence.toLowerCase()}; simulation only`,
        "STOP: physical power/coolant work requires qualified personnel and approved SOPs. No live control exists here.",
      ],
      proposedContainment: [
        `Simulate draining affected ${type} dependency domain; preserve evidence and redundancy`,
      ],
      ownerFunctions: [c.owner, "NPI TPM"],
      validationTests: [c.test],
      exitCriteria: [
        `${c.test} passes on the approved revision`,
        `${type} signature does not recur during a bounded illustrative soak; DRI signs evidence`,
      ],
      downstreamDependencyIds: [],
      npiGates: [`L${c.level}`, "L12"],
      sourceIds: ["illustrative", ...p.sources],
      provenance: "illustrative",
      confidence: "illustrative",
      applicabilityNotes:
        "Geometry and diagnostic thresholds are schematic; source links support profile context, not every assumed part or dimension. Representative signature, not prevalence.",
      level: c.level,
      position,
      size,
    };
    records.push(rec);
    return id;
  }
  for (let r = 1; r <= racks; r++) {
    const root = add("rack", r, null, [0, 2.1, 0], [1.4, 4.2, 1.25]);
    const role =
      r <= racks - 2 ? "compute" : r === racks - 1 ? "network" : "storage";
    const count = role === "compute" ? p.trays : role === "network" ? 6 : 8;
    for (let t = 0; t < count; t++) {
      const tray = add(
        "tray",
        r,
        root,
        [0, 0.35 + (t * 3.2) / count, 0.04],
        [1.15, 2.75 / count, 0.94],
        `-${t + 1}`,
      );
      if (role === "compute") {
        const board = add(
          "board",
          r,
          tray,
          [0, 0, 0],
          [1.06, 0.025, 0.76],
          `-${t + 1}`,
        );
        for (let a = 0; a < p.chipsPerTray; a++) {
          const chip = add(
            "accelerator",
            r,
            board,
            [-0.36 + (a % 2) * 0.55, 0.08, -0.2 + Math.floor(a / 2) * 0.37],
            [0.23, 0.055, 0.23],
            `-${t + 1}.${a + 1}`,
          );
          for (let h = 0; h < 4; h++)
            add(
              "hbm",
              r,
              chip,
              [-0.13 + (h % 2) * 0.26, 0.04, -0.08 + Math.floor(h / 2) * 0.16],
              [0.065, 0.045, 0.085],
              `-${t + 1}.${a + 1}.${h + 1}`,
            );
          add(
            "cold-plate",
            r,
            chip,
            [0, 0.08, 0],
            [0.25, 0.025, 0.25],
            `-${t + 1}.${a + 1}`,
          );
          if (profile === "GOOGLE_IRONWOOD_TPU_REFERENCE") {
            add(
              "mxu",
              r,
              chip,
              [-0.06, 0.03, 0],
              [0.09, 0.03, 0.1],
              `-${t + 1}.${a + 1}`,
            );
            add(
              "vector",
              r,
              chip,
              [0.06, 0.03, 0],
              [0.05, 0.03, 0.1],
              `-${t + 1}.${a + 1}`,
            );
          }
        }
        for (let c = 0; c < p.cpusPerTray; c++)
          add(
            "cpu",
            r,
            board,
            [-0.35 + c * 0.6, 0.06, 0.3],
            [0.16, 0.06, 0.16],
            `-${t + 1}.${c + 1}`,
          );
        [
          "dimm",
          "bmc",
          "vrm",
          "nic",
          "nvme",
          "fan",
          "quick-disconnect",
          "package-sensor",
        ].forEach((k, i) =>
          add(
            k,
            r,
            board,
            [-0.48 + i * 0.135, 0.11, 0.43],
            [0.1, 0.065, 0.1],
            `-${t + 1}`,
          ),
        );
      } else
        add(
          role === "network" ? "switch-asic" : "nvme",
          r,
          tray,
          [0, 0.08, 0],
          [0.65, 0.1, 0.5],
          `-${t + 1}`,
        );
    }
    for (let s = 0; s < p.switches; s++)
      add(
        profile === "NVIDIA_GB200_NVL72_REFERENCE"
          ? "scale-up-switch"
          : "switch-asic",
        r,
        root,
        [0, 3.62 + s * 0.035, 0.42],
        [1.15, 0.028, 0.25],
        `-switch-${s + 1}`,
      );
    for (let s = 0; s < p.shelves; s++) {
      const sh = add(
        "power-shelf",
        r,
        root,
        [0, 3.92 + s * 0.025, 0],
        [1.12, 0.022, 0.9],
        `-${s + 1}`,
      );
      for (let j = 0; j < 6; j++)
        add(
          "psu",
          r,
          sh,
          [-0.45 + j * 0.18, 0.025, 0.15],
          [0.14, 0.02, 0.45],
          `-${s + 1}.${j + 1}`,
        );
    }
    add("manifold-supply", r, root, [-0.69, 2.1, -0.6], [0.045, 3.6, 0.045]);
    add("manifold-return", r, root, [0.69, 2.1, -0.6], [0.045, 3.6, 0.045]);
    add("busbar", r, root, [0.5, 2.1, -0.68], [0.055, 3.6, 0.03]);
    add("door", r, root, [0, 2.1, 0.68], [1.3, 3.9, 0.025]);
    add("rail", r, root, [-0.63, 2.1, 0], [0.035, 3.8, 1]);
    const excluded = new Set([
      "rack",
      "tray",
      "board",
      "accelerator",
      "hbm",
      "cold-plate",
      "cpu",
      "dimm",
      "bmc",
      "vrm",
      "nic",
      "nvme",
      "fan",
      "quick-disconnect",
      "package-sensor",
      "scale-up-switch",
      "switch-asic",
      "power-shelf",
      "psu",
      "manifold-supply",
      "manifold-return",
      "busbar",
      "door",
      "rail",
      "mxu",
      "vector",
      "cdu",
      "pump",
      "spare-pump",
      "primary-loop",
      "secondary-loop",
      "heat-exchanger",
      "row-pdu",
      "floor",
      "ups",
      "facility-boundary",
    ]);
    const extras = catalog.filter(
      (c) =>
        !excluded.has(c.type) &&
        (!["leaf", "spine", "oob", "storage-network", "ocs"].includes(c.type) ||
          role === "network") &&
        !(
          profile === "GOOGLE_IRONWOOD_TPU_REFERENCE" &&
          ["c2c", "pcie", "retimer", "scale-up"].includes(c.type)
        ) &&
        !(
          profile !== "GOOGLE_IRONWOOD_TPU_REFERENCE" &&
          ["ici", "ocs"].includes(c.type)
        ) &&
        !(profile !== "NVIDIA_GB200_NVL72_REFERENCE" && c.type === "c2c"),
    );
    extras.forEach((c, i) =>
      add(
        c.type,
        r,
        root,
        [-0.55 + (i % 6) * 0.22, 0.27 + Math.floor(i / 6) * 0.55, -0.57],
        [0.14, 0.11, 0.07],
      ),
    );
  }
  [
    "cdu",
    "pump",
    "spare-pump",
    "primary-loop",
    "secondary-loop",
    "heat-exchanger",
    "row-pdu",
    "floor",
    "ups",
    "facility-boundary",
  ].forEach((k, i) =>
    add(
      k,
      0,
      null,
      [-2.4 + (i % 2) * 0.9, 0.5 + Math.floor(i / 2) * 0.68, 0],
      [0.65, 0.48, 0.65],
    ),
  );
  return records;
}
export function audit(records: ComponentRecord[]) {
  const ids = new Set(records.map((r) => r.id));
  return {
    nodes: records.length,
    types: new Set(records.map((r) => r.type)).size,
    missing: records
      .filter((r) => !recordSchema.safeParse(r).success)
      .map((r) => r.id),
    orphans: records.flatMap((r) => [
      ...(r.parentId && !ids.has(r.parentId) ? [r.parentId] : []),
      ...r.downstreamDependencyIds.filter((id) => !ids.has(id)),
    ]),
    sourceCoverage: records.filter((r) => r.sourceIds.length > 0).length,
    verifiedCards: records.filter((r) => r.provenance === "primary-vendor")
      .length,
  };
}
