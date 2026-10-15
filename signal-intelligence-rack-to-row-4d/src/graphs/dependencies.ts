import type { ComponentRecord } from "../data/model";
export interface Edge {
  from: string;
  to: string;
  kind: "coolant" | "power" | "signal" | "management" | "functional" | "spare";
  effect:
    | "hard-down"
    | "degraded-throughput"
    | "capacity-reduction"
    | "sensor-blind"
    | "redundancy-lost"
    | "warning-only";
  confidence: "illustrative";
  condition: string;
}
export function graph(records: ComponentRecord[]): Edge[] {
  const edges: Edge[] = [];
  const roots = records.filter((r) => r.type === "rack");
  const compute = roots.filter(
    (r) => Number(r.physicalLocation.rack.slice(-2)) <= roots.length - 2,
  );
  const shared = (type: string, kind: Edge["kind"], effect: Edge["effect"]) => {
    for (const source of records.filter((r) => r.type === type))
      for (const r of compute)
        edges.push({
          from: source.id,
          to: r.id,
          kind,
          effect,
          confidence: "illustrative",
          condition:
            "Illustrative shared compute service domain; independent network/storage cooling",
        });
  };
  shared("pump", "coolant", "degraded-throughput");
  shared("spare-pump", "coolant", "redundancy-lost");
  shared("row-pdu", "power", "redundancy-lost");
  shared("leaf", "signal", "degraded-throughput");
  shared("spine", "signal", "degraded-throughput");
  shared("oob", "management", "sensor-blind");
  for (const r of records)
    if (r.parentId)
      edges.push({
        from: r.parentId,
        to: r.id,
        kind: "functional",
        effect: "capacity-reduction",
        confidence: "illustrative",
        condition:
          "Assembly service dependency; separate from spatial adjacency",
      });
  return edges;
}
export function descendants(id: string, edges: Edge[]) {
  const seen = new Set<string>([id]);
  const frontier = [id];
  while (frontier.length) {
    const n = frontier.pop()!;
    for (const e of edges.filter((e) => e.from === n))
      if (!seen.has(e.to)) {
        seen.add(e.to);
        frontier.push(e.to);
      }
  }
  return [...seen];
}
export interface FabricLink {
  from: string;
  to: string;
  fabric:
    "ICI" | "NVLink" | "NVLink-C2C" | "OCS" | "scale-out" | "storage" | "OOB";
  axis?: number;
}
export function fabricTopology(records: ComponentRecord[]): FabricLink[] {
  const links: FabricLink[] = [];
  const racks = records.filter((r) => r.type === "rack");
  const tpu = records[0]?.vendorProfile === "GOOGLE_IRONWOOD_TPU_REFERENCE";
  const nvidia = records[0]?.vendorProfile === "NVIDIA_GB200_NVL72_REFERENCE";
  for (const rack of racks) {
    const chips = records.filter(
      (r) =>
        r.type === "accelerator" &&
        r.physicalLocation.rack === rack.physicalLocation.rack,
    );
    if (tpu && chips.length === 64) {
      const at = (x: number, y: number, z: number) =>
        chips[(x % 4) + 4 * (y % 4) + 16 * (z % 4)].id;
      for (let z = 0; z < 4; z++)
        for (let y = 0; y < 4; y++)
          for (let x = 0; x < 4; x++)
            for (let axis = 0; axis < 3; axis++)
              links.push({
                from: at(x, y, z),
                to: at(
                  x + (axis === 0 ? 1 : 0),
                  y + (axis === 1 ? 1 : 0),
                  z + (axis === 2 ? 1 : 0),
                ),
                fabric: "ICI",
                axis,
              });
    }
    if (nvidia) {
      const switches = records.filter(
        (r) =>
          r.type === "scale-up-switch" &&
          r.physicalLocation.rack === rack.physicalLocation.rack,
      );
      for (const chip of chips)
        for (const sw of switches)
          links.push({ from: chip.id, to: sw.id, fabric: "NVLink" });
      for (const cpu of records.filter(
        (r) =>
          r.type === "cpu" &&
          r.physicalLocation.rack === rack.physicalLocation.rack,
      )) {
        const board = cpu.parentId;
        for (const chip of chips
          .filter((c) => c.parentId === board)
          .slice(cpu.id.endsWith(".1") ? 0 : 2, cpu.id.endsWith(".1") ? 2 : 4))
          links.push({ from: cpu.id, to: chip.id, fabric: "NVLink-C2C" });
      }
    }
  }
  if (tpu) {
    const cubes = racks.filter(
      (r) => Number(r.physicalLocation.rack.slice(-2)) <= racks.length - 2,
    );
    for (let i = 0; i < cubes.length - 1; i++)
      links.push({ from: cubes[i].id, to: cubes[i + 1].id, fabric: "OCS" });
  }
  return links;
}
