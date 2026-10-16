import { Box3, Euler, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import type { Asset, Binding } from "./adapter";
import type { OwnerInfo } from "../scene/hardware/assembly";

// Bounds use the same normalized root and user transform as ImportedHardware.
export function importedOwners(
  asset: Asset,
  binding: Binding,
  levels: Record<string, number>,
  level = 12,
) {
  const owners = new Map<string, OwnerInfo>();
  const transform = new Matrix4().compose(
    new Vector3(),
    new Quaternion().setFromEuler(
      new Euler(0, (binding.rotation * Math.PI) / 180, 0),
    ),
    new Vector3().setScalar(binding.scale),
  );
  asset.object.updateMatrixWorld(true);
  asset.object.traverse((mesh) => {
    if (!(mesh instanceof Mesh)) return;
    const id = binding.meshes[mesh.name];
    if (!id || (levels[id] ?? 1) > level) return;
    mesh.geometry.computeBoundingBox();
    const bounds = mesh.geometry
      .boundingBox!.clone()
      .applyMatrix4(mesh.matrixWorld)
      .applyMatrix4(transform);
    const owner = owners.get(id) || {
      bounds: new Box3(),
      primitives: 0,
      kind: "User imported / mapped geometry",
    };
    owner.bounds.union(bounds);
    owner.primitives++;
    owners.set(id, owner);
  });
  return owners;
}
