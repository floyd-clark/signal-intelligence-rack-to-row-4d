import { useState } from "react";
import type { Architecture } from "../types";
import { useCatalogue } from "../store";
import {
  canSignStage,
  emptyGate,
  fixtureResult,
  lifecycleKey,
  lifecycleStage,
  previousApplicable,
} from "../lifecycle";

export function AssemblyStages({
  d,
  side,
  onOpen,
}: {
  d: Architecture;
  side: "a" | "b";
  onOpen: () => void;
}) {
  const s = useCatalogue(),
    key = lifecycleKey(d),
    level = s.assemblyLevels[key] ?? 12,
    records = s.gateRecords[key] || {};
  return (
    <section
      className="cat-assembly"
      aria-label={`${side.toUpperCase()} L1–L12 assembly`}
      data-testid={`assembly-${side}`}
      data-level={level}
    >
      <div className="cat-assembly-heading">
        <strong>{side.toUpperCase()} · L1–L12 integration</strong>
        <span>
          L{level} · {lifecycleStage(d, level).name}
        </span>
        <button onClick={onOpen}>Gate evidence</button>
      </div>
      <div className="cat-stage-buttons">
        {d.lifecycleStages.map((stage) => (
          <button
            key={stage.level}
            aria-label={`${side.toUpperCase()} L${stage.level} ${stage.name}`}
            aria-pressed={level === stage.level}
            title={`${stage.name} · ${!stage.applicable ? "N/A for this cooling configuration" : records[stage.level]?.signedAt ? "Synthetic pass signed" : "Preview / evidence pending"}`}
            data-state={
              !stage.applicable
                ? "na"
                : records[stage.level]?.signedAt
                  ? "passed"
                  : "pending"
            }
            onClick={() => {
              s.setAssemblyLevel(d, stage.level);
              onOpen();
            }}
          >
            L{stage.level}
            {records[stage.level]?.signedAt
              ? " ✓"
              : !stage.applicable
                ? " ·"
                : ""}
          </button>
        ))}
      </div>
      <small>
        {Object.values(records).filter((r) => r.signedAt).length}/
        {d.lifecycleStages.filter((l) => l.applicable).length} applicable gates
        signed · rack preview · progress saved on this device
      </small>
    </section>
  );
}

export function LifecyclePanel({
  d,
  activeFault,
  onExport,
}: {
  d: Architecture;
  activeFault: boolean;
  onExport: (data: unknown) => void;
}) {
  const s = useCatalogue(),
    key = lifecycleKey(d),
    level = s.assemblyLevels[key] ?? 12,
    stage = lifecycleStage(d, level),
    records = s.gateRecords[key] || {},
    record = records[level] || emptyGate(),
    previous = previousApplicable(d, level);
  const [failing, setFailing] = useState(false);
  return (
    <section
      className="cat-lifecycle-panel"
      aria-label="L1–L12 gate evidence"
      data-family={key}
    >
      <h3>
        L{level} / {stage.name}
      </h3>
      <p>
        DRI: {stage.owner} · NPI phase: {stage.phase}
      </p>
      <p>{stage.context}</p>
      <label>
        Assembly level {level}
        <input
          aria-label="Catalogue assembly level"
          type="range"
          min="1"
          max="12"
          value={level}
          onChange={(e) => s.setAssemblyLevel(d, +e.target.value)}
        />
      </label>
      <p className="cat-lifecycle-scope">
        Educational L1–L12 mapping. Tests and signatures below are synthetic
        fixtures, not physical qualification or vendor work instructions.
      </p>
      {!stage.applicable ? (
        <p role="status">
          L{level} is N/A for {d.familyName}: {stage.context} The next
          applicable gate depends on L{previous}.
        </p>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={failing}
              onChange={(e) => setFailing(e.target.checked)}
            />{" "}
            Simulate a failing acceptance fixture
          </label>
          {stage.tests.map((test, i) => (
            <div className="cat-gate-test" key={`${key}/${level}/${i}`}>
              <strong>{test}</strong>
              <button
                onClick={() =>
                  s.recordGateResult(
                    d,
                    level,
                    i,
                    fixtureResult(failing, activeFault),
                  )
                }
              >
                Run simulated test {i + 1}
              </button>
              <span data-testid={`gate-result-${i}`}>
                {record.results[i]?.detail || "Evidence pending"}
              </span>
            </div>
          ))}
          <label>
            Evidence / reviewer note
            <textarea
              aria-label="Catalogue gate evidence note"
              value={record.note}
              onChange={(e) => s.recordGateNote(d, level, e.target.value)}
              placeholder="Record the fixture observation, artifact and reviewer context…"
            />
          </label>
          <button
            disabled={
              !canSignStage(d, level, records, activeFault) || !!record.signedAt
            }
            onClick={() => s.signGate(d, level, activeFault)}
          >
            Sign earned L{level} pass
          </button>
          <p role="status">
            {record.signedAt
              ? `L${level} synthetic pass signed · ${stage.owner}`
              : activeFault
                ? "Blocked: clear the active incident in Investigate before signing."
                : previous && !records[previous]?.signedAt
                  ? `Blocked: earn the previous applicable L${previous} pass first.`
                  : "Requires three passing simulated checks and an evidence note."}
          </p>
        </>
      )}
      <details>
        <summary>All L1–L12 gate states</summary>
        {d.lifecycleStages.map((l) => (
          <button
            className="cat-gate-summary"
            key={l.level}
            onClick={() => s.setAssemblyLevel(d, l.level)}
          >
            L{l.level} · {l.name} ·{" "}
            {!l.applicable
              ? "N/A"
              : records[l.level]?.signedAt
                ? "signed"
                : "pending"}
          </button>
        ))}
      </details>
      <button
        onClick={() =>
          onExport({
            version: 1,
            architecture: d.architectureId,
            generation: d.generation,
            lifecycleKey: key,
            stages: d.lifecycleStages.map((l) => lifecycleStage(d, l.level)),
            records,
            synthetic: true,
          })
        }
      >
        Export L1–L12 evidence
      </button>
      <p>
        Changing earlier evidence invalidates downstream passes. Previewing a
        level does not earn acceptance. Air-only families keep L4 visible as N/A
        and validate airflow at L10.
      </p>
    </section>
  );
}
