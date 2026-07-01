import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const DIMS = [
  { key: 'sweetness', label: 'Sweet' },
  { key: 'bitterness', label: 'Bitter' },
  { key: 'roastiness', label: 'Roasty' },
  { key: 'spice', label: 'Spice' },
  { key: 'brightness', label: 'Bright' },
  { key: 'creaminess', label: 'Creamy' },
  { key: 'warmth', label: 'Warm' },
  { key: 'complexity', label: 'Complex' },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildChartData(profile) {
  return DIMS.map(({ key, label }) => ({ subject: label, value: profile[key] ?? 0, fullMark: 10 }));
}

export default function FlavorProfileChart({ profile, animating = false }) {
  const [displayed, setDisplayed] = useState(
    Object.fromEntries(DIMS.map(d => [d.key, 0]))
  );

  useEffect(() => {
    if (!profile) return;

    let start = null;
    const duration = 1200;
    const from = { ...displayed };

    function step(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = {};
      for (const { key } of DIMS) {
        next[key] = parseFloat(lerp(from[key], profile[key] ?? 0, eased).toFixed(2));
      }
      setDisplayed(next);
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [profile]);

  const data = buildChartData(displayed);

  return (
    <div className="flavor-chart">
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          />
          <Radar
            dataKey="value"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ fill: 'var(--color-accent)', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      {animating && <p className="flavor-chart__label">Mapping flavor profile…</p>}
    </div>
  );
}
