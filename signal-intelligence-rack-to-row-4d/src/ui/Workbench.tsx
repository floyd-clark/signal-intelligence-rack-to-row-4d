import type { ReactNode } from "react";

export function SignalBrand() {
  return (
    <div className="brand">
      <span className="brandmark">
        <img
          src={`${import.meta.env.BASE_URL}brand/signal-intelligence-symbol.png`}
          alt="Signal Intelligence symbol"
          width="90"
          height="90"
        />
      </span>
      <div>
        <span className="brand-name">SIGNAL INTELLIGENCE</span>
        <small>RACK-TO-ROW · 4D DIGITAL TWIN</small>
      </div>
    </div>
  );
}
export function WorkbenchFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`workspace ${className}`} data-testid="4d-workbench">
      {children}
    </div>
  );
}
export function TimelineTransport({
  time,
  playing,
  speed,
  bookmarks,
  onTime,
  onPlay,
  onSpeed,
  onBookmark,
  label = "Time scrubber",
  buildTime = false,
}: {
  time: number;
  playing: boolean;
  speed: number;
  bookmarks: number[];
  onTime: (time: number) => void;
  onPlay: () => void;
  onSpeed: (speed: number) => void;
  onBookmark: () => void;
  label?: string;
  buildTime?: boolean;
}) {
  return (
    <>
      <div className="row">
        <button onClick={onPlay}>{playing ? "Ⅱ Pause" : "▶ Play"}</button>
        <select
          aria-label="Playback speed"
          value={speed}
          onChange={(e) => onSpeed(+e.target.value)}
        >
          {[1, 10, 100].map((n) => (
            <option key={n} value={n}>
              {n}×
            </option>
          ))}
        </select>
        <button onClick={() => onTime(Math.max(0, time - 30))}>−30s</button>
        <input
          aria-label={label}
          type="range"
          min="0"
          max="600"
          value={time}
          onChange={(e) => onTime(+e.target.value)}
        />
        <b>
          {buildTime
            ? `Day ${Math.floor(time / 5)}`
            : `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`}
        </b>
        <button onClick={onBookmark}>Bookmark</button>
      </div>
      <div className="event-tape">
        {bookmarks.map((time, i) => (
          <button key={i} onClick={() => onTime(time)}>
            {Math.floor(time)}s
          </button>
        ))}
      </div>
    </>
  );
}
export function TelemetryChart({
  values,
  baseline,
  unit,
  metric,
  time,
  comparison,
}: {
  values: number[];
  baseline?: number;
  comparison?: number[];
  unit: string;
  metric: string;
  time: number;
}) {
  const all = [
      ...values,
      ...(comparison || []),
      ...(baseline === undefined ? [] : [baseline]),
    ],
    min = Math.min(...all),
    max = Math.max(...all, min + 0.001);
  const y = (value: number) => 48 - ((value - min) / (max - min)) * 40;
  const path = (points: number[]) =>
    `M ${points.map((v, i) => `${(i * 600) / Math.max(1, points.length - 1)},${y(v)}`).join(" L ")}`;
  return (
    <svg
      className="chart"
      viewBox="0 0 600 55"
      role="img"
      aria-label={`${metric} in ${unit}, synthetic data`}
    >
      <path
        d={path(values)}
        fill="none"
        stroke="var(--brand-accent)"
        strokeWidth="1.6"
      />
      {comparison && (
        <path
          d={path(comparison)}
          fill="none"
          stroke="#b6cada"
          strokeDasharray="4 4"
        />
      )}
      {baseline !== undefined && (
        <line
          x1="0"
          x2="600"
          y1={y(baseline)}
          y2={y(baseline)}
          stroke="#8da4b8"
          strokeDasharray="4 4"
        />
      )}
      <line x1={time} x2={time} y1="0" y2="55" stroke="#e9bf77" />
    </svg>
  );
}
export interface IntelligenceCard {
  shortDescription: string;
  whyItMatters: string;
  normalOperatingPrinciple: string;
  primaryFailureSignature: string;
  secondarySignatures: string[];
  alternativeExplanations: string[];
  telemetryKeys: string[];
  evidenceToCollect: string[];
  applicabilityNotes: string;
  validationTests: string[];
  exitCriteria: string[];
  ownerFunctions: string[];
}
export function ComponentIntelligence({
  card,
  downstream,
  downstreamCount,
  onInvestigate,
  children,
}: {
  card: IntelligenceCard;
  downstream: string;
  downstreamCount: number;
  onInvestigate: () => void;
  children?: ReactNode;
}) {
  return (
    <>
      <section>
        <h3>What is it?</h3>
        <p>{card.shortDescription}</p>
        <h3>Why it matters</h3>
        <p>{card.whyItMatters}</p>
      </section>
      <section>
        <h3>What would I see?</h3>
        <p className="signature">△ {card.primaryFailureSignature}</p>
        <h3>How do I distinguish it?</h3>
        {card.evidenceToCollect.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <small>Alternative: {card.alternativeExplanations[0]}</small>
      </section>
      <details>
        <summary>Engineer depth / operating principle</summary>
        <p>{card.normalOperatingPrinciple}</p>
        <p>{card.secondarySignatures.join(" · ")}</p>
        <p>Telemetry: {card.telemetryKeys.join(", ")}</p>
        <p>{card.applicabilityNotes}</p>
        {children}
      </details>
      <section>
        <h3>What breaks next?</h3>
        <p>{downstream}</p>
        <small>{downstreamCount} downstream nodes</small>
        <h3>How do I confirm it is fixed?</h3>
        {[...card.validationTests, ...card.exitCriteria].map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </section>
      <section>
        <h3>TPM decision and DRI</h3>
        <p>{card.ownerFunctions.join(" + ")}</p>
        <button onClick={onInvestigate}>Investigate selected component</button>
      </section>
    </>
  );
}
