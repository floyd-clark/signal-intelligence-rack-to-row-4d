import { useEffect, useMemo } from "react";
import { Mesh } from "three";
import type { Asset, Binding } from "./adapter";
export function ImportedHardware({
  asset,
  binding,
  onSelect,
  onDrill,
  levels,
  level = 12,
  highlighted,
}: {
  asset: Asset;
  binding: Binding;
  onSelect: (id: string) => void;
  onDrill?: (id: string) => void;
  levels?: Record<string, number>;
  level?: number;
  highlighted?: Set<string>;
}) {
  const object = useMemo(() => {
    const clone = asset.object.clone(true);
    clone.traverse((o) => {
      if (o instanceof Mesh) {
        const id = binding.meshes[o.name];
        o.visible = !id || !levels || (levels[id] ?? 1) <= level;
        const materials = (
          Array.isArray(o.material) ? o.material : [o.material]
        ).map((m) => {
          const mat = m.clone();
          mat.transparent = binding.xray;
          mat.opacity = binding.xray ? 0.4 : 1;
          if (highlighted && id && !highlighted.has(id) && "color" in mat)
            (mat as any).color.multiplyScalar(0.2);
          return mat;
        });
        o.material = materials.length === 1 ? materials[0] : materials;
      }
    });
    return clone;
  }, [asset, binding.xray, binding.meshes, levels, level, highlighted]);
  useEffect(
    () => () => {
      object.traverse((o) => {
        if (o instanceof Mesh)
          for (const mat of Array.isArray(o.material)
            ? o.material
            : [o.material])
            mat.dispose();
      });
    },
    [object],
  );
  return (
    <group
      scale={binding.scale}
      rotation={[0, (binding.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const id = binding.meshes[e.object.name];
        if (id) onSelect(id);
      }}
      onDoubleClick={(e) => {
        const id = binding.meshes[e.object.name];
        if (id && onDrill) {
          e.stopPropagation();
          onDrill(id);
        }
      }}
    >
      <primitive object={object} dispose={null} />
    </group>
  );
}
