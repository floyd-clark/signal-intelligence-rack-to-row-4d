import type { Architecture, Part, ViewMode } from "../types";

export function inspectionView(p: Part): ViewMode {
  if (p.id.endsWith("/rack")) return "rack";
  if (p.concept === "network") return "topology";
  if (/\/(chip|memory|plate)\//.test(p.id)) return "chip";
  if (
    ["power", "cooling"].includes(p.concept) &&
    !/\/(plate|fan|qd)\//.test(p.id)
  )
    return "component";
  return "tray";
}
export function carrierIndex(selected: string) {
  return Number(
    selected.match(
      /\/(?:tray|board|chip|memory|plate|cpu|nic|vrm|nvme|fan|qd|bmc|dimm)\/(\d+)/,
    )?.[1] || 1,
  );
}
// Several dedicated detail builders author a first carrier. Rebase all its owners
// to the carrier actually selected, without manufacturing IDs absent in inventory.
export function inspectionOwner(
  d: Architecture,
  id: string,
  selected: string,
  view: ViewMode,
) {
  if (!["tray", "chip", "component"].includes(view)) return id;
  const t = carrierIndex(selected);
  const candidate = id.replace(
    /\/(tray|board|chip|memory|plate|cpu|nic|vrm|nvme|fan|qd|bmc|dimm)\/\d+/,
    `/$1/${t}`,
  );
  return d.components.some((p) => p.id === candidate) ? candidate : id;
}
