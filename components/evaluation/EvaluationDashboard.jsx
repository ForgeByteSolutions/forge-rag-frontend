"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { getEvaluationMetrics } from "@/lib/api";

const METRICS = [
  { key: "faithfulness",      label: "Faithfulness",       color: "#3bb978" },
  { key: "answer_relevance",  label: "Answer Relevance",   color: "#12b8cd" },
  { key: "context_precision", label: "Context Precision",  color: "#8b5cf6" },
];

function ScoreGauge({ label, value, color }) {
  const pct = Math.min(value * 100, 100);
  const score = (value * 10).toFixed(1);
  const status = value >= 0.8 ? "Excellent" : value >= 0.6 ? "Good" : value > 0 ? "Needs Work" : "No Data";
  const statusColor = value >= 0.8 ? "#3bb978" : value >= 0.6 ? "#f59e0b" : value > 0 ? "#ef4444" : "#94a3b8";

  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "20px 24px",
      border: "1px solid rgba(0,0,0,0.05)", flex: 1,
      boxShadow: "0 2px 12px rgba(0,0,0,0.03)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{label}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px",
          borderRadius: 99, background: statusColor + "18", color: statusColor
        }}>{status}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#1e293b", marginBottom: 10, lineHeight: 1 }}>
        {value > 0 ? score : "—"}
        <span style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8", marginLeft: 4 }}>/10</span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 99, transition: "width 1s ease"
        }} />
      </div>
    </div>
  );
}

function FeedbackBar({ positive, negative }) {
  const total = positive + negative;
  const posPct = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negPct = total > 0 ? 100 - posPct : 0;

  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "20px 24px",
      border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)"
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
        User Sentiment
      </div>
      <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#3bb978" }}>👍 {posPct}%</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{positive} positive</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444" }}>👎 {negPct}%</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{negative} negative</div>
        </div>
      </div>
      {total > 0 ? (
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${posPct}%`, background: "#3bb978", transition: "width 1s ease" }} />
          <div style={{ width: `${negPct}%`, background: "#ef4444", transition: "width 1s ease" }} />
        </div>
      ) : (
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99 }} />
      )}
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>{total} total ratings</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", borderRadius: 12, padding: "10px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)", border: "none"
    }}>
      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Message #{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontSize: 13, fontWeight: 700, color: p.color, margin: "2px 0" }}>
          {p.name}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function EvaluationDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [feedbackCounts, setFeedbackCounts] = useState({ positive: 0, negative: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvaluationMetrics()
      .then(data => {
        setMetrics(data?.metrics || []);
        setFeedbackCounts(data?.feedback || { positive: 0, negative: 0, total: 0 });
      })
      .catch(() => setMetrics([]))
      .finally(() => setLoading(false));
  }, []);

  const avgFaithfulness    = metrics.length ? metrics.reduce((a, b) => a + (b.faithfulness || 0), 0) / metrics.length : 0;
  const avgRelevance       = metrics.length ? metrics.reduce((a, b) => a + (b.answer_relevance || 0), 0) / metrics.length : 0;
  const avgPrecision       = metrics.length ? metrics.reduce((a, b) => a + (b.context_precision || 0), 0) / metrics.length : 0;
  const positiveCount      = feedbackCounts.positive;
  const negativeCount      = feedbackCounts.negative;

  // Chart data
  const chartData = metrics.slice(-20).map((m, i) => ({
    name: i + 1,
    Faithfulness:   parseFloat((m.faithfulness || 0).toFixed(2)),
    Relevance:      parseFloat((m.answer_relevance || 0).toFixed(2)),
    Precision:      parseFloat((m.context_precision || 0).toFixed(2)),
  }));

  // Worst performers: messages with any metric below 0.6
  const worstPerformers = metrics.filter(m =>
    (m.faithfulness || 0) < 0.6 ||
    (m.answer_relevance || 0) < 0.6 ||
    (m.context_precision || 0) < 0.6
  ).slice(0, 5);

  if (loading) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "3px solid #e2e8f0", borderTopColor: "#12b8cd",
          animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
        }} />
        <p style={{ fontSize: 14, color: "#94a3b8" }}>Loading evaluation metrics…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Section Title */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>RAG Quality Metrics</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Aggregate performance trends across all documents and workspaces.
          {metrics.length > 0 && <span style={{ color: "#12b8cd", fontWeight: 600 }}> {metrics.length} evaluations recorded.</span>}
        </p>
      </div>

      {/* Score Gauges */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <ScoreGauge label="Faithfulness"      value={avgFaithfulness} color="#3bb978" />
        <ScoreGauge label="Answer Relevance"  value={avgRelevance}    color="#12b8cd" />
        <ScoreGauge label="Context Precision" value={avgPrecision}    color="#8b5cf6" />
      </div>

      {/* Feedback Bar */}
      <div style={{ marginBottom: 24 }}>
        <FeedbackBar positive={positiveCount} negative={negativeCount} />
      </div>

      {/* Trends Chart */}
      {chartData.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: "20px 24px",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>
            Performance Trends (last {chartData.length} evals)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                {[["faith","#3bb978"], ["rel","#12b8cd"], ["prec","#8b5cf6"]].map(([id, color]) => (
                  <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}   />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              <Area type="monotone" dataKey="Faithfulness"  stroke="#3bb978" fill="url(#g-faith)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Relevance"     stroke="#12b8cd" fill="url(#g-rel)"   strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Precision"     stroke="#8b5cf6" fill="url(#g-prec)"  strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Worst Performers */}
      {worstPerformers.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: "20px 24px",
          border: "1px solid rgba(239,68,68,0.12)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
              Low-Scoring Interactions
            </h3>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            These interactions are pulling your scores down. Consider reviewing the source documents or retrieval configuration.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {worstPerformers.map((m, i) => (
              <div key={i} style={{
                background: "#fef2f2", borderRadius: 12, padding: "12px 16px",
                border: "1px solid rgba(239,68,68,0.08)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, marginBottom: 2 }}>
                    {m.doc_id ? `Doc: ${m.doc_id.substring(0, 8)}…` : m.workspace_id ? `Workspace: ${m.workspace_id.substring(0, 8)}…` : "Global"}
                  </p>
                  <p style={{ fontSize: 12, color: "#374151", margin: 0, fontWeight: 500 }}>Message #{i + 1}</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {METRICS.map(metric => {
                    const val = m[metric.key] || 0;
                    const bad = val < 0.6;
                    return (
                      <div key={metric.key} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: bad ? "#ef4444" : metric.color }}>
                          {val.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>
                          {metric.label.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics.length === 0 && (
        <div style={{
          textAlign: "center", padding: "48px 20px", background: "#fff",
          borderRadius: 20, border: "1px solid rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: 0 }}>No evaluations yet</p>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
            Open a workspace, ask questions, then click <strong>Evals</strong> to run your first evaluation.
          </p>
        </div>
      )}
    </div>
  );
}
