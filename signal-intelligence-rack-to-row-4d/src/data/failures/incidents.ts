import catalog from "../components/catalog.json";
export interface Incident {
  id: string;
  level: number;
  title: string;
  type: string;
  domain: "local" | "cooling" | "power" | "network" | "management";
  hypotheses: string[];
  evidence: { label: string; result: string; supports: number }[];
  containment: string;
  recovery: string;
  prevention: string;
  owner: string;
  impact: string;
  redHerring: "shared" | "local" | "none";
}
const specs = [
  ["rail", "Rail datum mismatch", "local"],
  ["anchor", "Anchor footprint revision", "local"],
  ["door", "Cable snag mistaken for latch wear", "local"],
  ["power-connector", "Polarity/connector mismatch", "local"],
  ["row-pdu", "Shared upstream feed loss", "power"],
  ["psu", "Current telemetry bias, healthy feed", "local"],
  ["blind-mate", "Partially seated tray connector", "local"],
  ["cable-guide", "Service-loop optical bend", "local"],
  ["asset-tag", "Unapproved chassis ECO", "local"],
  ["pump", "Shared CDU secondary-pump degradation", "cooling"],
  ["quick-disconnect", "Branch leak alert and pressure decay", "local"],
  ["hose", "Supply/return routing reversed", "local"],
  ["accelerator", "Wrong accelerator revision", "local"],
  ["hbm", "Recurring local HBM ECC", "local"],
  ["dimm", "Host memory training fault", "local"],
  ["bmc", "Single BMC discovery failure", "local"],
  ["oob", "Shared management switch outage", "management"],
  ["firmware", "Unsupported signed image matrix", "local"],
  ["vrm", "Local load-step undervoltage", "local"],
  ["share-controller", "Current-sharing oscillation", "local"],
  ["temperature-sensor", "Stale sensor mistaken for row overheating", "local"],
  ["boot-drive", "Boot image checksum mismatch", "local"],
  ["nic-firmware", "Adapter enumeration regression", "local"],
  ["pcie", "Device disappears under lane stress", "local"],
  ["optical-module", "Weak received optical lane", "local"],
  ["scale-up", "Intermittent accelerator fabric lane", "local"],
  ["leaf", "Shared scale-out leaf congestion", "network"],
  ["cold-plate", "Localized thermal resistance increase", "local"],
  ["fan", "Residual-airflow tachometer loss", "local"],
  ["supply-sensor", "Sensor bias mistaken for CDU fault", "local"],
  ["spine", "Repeated common route loss", "network"],
  ["nvme", "Checkpoint I/O tail-latency recurrence", "local"],
  ["spare-pump", "Redundant pump fails rehearsal", "cooling"],
  ["readiness", "Open critical FRACAS blocks release", "local"],
  ["asset-tag", "Supplier alternate lacks qualification", "local"],
  ["firmware", "Rollback evidence missing at release", "local"],
];
export const incidents: Incident[] = specs.map(([type, title, domain], i) => {
  const c = catalog.find((x) => x.type === type)!;
  return {
    id: `INC-${String(i + 1).padStart(2, "0")}`,
    level: Math.floor(i / 3) + 1,
    title,
    type,
    domain: domain as Incident["domain"],
    hypotheses: [
      title,
      c.alternative,
      "Telemetry collector or timestamp fault",
    ],
    evidence: [
      {
        label: c.evidence,
        result: `Synthetic test: ${c.signature.toLowerCase()}; supports the injected fault, pending independent corroboration.`,
        supports: 0,
      },
      {
        label: `Independent ${type} validation`,
        result: `Synthetic fixture: ${c.test} reproduces the fault while ${c.alternative.toLowerCase()} is not observed.`,
        supports: 0,
      },
      {
        label: "Check collector health (supporting context)",
        result:
          "Independent timestamps advance; neighboring devices are coherent. This rules out a blind collector but does not distinguish the two physical hypotheses.",
        supports: -1,
      },
    ],
    containment:
      domain === "cooling"
        ? "Simulate workload derating in the shared compute cooling domain and failover only after redundancy verification"
        : domain === "power"
          ? "Simulate load cap within alternate-source budget; retain feed redundancy evidence"
          : domain === "management"
            ? "Keep compute running; preserve in-band telemetry and restore isolated OOB path"
            : `Simulate draining the affected ${type} service domain; preserve logs before remediation`,
    recovery: `${c.test}; confirm the signature clears and does not recur through modeled soak`,
    prevention: `Record ${type} revision and failure mode in FRACAS; ${c.owner} owns validation coverage and approved ECO/runbook update`,
    owner: c.owner,
    impact:
      domain === "local"
        ? `Local ${type} readiness/capacity exposure; no arbitrary row shutdown`
        : `Shared ${domain} domain exposure; graph determines affected racks`,
    redHerring: [4, 9, 16].includes(i)
      ? "shared"
      : [5, 20, 29].includes(i)
        ? "local"
        : "none",
  };
});
export function applicableIncidents(profile: string) {
  return incidents.map((i) =>
    profile === "GOOGLE_IRONWOOD_TPU_REFERENCE" &&
    ["pcie", "scale-up"].includes(i.type)
      ? {
          ...i,
          type: "ici",
          title: i.title
            .replace(
              "Device disappears under lane stress",
              "ICI axis training degradation",
            )
            .replace("accelerator fabric", "ICI"),
          hypotheses: [
            "ICI link training degradation",
            "Host feed starvation",
            "Telemetry collector fault",
          ],
        }
      : i,
  );
}

const tailored: Record<
  string,
  { hypotheses: string[]; evidence: Incident["evidence"] }
> = {
  "INC-05": {
    hypotheses: [
      "Shared upstream feed-A branch loss",
      "Independent PSU rectifier faults",
      "Collector outage",
    ],
    evidence: [
      {
        label: "Compare branch event with PSU input timestamps",
        result:
          "Synthetic fixture: feed-A branch opens 2 s before correlated PSU input alarms; feed B remains energized.",
        supports: 0,
      },
      {
        label: "Compare feed-B headroom and PSU outputs",
        result:
          "Synthetic fixture: alternate feed sustains load; rectifier output health is normal, opposing independent PSU failures.",
        supports: 0,
      },
      {
        label: "Observe workload alarms only",
        result: "Workloads remain up; this alone does not locate the fault.",
        supports: -1,
      },
    ],
  },
  "INC-10": {
    hypotheses: [
      "Secondary CDU pump degradation",
      "Blocked secondary strainer",
      "Facility-water supply warming",
    ],
    evidence: [
      {
        label: "Compare pump command, current, flow and differential pressure",
        result:
          "Synthetic fixture: pump commanded normally, current falls, flow drops to 42 L/min per rack and pressure to 23 kPa before temperature rise.",
        supports: 0,
      },
      {
        label: "Check strainer differential and primary-loop inlet",
        result:
          "Synthetic fixture: strainer differential stays normal and primary inlet is stable. This opposes strainer blockage and facility-water warming.",
        supports: 0,
      },
      {
        label: "Observe GPU throttle alarms only",
        result:
          "Many racks throttle, a secondary symptom shared by several cooling faults; not discriminating.",
        supports: -1,
      },
    ],
  },
  "INC-17": {
    hypotheses: [
      "Shared OOB switch uplink outage",
      "Many independent BMC failures",
      "Compute power loss",
    ],
    evidence: [
      {
        label: "Compare in-band heartbeat and power to OOB reachability",
        result:
          "Synthetic fixture: all compute heartbeats and power are normal while OOB reachability disappears in one switch domain.",
        supports: 0,
      },
      {
        label: "Inspect independent switch uplink and neighbor telemetry",
        result:
          "Synthetic fixture: upstream OOB port is down, adjacent management domains healthy; this opposes simultaneous BMC failures.",
        supports: 0,
      },
      {
        label: "Count unreachable BMCs only",
        result:
          "The correlated count identifies a domain but cannot prove the uplink cause.",
        supports: -1,
      },
    ],
  },
  "INC-06": {
    hypotheses: [
      "One PSU current sensor bias",
      "Shared upstream feed loss",
      "Actual failed rectifier",
    ],
    evidence: [
      {
        label: "Compare independent input/output power balance",
        result:
          "Synthetic fixture: shelf power matches load and both feeds are healthy despite one frozen share reading.",
        supports: 0,
      },
      {
        label: "Compare PSU current timestamps and independent channel",
        result:
          "Synthetic fixture: one channel is stale; independent channel follows the load. Shared feed failure is disproved.",
        supports: 0,
      },
      {
        label: "Read the one PSU alarm only",
        result:
          "An alarm alone cannot separate failed rectification from sensor bias.",
        supports: -1,
      },
    ],
  },
  "INC-21": {
    hypotheses: [
      "Stale package temperature sensor",
      "Shared cooling degradation",
      "Local cold plate restriction",
    ],
    evidence: [
      {
        label: "Compare redundant package sensor against timestamp",
        result:
          "Synthetic fixture: one channel is frozen; independent package temperature follows normal bounded workload response.",
        supports: 0,
      },
      {
        label: "Compare shared flow, pressure and neighbor temperatures",
        result:
          "Synthetic fixture: shared hydraulics and every neighboring thermal trend are normal; no shared cooling event.",
        supports: 0,
      },
      {
        label: "Read hotspot alert only",
        result: "A threshold alarm alone does not prove a thermal excursion.",
        supports: -1,
      },
    ],
  },
  "INC-30": {
    hypotheses: [
      "Biased supply-temperature sensor",
      "CDU heat-exchanger degradation",
      "Facility-water warming",
    ],
    evidence: [
      {
        label: "Compare independent supply probe and four-port heat balance",
        result:
          "Synthetic fixture: independent probe is 26 °C; the suspect channel reads 44 °C, inconsistent with the heat balance.",
        supports: 0,
      },
      {
        label: "Compare primary inlet and rack branch return trends",
        result:
          "Synthetic fixture: primary inlet and every branch return remain coherent; shared heat-exchanger and facility causes are opposed.",
        supports: 0,
      },
      {
        label: "Read the high inlet alert only",
        result:
          "An uncorroborated temperature alarm cannot locate an upstream cooling fault.",
        supports: -1,
      },
    ],
  },
};
for (const i of incidents) {
  const t = tailored[i.id];
  if (t) {
    i.hypotheses = t.hypotheses;
    i.evidence = t.evidence;
  }
}
