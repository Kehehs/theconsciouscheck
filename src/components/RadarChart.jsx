import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const SHORT_LABEL = {
  Consciousness: "Conscious.",
  Action: "Action",
  Responsibility: "Respons.",
  Engagement: "Engage.",
  "Self-Growth": "Growth",
};

export default function RadarChart({ pillarScores }) {
  const data = Object.entries(pillarScores).map(([pillar, score]) => ({
    pillar: SHORT_LABEL[pillar] ?? pillar,
    value: Math.round(score.normalized),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RechartsRadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.35)" />
        <PolarAngleAxis
          dataKey="pillar"
          tick={{ fill: "#3a2a1a", fontSize: 12, fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
        />
        <Radar
          dataKey="value"
          stroke="#E97F3F"
          fill="#E97F3F"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
