import { useState } from "react";
import {
  loadAsset,
  validateBinding,
  type Asset,
  type Binding,
} from "../../import/adapter";
import { download } from "../../export/report";
import type { Architecture } from "../types";
import { lifecycleKey } from "../lifecycle";
export interface BoundModel {
  asset: Asset;
  binding: Binding;
}
// Local session cache: user files are never bundled, uploaded or serialized to browser storage.
export const catalogueModels = new Map<string, BoundModel>();
export function ModelImport({
  d,
  onChange,
}: {
  d: Architecture;
  onChange: () => void;
}) {
  const current = catalogueModels.get(lifecycleKey(d));
  const [asset, setAsset] = useState<Asset | null>(current?.asset || null),
    [draft, setDraft] = useState<Binding | null>(current?.binding || null),
    [mesh, setMesh] = useState(current?.asset.names[0] || ""),
    [target, setTarget] = useState(`${d.architectureId}/rack`),
    [error, setError] = useState("");
  const errors =
    asset && draft
      ? validateBinding(
          draft,
          asset.names,
          d.components.map((p) => p.id),
        )
      : [];
  return (
    <>
      <h3>Import Better Rack Model · {d.familyName}</h3>
      <p>
        Use your licensed, self-contained GLB/glTF, STL or reference PNG. The
        same local import validator and renderer serve reference profiles and
        catalogue entries. Geometry changes preserve component IDs, intelligence
        and simulation.
      </p>
      <label>
        Licensed rack model
        <input
          aria-label="Licensed rack model"
          type="file"
          accept=".glb,.gltf,.stl,.png"
          onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              const model = await loadAsset(file);
              setAsset(model);
              setDraft({
                version: 1,
                assetName: model.name,
                attribution: "",
                license: "",
                scale: 1,
                rotation: 0,
                xray: false,
                meshes: {},
              });
              setMesh(model.names[0]);
              setError("");
            } catch (e) {
              setError(String(e));
            }
          }}
        />
      </label>
      {asset && draft && (
        <>
          <p>
            {asset.name} · {asset.names.length} meshes ·{" "}
            {Object.keys(draft.meshes).length} mapped
          </p>
          <label>
            Attribution
            <input
              aria-label="Model attribution"
              value={draft.attribution}
              onChange={(e) =>
                setDraft({ ...draft, attribution: e.target.value })
              }
            />
          </label>
          <label>
            License / permission
            <input
              aria-label="Model license"
              value={draft.license}
              onChange={(e) => setDraft({ ...draft, license: e.target.value })}
            />
          </label>
          <label>
            Mesh
            <select
              aria-label="Imported mesh"
              value={mesh}
              onChange={(e) => setMesh(e.target.value)}
            >
              {asset.names.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Component
            <select
              aria-label="Binding component"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {d.components.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.id}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() =>
              setDraft({
                ...draft,
                meshes: { ...draft.meshes, [mesh]: target },
              })
            }
          >
            Bind mesh to component
          </button>
          <label>
            Scale
            <input
              aria-label="Imported scale"
              type="number"
              min="0.001"
              max="100"
              step="0.1"
              value={draft.scale}
              onChange={(e) => setDraft({ ...draft, scale: +e.target.value })}
            />
          </label>
          <label>
            Rotation
            <input
              aria-label="Imported rotation"
              type="number"
              value={draft.rotation}
              onChange={(e) =>
                setDraft({ ...draft, rotation: +e.target.value })
              }
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.xray}
              onChange={(e) => setDraft({ ...draft, xray: e.target.checked })}
            />{" "}
            X-ray imported geometry
          </label>
          <p>
            Unmapped meshes are decorative and do not fabricate a component
            selection. Stage filtering applies to mapped component meshes.
          </p>
          <button
            disabled={!Object.keys(draft.meshes).length || errors.length > 0}
            onClick={() => {
              catalogueModels.set(lifecycleKey(d), { asset, binding: draft });
              onChange();
            }}
          >
            Apply mapped geometry
          </button>
          <button
            onClick={() =>
              download(`${d.architectureId}-rack-mapping.json`, draft)
            }
          >
            Export versioned mapping
          </button>
          <label>
            Import mapping
            <input
              aria-label="Import rack mapping"
              type="file"
              accept=".json"
              onChange={async (e) => {
                try {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const mapping = JSON.parse(await file.text());
                  const problems = validateBinding(
                    mapping,
                    asset.names,
                    d.components.map((p) => p.id),
                  );
                  if (problems.length) throw Error(problems.join("; "));
                  setDraft(mapping);
                  setError("");
                } catch (e) {
                  setError(String(e));
                }
              }}
            />
          </label>
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </>
      )}
      <button
        onClick={() => {
          catalogueModels.delete(lifecycleKey(d));
          onChange();
        }}
      >
        Return to procedural geometry
      </button>
      {error && (
        <p className="error" role="status">
          {error}
        </p>
      )}
    </>
  );
}
