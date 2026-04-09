"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getEvaluationMetrics, generateSyntheticData } from "@/lib/api";
import { Target, MessageCircle, FileSearch, BarChart2, FlaskConical, Check, ThumbsUp, ThumbsDown, AlertTriangle, TrendingUp, Search } from "lucide-react";

const METRICS = [
  { key: "faithfulness",      label: "Faithfulness",       color: "#3bb978", icon: <Target size={14} /> },
  { key: "answer_relevance",  label: "Answer Relevance",   color: "#12b8cd", icon: <MessageCircle size={14} /> },
  { key: "context_precision", label: "Context Precision",  color: "#8b5cf6", icon: <FileSearch size={14} /> },
];

function MetricBar({ label, color, icon, value }) {
  // value can be: a number (0-1), null (not computed), or 0 (genuinely 0)
  const isNull = value === null || value === undefined;
  const pct = isNull ? 0 : Math.min(value * 100, 100);
  const score = isNull ? null : (value * 10).toFixed(1);
  const bad = !isNull && value > 0 && value < 0.6;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
          {icon} {label}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 800,
          color: isNull ? "#cbd5e1" : bad ? "#ef4444" : value >= 0.8 ? color : "#f59e0b"
        }}>
          {isNull ? "N/A" : value > 0 ? `${score}/10` : "—"}
        </span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: bad ? "#ef4444" : color,
          borderRadius: 99,
          transition: "width 0.8s ease"
        }} />
      </div>
    </div>
  );
}

export default function EvaluationSidePanel({ open, onClose, docId, workspaceId }) {
  const [metrics, setMetrics] = useState([]);
  const [feedback, setFeedback] = useState({ positive: 0, negative: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState("overview");
  const [genSuccess, setGenSuccess] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvaluationMetrics({ doc_id: docId, workspace_id: workspaceId });
      setMetrics(data?.metrics || []);
      setFeedback(data?.feedback || { positive: 0, negative: 0, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [docId, workspaceId]);

  useEffect(() => {
    if (open) {
      setTab("overview");
      fetchMetrics();
      // Auto-refresh every 10s while panel is open to pick up background eval results
      const timer = setInterval(fetchMetrics, 10000);
      return () => clearInterval(timer);
    }
  }, [open, docId, workspaceId, fetchMetrics]);

  const handleGenerateSynthetic = async () => {
    if (!docId) return alert("Please select a single document first.");
    setGenerating(true);
    try {
      const data = await generateSyntheticData(docId, 5);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `synthetic_testset_${docId.substring(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setGenSuccess(true);
      setTimeout(() => setGenSuccess(false), 3000);
    } catch {
      alert("Failed to generate testset. Document needs at least 100 words.");
    } finally {
      setGenerating(false);
    }
  };

  // Compute averages skipping nulls (null = metric not computed, not a 0 score)
  function avg(key) {
    const vals = metrics.map(m => m[key]).filter(v => v !== null && v !== undefined);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const avgFaithfulness = avg("faithfulness");
  const avgRelevance    = avg("answer_relevance");
  const avgPrecision    = avg("context_precision");
  const positiveCount   = feedback.positive;
  const negativeCount   = feedback.negative;

  const lowScoring = metrics.filter(m =>
    (m.faithfulness !== null && m.faithfulness < 0.6) ||
    (m.answer_relevance !== null && m.answer_relevance < 0.6) ||
    (m.context_precision !== null && m.context_precision < 0.6)
  );

  const avgValues = { faithfulness: avgFaithfulness, answer_relevance: avgRelevance, context_precision: avgPrecision };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 49,
          background: "rgba(15,23,42,0.3)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: "#f8fafc",
        boxShadow: "-16px 0 60px rgba(0,0,0,0.1)",
        zIndex: 50,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex", flexDirection: "column",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
      }}>

        {/* Header */}
        <div style={{
          height: 64, background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg,#12b8cd,#3bb978)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff"
            }}><BarChart2 size={16} strokeWidth={2.5} /></div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: 0 }}>RAG Evaluation</h2>
            <button
              onClick={fetchMetrics}
              disabled={loading}
              title="Refresh metrics"
              style={{
                background: "#f1f5f9", border: "none", cursor: loading ? "not-allowed" : "pointer",
                padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#64748b",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {loading ? "…" : "↻ Refresh"}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
            {docId ? "Document view" : workspaceId ? "Workspace view" : "Global"}
          </p>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", cursor: "pointer",
            width: 32, height: 32, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#64748b", fontSize: 18, lineHeight: 1
          }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 20px", gap: 0, flexShrink: 0
        }}>
          {["overview", "details"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px 16px", borderRadius: 0, border: "none",
              background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              color: tab === t ? "#12b8cd" : "#94a3b8",
              borderBottom: tab === t ? "2px solid #12b8cd" : "2px solid transparent",
              textTransform: "capitalize", transition: "all 0.2s"
            }}>
              {t === "overview" ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14}/> Overview</span> : <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Search size={14}/> Details</span>}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSynthetic}
            disabled={generating || !docId}
            style={{
              width: "100%", padding: "12px 20px", borderRadius: 14,
              background: genSuccess ? "#3bb978" : docId ? "linear-gradient(135deg,#12b8cd,#0ea5c6)" : "#e2e8f0",
              color: docId ? "#fff" : "#94a3b8",
              border: "none", fontWeight: 700, fontSize: 13, cursor: docId ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: docId ? "0 4px 16px rgba(18,184,205,0.25)" : "none",
              transition: "all 0.3s"
            }}
          >
            {generating ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Generating testset…
              </>
            ) : genSuccess ? (
              <> <Check size={16} /> Downloaded! </>
            ) : (
              <> <FlaskConical size={16} /> Generate Synthetic Testset </>
            )}
          </button>
          {!docId && (
            <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: -8 }}>
              Select a single document to generate a testset
            </p>
          )}

          {loading ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 40 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#12b8cd", animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Loading metrics…</p>
            </div>
          ) : tab === "overview" ? (
            <>
              {/* Aggregate Scores */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                  Performance Snapshot • {metrics.length} evals
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {METRICS.map(m => (
                    <MetricBar key={m.key} label={m.label} color={m.color} icon={m.icon} value={avgValues[m.key]} />
                  ))}
                </div>
              </div>

              {/* User Sentiment */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                  User Feedback
                </h3>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "12px 0", background: "#f0fdf4", borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><ThumbsUp size={22} color="#3bb978" /></div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#3bb978" }}>{positiveCount}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Positive</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: "12px 0", background: "#fef2f2", borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><ThumbsDown size={22} color="#ef4444" /></div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{negativeCount}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Negative</div>
                  </div>
                </div>
                {feedback.total > 0 && (
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${Math.round(positiveCount / feedback.total * 100)}%`, background: "#3bb978", transition: "width 0.8s ease" }} />
                    <div style={{ flex: 1, background: "#fca5a5" }} />
                  </div>
                )}
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{feedback.total} total ratings</p>
              </div>

              {/* Low Scoring Alert */}
              {lowScoring.length > 0 && (
                <div style={{ background: "#fef2f2", borderRadius: 16, padding: 16, border: "1px solid rgba(239,68,68,0.12)" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={14} /> {lowScoring.length} interaction{lowScoring.length > 1 ? "s" : ""} pulling scores down
                  </p>
                  <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                    Switch to <strong>Details</strong> tab to see which ones and what metrics are failing.
                  </p>
                </div>
              )}

              {metrics.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <FlaskConical size={36} color="#cbd5e1" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: 0 }}>No evaluations yet</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                    Chat with documents, give thumbs up/down ratings, and run evaluations to see data here.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Details Tab */
            <>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                All Evaluations ({metrics.length})
              </h3>
              {metrics.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>No evaluation records yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {metrics.map((m, i) => {
                    const worstMetric = METRICS.reduce((worst, metric) => {
                      const val = m[metric.key] || 0;
                      return val < (m[worst?.key] || 1) ? metric : worst;
                    }, METRICS[0]);
                    const isLow = METRICS.some(metric => (m[metric.key] || 0) < 0.6);

                    return (
                      <div key={i} style={{
                        background: "#fff", borderRadius: 12, padding: "14px 16px",
                        border: isLow ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Eval #{i + 1}</p>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {m.user_feedback === "1" && <span style={{ display: "flex" }}><ThumbsUp size={14} color="#3bb978" /></span>}
                            {m.user_feedback === "-1" && <span style={{ display: "flex" }}><ThumbsDown size={14} color="#ef4444" /></span>}
                            {isLow && <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", background: "#fef2f2", padding: "2px 6px", borderRadius: 99 }}>Low Score</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {METRICS.map(metric => (
                            <MetricBar
                              key={metric.key}
                              label={metric.label}
                              color={metric.color}
                              icon={metric.icon}
                              value={m[metric.key] || 0}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    </>
  );
}
