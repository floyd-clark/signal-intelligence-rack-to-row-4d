import {
  Box3,
  Group,
  Mesh,
  Vector3,
  LoadingManager,
  CanvasTexture,
  PlaneGeometry,
  DoubleSide,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { MeshStandardMaterial } from "three";
export interface Binding {
  version: 1;
  assetName: string;
  attribution: string;
  license: string;
  scale: number;
  rotation: number;
  xray: boolean;
  meshes: Record<string, string>;
}
export interface Asset {
  object: Group;
  names: string[];
  bounds: number[];
  name: string;
}
export function inspectGLTF(json: any) {
  if (json.asset?.version && json.asset.version !== "2.0")
    throw Error("Only glTF 2.0 is supported");
  if (
    (json.meshes?.length || 0) > 2000 ||
    (json.accessors || []).some((a: any) => a.count > 1000000)
  )
    throw Error("Asset geometry limits exceeded");
  if (
    json.extensionsRequired?.some(
      (s: string) =>
        ![
          "KHR_materials_unlit",
          "KHR_materials_clearcoat",
          "KHR_materials_transmission",
          "KHR_materials_ior",
          "KHR_materials_specular",
        ].includes(s),
    )
  )
    throw Error(
      "Unsupported required extension. Export a self-contained uncompressed GLB.",
    );
  for (const item of [...(json.buffers || []), ...(json.images || [])])
    if (
      item.uri &&
      !/^data:(application\/octet-stream|application\/gltf-buffer|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/=]+$/.test(
        item.uri,
      )
    )
      throw Error(
        "External URI blocked. Use embedded buffers and raster textures.",
      );
}
export async function loadAsset(file: File): Promise<Asset> {
  if (file.size > 50 * 1024 * 1024)
    throw Error("Maximum asset size is 50 MiB.");
  const ext = file.name.split(".").at(-1)?.toLowerCase();
  if (!["glb", "gltf", "stl", "png"].includes(ext || ""))
    throw Error(
      "Preview supports self-contained GLB/glTF, STL and PNG reference planes. Export licensed CAD/USDZ to GLB. PNG is reference-only.",
    );
  const bytes = await file.arrayBuffer();
  let object = new Group();
  if (ext === "png") {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width > 8192 || bitmap.height > 8192) {
      bitmap.close();
      throw Error("PNG dimension exceeds 8192 pixels");
    }
    const texture = new CanvasTexture(bitmap);
    const mesh = new Mesh(
      new PlaneGeometry((4 * bitmap.width) / bitmap.height, 4),
      new MeshStandardMaterial({
        map: texture,
        side: DoubleSide,
        roughness: 1,
      }),
    );
    mesh.name = "PNG reference plane (not physical geometry)";
    object.add(mesh);
  } else if (ext === "stl") {
    const geometry = new STLLoader().parse(bytes);
    if (geometry.attributes.position.count > 1000000)
      throw Error("Mesh exceeds one million vertices.");
    const mesh = new Mesh(
      geometry,
      new MeshStandardMaterial({ color: "#7aa8b5" }),
    );
    mesh.name = "STL mesh";
    object.add(mesh);
  } else {
    let json: any;
    if (ext === "gltf") json = JSON.parse(new TextDecoder().decode(bytes));
    else {
      const v = new DataView(bytes);
      if (
        v.byteLength < 20 ||
        v.getUint32(0, true) !== 0x46546c67 ||
        v.getUint32(4, true) !== 2 ||
        v.getUint32(8, true) !== bytes.byteLength
      )
        throw Error("Invalid GLB container");
      const len = v.getUint32(12, true);
      if (v.getUint32(16, true) !== 0x4e4f534a || len > bytes.byteLength - 20)
        throw Error("Invalid GLB JSON chunk");
      json = JSON.parse(
        new TextDecoder().decode(new Uint8Array(bytes, 20, len)),
      );
    }
    inspectGLTF(json);
    const manager = new LoadingManager();
    manager.setURLModifier((url) => {
      if (!url.startsWith("data:") && !url.startsWith("blob:"))
        throw Error("External model resource blocked");
      return url;
    });
    const gltf = await new GLTFLoader(manager).parseAsync(
      ext === "gltf" ? JSON.stringify(json) : bytes,
      "",
    );
    object = gltf.scene;
  }
  let count = 0;
  const names: string[] = [];
  object.traverse((o) => {
    if (o instanceof Mesh) {
      count += o.geometry.attributes.position?.count || 0;
      o.name = `mesh-${names.length}: ${o.name || "unnamed"}`;
      names.push(o.name);
    }
  });
  if (names.length > 2000 || count > 1000000)
    throw Error("Model exceeds 2,000 meshes / one million vertices.");
  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  if (!Number.isFinite(size.length()) || size.length() === 0)
    throw Error("Empty or invalid bounds");
  object.position.sub(center);
  const group = new Group();
  group.add(object);
  group.scale.setScalar(4 / Math.max(size.x, size.y, size.z));
  group.position.y = 2;
  return { object: group, names, bounds: size.toArray(), name: file.name };
}
export function validateBinding(b: Binding, names: string[], ids: string[]) {
  if (
    b.version !== 1 ||
    !b.meshes ||
    !Number.isFinite(b.scale) ||
    b.scale <= 0 ||
    b.scale > 100 ||
    !Number.isFinite(b.rotation)
  )
    return ["Invalid mapping schema/transform"];
  const errors: string[] = [];
  const assigned = new Set<string>();
  for (const [mesh, id] of Object.entries(b.meshes)) {
    if (!names.includes(mesh)) errors.push("Absent mesh " + mesh);
    if (!ids.includes(id)) errors.push("Unknown component " + id);
    if (assigned.has(id)) errors.push("Duplicate component binding " + id);
    assigned.add(id);
  }
  if (!b.attribution || !b.license)
    errors.push("Attribution and license required before applying geometry");
  return errors;
}
