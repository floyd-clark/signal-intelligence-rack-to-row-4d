import type { Architecture } from "./types";
export interface CatalogueEdge {
  from: string;
  to: string;
  kind:
    | "power"
    | "cooling"
    | "airflow"
    | "NVLink"
    | "UALink"
    | "ICI"
    | "OCS"
    | "Neuron"
    | "Ethernet"
    | "Slingshot"
    | "wafer-io";
  scope: "physical service" | "communication";
  qualifier: string;
}
export function catalogueGraphs(a: Architecture) {
  const service: CatalogueEdge[] = [],
    communication: CatalogueEdge[] = [];
  const trays = a.components.filter((p) => p.id.includes("/tray/"));
  for (const t of trays) {
    service.push({
      from: `${a.architectureId}/power/1`,
      to: t.id,
      kind: "power",
      scope: "physical service",
      qualifier:
        "Illustrative service membership; redundancy handled separately",
    });
    service.push({
      from: `${a.architectureId}/cooling`,
      to: t.id,
      kind: a.cooling !== "liquid" ? "airflow" : "cooling",
      scope: "physical service",
      qualifier:
        a.cooling === "optional liquid"
          ? "Optional loop; air is baseline"
          : "Illustrative loop membership",
    });
  }
  if (["nvl72", "rubin", "helios", "cray"].includes(a.shape))
    for (const p of a.components.filter((p) => p.id.includes("/fabric/")))
      service.push({
        from: `${a.architectureId}/cooling`,
        to: p.id,
        kind: "cooling",
        scope: "physical service",
        qualifier:
          "Reference-cooled switch/cartridge domain; exact hydraulic routing illustrative",
      });
  const add = (
    from: string,
    to: string,
    kind: CatalogueEdge["kind"],
    qualifier = "Representative communication dependency, not a physical cable BOM",
  ) =>
    communication.push({ from, to, kind, scope: "communication", qualifier });
  if (a.shape === "ironwood") {
    for (let i = 0; i < 64; i++) {
      const p = [i % 4, Math.floor(i / 4) % 4, Math.floor(i / 16)];
      for (let axis = 0; axis < 3; axis++) {
        const q = [...p];
        q[axis] = (q[axis] + 1) % 4;
        const j = q[0] + q[1] * 4 + q[2] * 16;
        add(
          `${a.architectureId}/chip/${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
          `${a.architectureId}/chip/${Math.floor(j / 4) + 1}.${(j % 4) + 1}`,
          "ICI",
          "4×4×4 periodic torus, undirected neighbor edges",
        );
      }
    }
    add(
      `${a.architectureId}/fabric/ocs`,
      `${a.architectureId}/logical/remote-cube`,
      "OCS",
      "Remote logical cube; not an asserted physical cabinet",
    );
  } else {
    const kind: CatalogueEdge["kind"] = ["nvl72", "rubin", "dgx"].includes(
      a.shape,
    )
      ? "NVLink"
      : a.shape === "helios"
        ? "UALink"
        : a.shape === "trainium"
          ? "Neuron"
          : a.shape === "cray"
            ? "Slingshot"
            : a.shape === "cerebras"
              ? "wafer-io"
              : "Ethernet";
    for (const t of trays) add(t.id, `${a.architectureId}/network`, kind);
  }
  return { service, communication };
}
