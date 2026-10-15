import type { OwnerInfo } from "./assembly";
export const hardwareAudit: {
  scope: string;
  owners: Record<
    string,
    { primitives: number; kind: string; bounds: number[] }
  >;
  camera: number[];
  target: number[];
  quality: string;
  assets: number;
} = {
  scope: "",
  owners: {},
  camera: [],
  target: [],
  quality: "Balanced",
  assets: 0,
};
const active = new Map<string, Map<string, OwnerInfo>>();
function refresh() {
  const entries = [...active.values()].flatMap((m) => [...m]);
  hardwareAudit.owners = Object.fromEntries(
    entries.map(([id, o]) => [
      id,
      {
        primitives: o.primitives,
        kind: o.kind,
        bounds: [...o.bounds.min.toArray(), ...o.bounds.max.toArray()],
      },
    ]),
  );
  hardwareAudit.assets = active.size;
}
export function registerOwners(key: string, owners: Map<string, OwnerInfo>) {
  active.set(key, owners);
  refresh();
  return () => {
    active.delete(key);
    refresh();
  };
}
