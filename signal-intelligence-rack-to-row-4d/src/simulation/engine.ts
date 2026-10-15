import type { Incident } from "../data/failures/incidents";
import { z } from "zod";
import { inventory, type ProfileId } from "../data/model";
import { graph } from "../graphs/dependencies";
export interface Event {
  time: number;
  kind: "inject" | "contain" | "recover";
  incidentId: string;
  target: string;
}
export interface Scenario {
  version: 1;
  seed: number;
  profile: string;
  racks: number;
  events: Event[];
}
export const scenarioSchema = z.object({
  version: z.literal(1),
  seed: z.number().int(),
  profile: z.enum([
    "FS_CONCEPT",
    "NVIDIA_GB200_NVL72_REFERENCE",
    "GOOGLE_IRONWOOD_TPU_REFERENCE",
  ]),
  racks: z.union([
    z.literal(4),
    z.literal(6),
    z.literal(8),
    z.literal(10),
    z.literal(12),
  ]),
  events: z
    .array(
      z.object({
        time: z.number().min(0).max(600),
        kind: z.enum(["inject", "contain", "recover"]),
        incidentId: z.string(),
        target: z.string(),
      }),
    )
    .max(100),
});
export const constants = {
  cp: 4180,
  density: 1000,
  voltage: 50,
  efficiency: 0.95,
  warning: 78,
  fatal: 95,
  tau: 90,
};
export function heatDelta(kW: number, flowLmin: number) {
  return (kW * 1000) / ((flowLmin / 60) * constants.cp);
}
const domains = new Map<string, ReturnType<typeof graph>>();
function dependencies(s: Scenario) {
  const key = s.profile + ":" + s.racks;
  if (!domains.has(key))
    domains.set(key, graph(inventory(s.profile as ProfileId, s.racks)));
  return domains.get(key)!;
}
export function seeded(seed: number, index: number) {
  let n = (seed ^ Math.imul(index + 1, 0x45d9f3b)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
export function snapshot(s: Scenario, time: number, incidents: Incident[]) {
  const racks = Array.from({ length: s.racks }, (_, i) => ({
    rack: i + 1,
    temp: 58 + i * 0.4,
    flow: 120,
    supply: 26,
    return: 26 + heatDelta(96, 120),
    power: 96,
    goodput: 100,
    link: 400,
    ecc: 0,
    pressure: 80,
    state: "healthy",
    affected: false,
    voltage: 50,
    share: 100,
    rxPower: -2,
    fec: 0,
    retries: 0,
    airTemp: 42,
    leak: false,
    bmcReachable: true,
    inventoryOK: true,
    sensorValid: true,
  }));
  const chronology: { time: number; text: string }[] = [];
  let fault: Incident | undefined,
    target = "",
    active = false,
    contained = false,
    onset = 0;
  const events = [...s.events].sort((a, b) => a.time - b.time);
  for (let t = 0; t <= Math.floor(Math.max(0, Math.min(600, time))); t++) {
    for (const e of events.filter((x) => x.time === t)) {
      if (e.kind === "inject") {
        fault = incidents.find((i) => i.id === e.incidentId);
        target = e.target;
        onset = t;
        active = true;
        contained = false;
        chronology.push({
          time: t,
          text: "Fault injected (simulation); diagnosis remains a hypothesis",
        });
      }
      if (e.kind === "contain") {
        contained = true;
        chronology.push({
          time: t,
          text: "Containment decision applied to modeled dependency domain",
        });
      }
      if (e.kind === "recover") {
        active = false;
        chronology.push({
          time: t,
          text: "Recovery fixture applied; thermal state decays over time",
        });
      }
    }
    const age = t - onset;
    const local = Number(target.match(/\/R(\d+)\//)?.[1] || 1);
    const sharedRacks = new Set(
      dependencies(s)
        .filter((e) => e.from === target)
        .map((e) => Number(e.to.match(/\/R(\d+)\//)?.[1])),
    );
    for (const r of racks) {
      const affected =
        !!fault &&
        (fault.domain === "local" ? r.rack === local : sharedRacks.has(r.rack));
      r.affected = active && affected;
      const bad = active && affected;
      const cooling =
        bad && fault?.domain === "cooling" && fault?.type !== "spare-pump";
      r.flow = cooling ? (contained ? 90 : 42) : 120;
      r.pressure = cooling ? (contained ? 60 : 23) : 80;
      r.supply = 26 + (cooling ? Math.min(7, age / 50) : 0);
      r.power = bad && contained ? 62 : 96;
      r.return = r.supply + heatDelta(r.power, r.flow);
      const targetTemp =
        58 +
        r.rack * 0.4 +
        (cooling
          ? contained
            ? 8
            : 35
          : bad && fault?.type === "cold-plate"
            ? 28
            : 0);
      r.temp += (targetTemp - r.temp) / (constants.tau + r.rack * 8);
      r.link = bad && fault?.domain === "network" ? 160 : 400;
      r.ecc =
        bad && ["hbm", "dimm"].includes(fault?.type || "")
          ? Math.floor(age / (8 + Math.floor(seeded(s.seed, r.rack) * 8)))
          : 0;
      r.goodput = Math.max(
        0,
        100 -
          (r.temp > constants.warning ? (r.temp - constants.warning) * 3 : 0) -
          (bad && fault?.domain === "network" ? 45 : 0) -
          (bad && fault?.domain === "local" ? 12 : 0) -
          (bad && contained ? 25 : 0),
      );
      r.voltage =
        bad && ["vrm", "power-connector", "busbar"].includes(fault?.type || "")
          ? 46
          : 50;
      r.share =
        bad && fault?.type === "share-controller"
          ? 80 + 18 * Math.sin(age / 7)
          : 100;
      r.rxPower = bad && fault?.type === "optical-module" ? -12 : -2;
      r.fec =
        bad &&
        ["optical-module", "scale-up", "ici", "pcie"].includes(
          fault?.type || "",
        )
          ? Math.floor(age * (1 + seeded(s.seed, r.rack)))
          : 0;
      r.retries =
        bad && ["leaf", "spine", "nic-firmware"].includes(fault?.type || "")
          ? Math.floor(age * 0.7)
          : 0;
      r.airTemp =
        bad && fault?.type === "fan" ? 42 + Math.min(30, age / 8) : 42;
      r.leak = bad && fault?.type === "quick-disconnect";
      r.bmcReachable = !(
        bad &&
        (fault?.type === "bmc" || fault?.domain === "management")
      );
      r.inventoryOK = !(
        bad &&
        [
          "accelerator",
          "boot-drive",
          "nic-firmware",
          "pcie",
          "firmware",
          "asset-tag",
        ].includes(fault?.type || "")
      );
      r.sensorValid = !(
        bad &&
        ["temperature-sensor", "supply-sensor", "psu"].includes(
          fault?.type || "",
        )
      );
      r.state =
        bad && fault?.type === "spare-pump"
          ? "redundancy-lost"
          : bad && fault?.domain === "management"
            ? "sensor-blind"
            : r.temp > constants.warning
              ? "throttled"
              : bad
                ? "degraded"
                : "healthy";
    }
    if (age === 30 && active)
      chronology.push({
        time: t,
        text:
          fault?.domain === "cooling"
            ? "Low secondary flow and pressure alert; independent hydraulic evidence first"
            : "Representative diagnostic rule fires; not a unique root-cause verdict",
      });
    if (age === 120 && active && fault?.domain === "cooling")
      chronology.push({
        time: t,
        text: "Return ΔT and junction temperature rising after hydraulic change",
      });
  }
  return {
    time,
    racks,
    chronology,
    capacity: racks.reduce((a, r) => a + r.goodput, 0) / s.racks,
    thermalHeadroom: constants.fatal - Math.max(...racks.map((r) => r.temp)),
    fault,
    contained,
    active,
    powerKW: racks.reduce((a, r) => a + r.power, 0),
    currentA:
      (racks.reduce((a, r) => a + r.power, 0) * 1000) / constants.voltage,
    lossKW:
      racks.reduce((a, r) => a + r.power, 0) * (1 / constants.efficiency - 1),
  };
}
