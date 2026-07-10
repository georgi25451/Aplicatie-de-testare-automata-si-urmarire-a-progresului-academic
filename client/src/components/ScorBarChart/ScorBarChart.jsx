import { useState } from "react";
import "./ScorBarChart.css";

function ScorBarChart({ teste }) {
  const [tooltip, setTooltip] = useState(null);

  const testeData = [...teste]
    .sort((a, b) => new Date(a.dataTest) - new Date(b.dataTest))
    .map((test) => {
      const maxScor = Math.max((test.nrIntrebari || 10) * 10, 1);
      const percentage = Math.min(100, Math.round((test.scor / maxScor) * 100));
      return { ...test, percentage };
    });

  const nrTeste = testeData.length;
  const scorMediu =
    nrTeste > 0
      ? Math.round(testeData.reduce((s, t) => s + t.percentage, 0) / nrTeste)
      : 0;
  const celMaiBunScor =
    nrTeste > 0 ? Math.max(...testeData.map((t) => t.percentage)) : 0;

  if (nrTeste === 0) {
    return (
      <div className="score-chart-card chart-empty-state">
        <div className="chart-empty-icon">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p>Susține primul test pentru a-ți vedea progresul aici!</p>
      </div>
    );
  }

  const CHART_H = 220;
  const PAD_LEFT = 48;
  const PAD_BOTTOM = 52;
  const PAD_TOP = 12;
  const PAD_RIGHT = 20;
  const BAR_W = Math.min(56, Math.max(24, Math.floor(480 / nrTeste) - 12));
  const GAP = Math.max(10, Math.round(BAR_W * 0.35));
  const svgW = Math.max(420, PAD_LEFT + nrTeste * (BAR_W + GAP) - GAP + PAD_RIGHT);
  const svgH = CHART_H + PAD_BOTTOM + PAD_TOP;

  const getColors = (pct) => {
    if (pct < 50) return ["#b91c1c", "#f87171"];
    if (pct < 75) return ["#b45309", "#fbbf24"];
    return ["#15803d", "#4ade80"];
  };

  const fmtShort = (d) =>
    new Date(d).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });

  const fmtLong = (d) =>
    new Date(d).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const diffLabel = (pct) => {
    if (pct < 50) return "Sub medie";
    if (pct < 75) return "Mediu";
    return "Bun";
  };

  const gridVals = [0, 25, 50, 75, 100];

  return (
    <div className="score-chart-card">
      {/* ── Header ── */}
      <div className="chart-header">
        <h3 className="chart-title">Evoluția scorurilor</h3>
        <div className="chart-stats-row">
          <div className="chart-stat-item">
            <span className="chart-stat-num">{nrTeste}</span>
            <span className="chart-stat-lbl">Teste susținute</span>
          </div>
          <div className="chart-stat-sep" />
          <div className="chart-stat-item">
            <span className="chart-stat-num">{scorMediu}%</span>
            <span className="chart-stat-lbl">Scor mediu</span>
          </div>
          <div className="chart-stat-sep" />
          <div className="chart-stat-item">
            <span className="chart-stat-num">{celMaiBunScor}%</span>
            <span className="chart-stat-lbl">Cel mai bun scor</span>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="chart-scroll-outer">
        <svg width={svgW} height={svgH} className="chart-svg">
          <defs>
            {testeData.map((test) => {
              const [c1, c2] = getColors(test.percentage);
              return (
                <linearGradient
                  key={`g-${test.idTest}`}
                  id={`g-${test.idTest}`}
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={c1} />
                  <stop offset="100%" stopColor={c2} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Grid lines + Y axis labels */}
          {gridVals.map((val) => {
            const y = PAD_TOP + CHART_H - (val / 100) * CHART_H;
            return (
              <g key={val}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={svgW - PAD_RIGHT}
                  y2={y}
                  stroke={val === 0 ? "#cbd5e1" : "#e2e8f0"}
                  strokeWidth={val === 0 ? 1.5 : 1}
                  strokeDasharray={val > 0 ? "5 4" : undefined}
                />
                <text
                  x={PAD_LEFT - 7}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Y axis line */}
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP}
            x2={PAD_LEFT}
            y2={PAD_TOP + CHART_H}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Bars */}
          {testeData.map((test, i) => {
            const x = PAD_LEFT + i * (BAR_W + GAP);
            const rawH = (test.percentage / 100) * CHART_H;
            const barH = test.percentage === 0 ? 3 : Math.max(rawH, 3);
            const y = PAD_TOP + CHART_H - barH;
            const animDelay = `${i * 0.1}s`;

            return (
              <g key={test.idTest}>
                <rect
                  x={x}
                  y={y}
                  width={BAR_W}
                  height={barH}
                  fill={`url(#g-${test.idTest})`}
                  rx={5}
                  ry={5}
                  className="chart-bar"
                  style={{ animationDelay: animDelay }}
                  onMouseEnter={(e) =>
                    setTooltip({ test, index: i, cx: e.clientX, cy: e.clientY })
                  }
                  onMouseMove={(e) =>
                    setTooltip((p) =>
                      p ? { ...p, cx: e.clientX, cy: e.clientY } : null
                    )
                  }
                  onMouseLeave={() => setTooltip(null)}
                />

                {barH > 26 && (
                  <text
                    x={x + BAR_W / 2}
                    y={y + 17}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="rgba(255,255,255,0.92)"
                    className="bar-pct-label"
                    style={{ animationDelay: `${i * 0.1 + 0.5}s` }}
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    pointerEvents="none"
                  >
                    {test.percentage}%
                  </text>
                )}

                <text
                  x={x + BAR_W / 2}
                  y={PAD_TOP + CHART_H + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  T{i + 1}
                </text>
                <text
                  x={x + BAR_W / 2}
                  y={PAD_TOP + CHART_H + 34}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#94a3b8"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  {fmtShort(test.dataTest)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div
          className="chart-tooltip"
          style={{ left: tooltip.cx + 14, top: tooltip.cy - 78 }}
        >
          <div className="tooltip-name">
            {tooltip.test.TestTemplate?.numeTemplate ||
              `Test ${tooltip.index + 1}`}
          </div>
          <div className="tooltip-row">
            <span>Scor</span>
            <strong>{tooltip.test.percentage}%</strong>
          </div>
          <div className="tooltip-row">
            <span>XP obținut</span>
            <strong>{tooltip.test.scor} XP</strong>
          </div>
          <div className="tooltip-row">
            <span>Nivel</span>
            <strong>{diffLabel(tooltip.test.percentage)}</strong>
          </div>
          <div className="tooltip-row">
            <span>Data</span>
            <strong>{fmtLong(tooltip.test.dataTest)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScorBarChart;
