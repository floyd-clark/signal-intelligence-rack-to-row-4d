import { useMemo, useState } from "react";
import { TelemetryChart, TimelineTransport } from "../../ui/Workbench";
import type { Architecture } from "../types";
import { lifecycleKey } from "../lifecycle";
import { useCatalogue } from "../store";
import { traceFor, traceMetrics, type TraceMetric } from "../workbench";
export function WorkbenchTimeline({
  a,
  b,
}: {
  a: Architecture;
  b: Architecture;
}) {
  const s = useCatalogue(),
    [metric, setMetric] = useState<TraceMetric>("dieC"),
    [baseline, setBaseline] = useState(false);
  const replay = s.replays[a.architectureId];
  const containmentAt =
    s.investigations[lifecycleKey(a)]?.containmentAt ?? null;
  const values = useMemo(
    () => traceFor(a, replay, metric),
    [a, replay, metric],
  );
  const otherReplay = s.replays[b.architectureId];
  const comparison = useMemo(
    () => (s.screen === "compare" ? traceFor(b, otherReplay, metric) : null),
    [b, otherReplay, metric, s.screen],
  );
  const nominal = useMemo(
    () => traceFor(a, undefined, metric)?.[0],
    [a, metric],
  );
  return (
    <div className="timeline cat-workbench-timeline">
      <div className="row">
        <div className="eyebrow">
          4D /{" "}
          {s.buildTime
            ? "BUILD TIME · ILLUSTRATIVE STAGES"
            : "RUNTIME · MINUTES"}
        </div>
        <button
          onClick={() =>
            s.set({
              buildTime: !s.buildTime,
              time: 0,
              playing: false,
              experience: s.buildTime ? "Diagnose" : "Assembly Timeline",
            })
          }
        >
          {s.buildTime ? "Runtime" : "Build time"}
        </button>
        <button aria-pressed={baseline} onClick={() => setBaseline(!baseline)}>
          Baseline compare
        </button>
        <button onClick={() => s.set({ time: 0, playing: false })}>
          Rewind
        </button>
      </div>
      <TimelineTransport
        time={s.time}
        playing={s.playing}
        speed={s.speed}
        bookmarks={s.bookmarks}
        label="Catalogue time"
        buildTime={s.buildTime}
        onTime={(time) => s.set({ time, playing: false })}
        onPlay={() => s.set({ playing: !s.playing })}
        onSpeed={(speed) => s.set({ speed })}
        onBookmark={() =>
          s.set({ bookmarks: [...new Set([...s.bookmarks, s.time])] })
        }
      />
      <div className="row">
        <select
          aria-label="Metric trace"
          value={metric}
          onChange={(e) => setMetric(e.target.value as TraceMetric)}
        >
          {Object.entries(traceMetrics).map(([key, unit]) => (
            <option key={key} value={key}>
              {key} · {unit}
            </option>
          ))}
        </select>
        <small>
          Synthetic / illustrative{" "}
          {s.screen === "compare" ? "· solid A / dashed B" : ""}
        </small>
      </div>
      {s.buildTime ? (
        <p>
          L{Math.min(12, Math.floor(s.time / 50) + 1)} assembly preview · gate
          acceptance remains evidence based.
        </p>
      ) : values ? (
        <TelemetryChart
          values={values}
          comparison={comparison || undefined}
          baseline={baseline ? nominal : undefined}
          metric={metric}
          unit={traceMetrics[metric]}
          time={s.time}
        />
      ) : (
        <p>
          This liquid telemetry does not apply to the selected air baseline.
        </p>
      )}
      <div className="event-tape">
        {replay?.fault && (
          <button
            onClick={() => s.set({ time: replay.injectedAt, playing: false })}
          >
            {replay.injectedAt}s · {replay.fault} injected
          </button>
        )}
        {containmentAt !== null && (
          <button
            onClick={() => s.set({ time: containmentAt!, playing: false })}
          >
            {containmentAt}s · containment plan recorded
          </button>
        )}
        {replay?.recoveredAt !== null && replay?.recoveredAt !== undefined && (
          <button
            onClick={() => s.set({ time: replay.recoveredAt!, playing: false })}
          >
            {replay.recoveredAt}s · simulated recovery
          </button>
        )}
      </div>
      <small>
        {s.buildTime
          ? "Build time previews assembly stages; acceptance still requires gate evidence. No supplier schedule is asserted."
          : "Time, trace, replay and physical fault scope share the active architecture. No measured live telemetry."}
      </small>
    </div>
  );
}
