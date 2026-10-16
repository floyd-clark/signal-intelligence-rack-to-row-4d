import { useState } from "react";
import { profiles, type ProfileId } from "../../data/model";
import { architectures, architectureById } from "../registry";
import type { Architecture, FamilyId } from "../types";
import { useCatalogue } from "../store";
import { lifecycleKey, lifecycleStage } from "../lifecycle";
import { partType, systemLayers } from "../workbench";
import { inspectionView } from "../models/inspection";
export function WorkbenchRail({
  d,
  side,
  onTab,
  onAudit,
  onReference,
}: {
  d: Architecture;
  side: "a" | "b";
  onTab: (tab: string) => void;
  onAudit: () => void;
  onReference: (id: ProfileId) => void;
}) {
  const s = useCatalogue(),
    key = lifecycleKey(d),
    level = s.assemblyLevels[key] ?? 12;
  const [search, setSearch] = useState("");
  const parts = d.components.filter(
    (p) =>
      p.level <= level &&
      `${p.name} ${p.id} ${partType(d, p)} ${p.concept}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <aside className="left cat-workbench-rail">
      <div className="eyebrow">ARCHITECTURE</div>
      {(s.screen === "compare" ? ["a", "b"] : ["a"]).map((side) => (
        <label key={side}>
          {s.screen === "compare" ? side.toUpperCase() : ""}
          <select
            aria-label={`Architecture ${side.toUpperCase()}`}
            value={s[side as "a" | "b"]}
            onChange={(e) =>
              e.target.value.startsWith("CAT-")
                ? s.choose(side as "a" | "b", e.target.value as FamilyId)
                : onReference(e.target.value as ProfileId)
            }
          >
            <optgroup label="Rack catalogue">
              {architectures.map((a) => (
                <option key={a.architectureId} value={a.architectureId}>
                  {a.familyName}
                </option>
              ))}
            </optgroup>
            {side === "a" && (
              <optgroup label="Reference profiles">
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      ))}
      {s.screen === "compare" && (
        <label>
          <input
            type="checkbox"
            checked={s.linkedOverlays}
            onChange={(e) =>
              s.set({
                linkedOverlays: e.target.checked,
                ...(e.target.checked ? { overlayB: s.overlayA } : {}),
              })
            }
          />
          Linked overlays
        </label>
      )}
      {(s.screen === "compare" ? ["a", "b"] : ["a"]).map((side) => {
        const base = architectureById[s[side as "a" | "b"]];
        return (
          base.variants.some((v) => v.modelled) && (
            <label key={side}>
              Generation {side.toUpperCase()}
              <select
                aria-label={`Generation ${side.toUpperCase()}`}
                value={side === "a" ? s.variantA : s.variantB}
                onChange={(e) =>
                  s.set({
                    [side === "a" ? "variantA" : "variantB"]: e.target.value,
                    focus: "rack",
                    orbit: null,
                    cameraRevision: s.cameraRevision + 1,
                  })
                }
              >
                <option value="">{base.generation}</option>
                {base.variants
                  .filter((v) => v.modelled)
                  .map((v) => (
                    <option value={v.id} key={v.id}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </label>
          )
        );
      })}
      <div className="segmented">
        <button
          className={s.focus !== "row" ? "active" : ""}
          onClick={() => s.drill("rack")}
        >
          Single rack
        </button>
        <button
          className={s.focus === "row" ? "active" : ""}
          onClick={() => s.drill("row")}
        >
          Row overview
        </button>
      </div>
      <small className="cat-rail-scope">
        {d.unitOfComparison}
        {s.focus === "row"
          ? " · neighboring copies are illustrative context"
          : ""}
      </small>
      <div className="eyebrow">ASSEMBLY / INTEGRATION</div>
      <label className="level-label">
        L{level}
        <span>{lifecycleStage(d, level).name}</span>
      </label>
      <input
        aria-label="Integration level"
        type="range"
        min="1"
        max="12"
        value={level}
        onChange={(e) => {
          s.set({ buildTime: false, experience: "Inspect" });
          s.setAssemblyLevel(d, +e.target.value);
        }}
      />
      <div className="ticks">
        {d.lifecycleStages.map((l) => (
          <button
            key={l.level}
            aria-label={`Preview L${l.level}`}
            className={l.level === level ? "active" : ""}
            onClick={() => {
              s.set({ buildTime: false });
              s.setAssemblyLevel(d, l.level);
            }}
          >
            {l.level}
          </button>
        ))}
      </div>
      <button onClick={() => onTab("L1–L12")}>
        Gate evidence ·{" "}
        {
          Object.values(s.gateRecords[key] || {}).filter((r) => r.signedAt)
            .length
        }
        /{d.lifecycleStages.filter((l) => l.applicable).length} passed
      </button>
      <div className="eyebrow">SYSTEM LAYERS</div>
      <div className="overlays">
        {systemLayers.map((layer, i) => (
          <button
            key={layer}
            className={
              (side === "a" ? s.overlayA : s.overlayB) === layer ? "active" : ""
            }
            onClick={() =>
              s.set({
                ...(s.linkedOverlays
                  ? { overlayA: layer, overlayB: layer }
                  : side === "a"
                    ? { overlayA: layer }
                    : { overlayB: layer }),
                ...(layer === "Liquid Cooling"
                  ? {
                      camera: "rear",
                      cameraRevision: s.cameraRevision + 1,
                      orbit: null,
                    }
                  : {}),
              })
            }
          >
            <span>{["◇", "ϟ", "≈", "≋", "⌁", "◎", "▤", "⤳"][i]}</span>
            {layer}
          </button>
        ))}
      </div>
      <div className="eyebrow">COMPONENT EXPLORER</div>
      <input
        aria-label="Search components"
        placeholder="Search name, ID, subsystem…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="tree" role="tree" aria-label="Accessible component tree">
        {parts.slice(0, 150).map((p) => (
          <button
            role="treeitem"
            key={p.id}
            title={p.id}
            aria-selected={s.selections[d.architectureId] === p.id}
            className={
              s.selections[d.architectureId] === p.id ? "selected" : ""
            }
            onClick={() => {
              s.select(d.architectureId, p.id, p.concept);
              onTab("Intelligence");
            }}
            onDoubleClick={() => {
              s.select(d.architectureId, p.id, p.concept);
              s.drill(inspectionView(p));
            }}
          >
            <span>▪</span> {p.name}
            <small>L{p.level}</small>
          </button>
        ))}
        {parts.length > 150 && <p>First 150 matches; refine search.</p>}
      </div>
      <button onClick={onAudit}>Inventory & performance audit</button>
    </aside>
  );
}
