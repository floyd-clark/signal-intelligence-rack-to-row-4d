import type { Architecture } from "../types";
import { useCatalogue, emptyInvestigation } from "../store";
import { lifecycleKey } from "../lifecycle";
import {
  blankReplay,
  catalogueFaults,
  catalogueSnapshot,
  importCatalogueReplay,
} from "../scenarios/engine";

export function Investigation({
  d,
  side,
  save,
  onMessage,
}: {
  d: Architecture;
  side: "a" | "b";
  save: (name: string, data: unknown) => void;
  onMessage: (message: string) => void;
}) {
  const s = useCatalogue(),
    key = lifecycleKey(d),
    replay = s.replays[d.architectureId] || blankReplay(d.architectureId),
    snap = catalogueSnapshot(d, replay, s.time);
  const replayKey = `${replay.fault}:${replay.injectedAt}:${replay.seed}`;
  const saved = s.investigations[key],
    record =
      saved?.replayKey === replayKey ? saved : emptyInvestigation(replayKey);
  const update = (patch: Partial<typeof record>) =>
    s.set({
      investigations: { ...s.investigations, [key]: { ...record, ...patch } },
    });
  const healthy =
    !!replay.fault &&
    replay.recoveredAt !== null &&
    s.time >= replay.recoveredAt &&
    snap.strength <= 0.02;
  const canRelease =
    healthy &&
    record.evidence.length >= 2 &&
    record.hypothesis === snap.fault?.hypotheses[0] &&
    record.containmentAt !== null &&
    !!s.gateRecords[key]?.[12]?.signedAt &&
    s.gateRecords[key]?.[12]?.signedAt !== record.gateAtRecovery;
  return (
    <>
      <h3>Family-specific synthetic lab</h3>
      <label>
        <input
          type="checkbox"
          checked={s.challenge}
          onChange={(e) => {
            s.set({ challenge: e.target.checked });
            update({ reveal: false });
          }}
        />{" "}
        Challenge diagnosis
      </label>
      <select
        aria-label="Catalogue fault"
        value={replay.fault || ""}
        onChange={(e) => {
          if (e.target.value) {
            s.inject(d.architectureId, e.target.value);
          }
        }}
      >
        <option value="">Choose a fault to inject</option>
        {catalogueFaults
          .filter((f) => f.family === d.architectureId)
          .map((f, i) => (
            <option key={f.id} value={f.id}>
              {s.challenge ? `Hidden case ${i + 1}` : f.name}
            </option>
          ))}
      </select>
      <button
        disabled={!replay.fault}
        onClick={() =>
          s.set({
            replays: {
              ...s.replays,
              [d.architectureId]: blankReplay(d.architectureId),
            },
            playing: false,
            investigations: {
              ...s.investigations,
              [key]: emptyInvestigation(),
            },
          })
        }
      >
        Clear family incident
      </button>
      {snap.fault && (
        <>
          <p className="signature">{snap.fault.signature}</p>
          <p>
            Scope: <strong>{snap.scope}</strong> · {snap.affected.length}{" "}
            affected visual records
          </p>
          <p>
            Flow {snap.flowLmin?.toFixed(1) ?? "N/A"} L/min · pressure{" "}
            {snap.pressureKpa?.toFixed(1) ?? "N/A"} kPa · return{" "}
            {snap.returnC?.toFixed(1) ?? "N/A"} °C · retries {snap.retries}
          </p>
          <h3>Collect independent evidence</h3>
          <small>
            These records acknowledge simulated checks; no physical tests have
            run.
          </small>
          {snap.fault.tests.map((t) => (
            <label key={t}>
              <input
                type="checkbox"
                checked={record.evidence.includes(t)}
                onChange={() =>
                  update({
                    evidence: record.evidence.includes(t)
                      ? record.evidence.filter((e) => e !== t)
                      : [...record.evidence, t],
                    decision: "",
                  })
                }
              />
              {t}
            </label>
          ))}
          <label>
            Root-cause hypothesis
            <select
              aria-label="Catalogue hypothesis"
              value={record.hypothesis}
              onChange={(e) =>
                update({ hypothesis: e.target.value, decision: "" })
              }
            >
              <option value="">Choose after evidence</option>
              {snap.fault.hypotheses.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          {!s.challenge || record.reveal ? (
            <>
              <h3>Containment / prevention</h3>
              <p>{snap.fault.containment}</p>
              <p>{snap.fault.prevention}</p>
            </>
          ) : (
            <button
              disabled={record.evidence.length < 2}
              onClick={() => update({ reveal: true })}
            >
              Reveal diagnosis after evidence
            </button>
          )}
          <button
            disabled={record.evidence.length < 2 || !record.hypothesis}
            onClick={() => update({ containmentAt: s.time, decision: "" })}
          >
            Record containment plan
          </button>
          {record.containmentAt !== null && (
            <p>
              Plan recorded at {record.containmentAt}s. {snap.fault.containment}
            </p>
          )}
          <button
            disabled={
              record.containmentAt === null || replay.recoveredAt !== null
            }
            onClick={() => {
              s.set({
                replays: {
                  ...s.replays,
                  [d.architectureId]: { ...replay, recoveredAt: s.time },
                },
              });
              update({
                decision: "",
                gateAtRecovery: s.gateRecords[key]?.[12]?.signedAt || null,
              });
            }}
          >
            Apply simulated recovery
          </button>
          <h3>TPM release decision</h3>
          <p>
            {healthy
              ? "Synthetic baseline recovered."
              : "Hold: fault response or recovery validation remains open."}{" "}
            {s.gateRecords[key]?.[12]?.signedAt
              ? "Owned L12 gate signed."
              : "Owned L12 evidence/signoff required."}
          </p>
          <button
            disabled={!canRelease}
            onClick={() =>
              update({
                decision:
                  "Release supported by synthetic evidence and owned L12 signoff",
              })
            }
          >
            Record release decision
          </button>
          <button
            onClick={() =>
              update({
                decision: "Hold / containment pending further qualification",
              })
            }
          >
            Record hold decision
          </button>
          {record.decision && <p role="status">{record.decision}</p>}
        </>
      )}
      <button
        onClick={() =>
          save("signal-intelligence-catalogue-replay.json", replay)
        }
      >
        Export catalogue replay
      </button>
      <label>
        Import catalogue replay
        <input
          aria-label="Import catalogue replay"
          type="file"
          accept=".json"
          onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 100000) throw Error("Replay exceeds 100 kB");
              const r = importCatalogueReplay(await file.text());
              s.choose(side, r.family);
              s.set({ replays: { ...s.replays, [r.family]: r } });
              onMessage("Replay loaded locally");
            } catch (e) {
              onMessage((e as Error).message);
            }
          }}
        />
      </label>
      <button
        onClick={() =>
          save("signal-intelligence-catalogue-evidence.json", {
            version: 1,
            architecture: d.architectureId,
            generation: d.generation,
            component: s.selections[d.architectureId],
            role: s.role,
            replay,
            time: s.time,
            telemetry: snap,
            investigation: record,
            gateRecords: s.gateRecords[key] || {},
            sourceRefs: d.sourceRefs,
            disclosure: d.disclosureBanner,
            synthetic: true,
          })
        }
      >
        Export incident evidence
      </button>
      <p>
        Both sides share time. Faults, evidence, hypotheses, containment and
        release decisions belong to the inspected family/generation.
        Communication topology does not imply shared physical failure.
      </p>
      <p>
        All thresholds and event chronologies are illustrative. No live
        equipment controls or vendor failure-prevalence claim.
      </p>
    </>
  );
}
