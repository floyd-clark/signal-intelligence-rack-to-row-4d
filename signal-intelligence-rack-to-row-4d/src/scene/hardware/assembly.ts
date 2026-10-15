import {
  Euler,
  Box3,
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Group,
  Matrix4,
  Mesh,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { materials } from "./materials";
export type V3 = [number, number, number];
export interface OwnerInfo {
  bounds: Box3;
  primitives: number;
  kind: string;
}
export interface RenderAsset {
  group: Group;
  owners: Map<string, OwnerInfo>;
  dispose: () => void;
  triangles: number;
}
export class Assembly {
  private transform = new Matrix4();
  withTransform(p: V3, scale: V3, fn: () => void, rotation: V3 = [0, 0, 0]) {
    const previous = this.transform;
    this.transform = previous
      .clone()
      .multiply(
        new Matrix4().compose(
          new Vector3(...p),
          new Quaternion().setFromEuler(new Euler(...rotation)),
          new Vector3(...scale),
        ),
      );
    fn();
    this.transform = previous;
  }
  private entries: {
    id: string;
    material: string;
    geometry: BufferGeometry;
  }[] = [];
  owners = new Map<string, OwnerInfo>();
  add(
    id: string,
    material: string,
    g: BufferGeometry,
    p: V3 = [0, 0, 0],
    rotation: V3 = [0, 0, 0],
    scale: V3 = [1, 1, 1],
  ) {
    if (g.index) {
      const original = g;
      g = g.toNonIndexed();
      original.dispose();
    }
    const q = new Quaternion().setFromEuler(new Euler(...rotation));
    g.applyMatrix4(
      new Matrix4().compose(new Vector3(...p), q, new Vector3(...scale)),
    ).applyMatrix4(this.transform);
    g.computeBoundingBox();
    if (id) {
      const owner = this.owners.get(id) || {
        bounds: new Box3(),
        primitives: 0,
        kind: "",
      };
      owner.bounds.union(g.boundingBox!);
      owner.primitives++;
      this.owners.set(id, owner);
    }
    this.entries.push({ id, material, geometry: g });
  }
  box(id: string, m: string, p: V3, s: V3, bevel = 0) {
    this.add(
      id,
      m,
      bevel
        ? new RoundedBoxGeometry(...s, 1, Math.min(...s) * bevel)
        : new BoxGeometry(...s),
      p,
    );
  }
  cylinder(
    id: string,
    m: string,
    p: V3,
    r: number,
    h: number,
    rotation: V3 = [0, 0, 0],
    segments = 12,
  ) {
    this.add(id, m, new CylinderGeometry(r, r, h, segments), p, rotation);
  }
  ring(
    id: string,
    m: string,
    p: V3,
    r: number,
    tube: number,
    rotation: V3 = [Math.PI / 2, 0, 0],
  ) {
    this.add(id, m, new TorusGeometry(r, tube, 4, 16), p, rotation);
  }
  pipe(id: string, m: string, points: V3[], radius = 0.018, segments = 16) {
    this.add(
      id,
      m,
      new TubeGeometry(
        new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
        segments,
        radius,
        6,
        false,
      ),
    );
  }
  bolt(id: string, p: V3, r = 0.015) {
    this.cylinder(id, "edge", p, r, r * 0.55, [0, 0, 0], 6);
    this.box(
      id,
      "black",
      [p[0], p[1] + r * 0.29, p[2]],
      [r * 0.8, 0.0015, r * 0.14],
    );
  }
  finish(palette?: ReturnType<typeof materials>): RenderAsset {
    const group = new Group();
    let triangles = 0;
    for (const material of [...new Set(this.entries.map((e) => e.material))]) {
      const entries = this.entries.filter((e) => e.material === material);
      const ranges: { end: number; id: string }[] = [];
      let count = 0;
      for (const e of entries) {
        count +=
          (e.geometry.index?.count || e.geometry.attributes.position.count) / 3;
        ranges.push({ end: count, id: e.id });
      }
      const geometry = mergeGeometries(
        entries.map((e) => e.geometry),
        false,
      )!;
      const mesh = new Mesh(geometry, (palette || materials())[material]);
      mesh.userData.ownerRanges = ranges;
      mesh.name = "hardware-batch:" + material;
      group.add(mesh);
      triangles += count;
      for (const e of entries) e.geometry.dispose();
    }
    group.userData.ownerCount = this.owners.size;
    return {
      group,
      owners: this.owners,
      triangles,
      dispose: () =>
        group.traverse((o) => {
          if (o instanceof Mesh) o.geometry.dispose();
        }),
    };
  }
}
export function resolveOwner(
  object: any,
  faceIndex: number | null | undefined,
) {
  const ranges = object.userData.ownerRanges as
    { end: number; id: string }[] | undefined;
  if (!ranges || faceIndex == null) return "";
  let l = 0,
    h = ranges.length - 1;
  while (l < h) {
    const m = (l + h) >> 1;
    if (faceIndex < ranges[m].end) h = m;
    else l = m + 1;
  }
  return ranges[l]?.id || "";
}
