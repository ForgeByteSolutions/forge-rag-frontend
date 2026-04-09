import React, { useState, useEffect, useCallback } from "react";
import { runManualEvaluation, getEvaluationMetrics, generateSyntheticData } from "@/lib/api";
import { X, Play, Beaker, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";

export default function EvaluationSidePanel({ open, onClose, docId, workspaceId }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvaluationMetrics({ doc_id: docId, workspace_id: workspaceId });
      setMetrics(data?.metrics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [docId, workspaceId]);

  useEffect(() => {
    if (open) {
      fetchMetrics();
      const timer = setInterval(fetchMetrics, 10000);
      return () => clearInterval(timer);
    }
  }, [open, docId, workspaceId, fetchMetrics]);

  const handleRunEval = async (messageId) => {
    setEvaluating(true);
    try {
      await runManualEvaluation(messageId);
      await fetchMetrics();
    } catch (err) {
      alert("Failed to run evaluation.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleGenerateSynthetic = async () => {
    if (!docId) return alert("Must select a single document first.");
    setGenerating(true);
    try {
      const data = await generateSyntheticData(docId, 5);
      
      // We download it directly as a JSON file to the user
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `synthetic_testset_${docId.substring(0, 5)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate testset. Needs at least 100 words in the document.");
    } finally {
      setGenerating(false);
    }
  };

  // Average over non-null values only
  function avg(key) {
    const vals = metrics.map(m => m[key]).filter(v => v !== null && v !== undefined);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  const avgFaithfulness = avg("faithfulness");
  const avgRelevance    = avg("answer_relevance");
  const avgPrecision    = avg("context_precision");

  const fmtScore = (v) => v !== null && v !== undefined ? `${(v * 10).toFixed(1)} / 10` : "N/A";
  const fmtPct   = (v) => v !== null && v !== undefined ? Math.min(v * 100, 100) : 0;

  return (
    <div
      style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 400,
        background: "#fff", borderLeft: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.05)", zIndex: 50,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex", flexDirection: "column"
      }}
    >
      {/* Header */}
      <div style={{ height: 60, borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>RAG Evaluation</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto", background: "#f8fafc" }}>
        
        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            onClick={handleGenerateSynthetic}
            disabled={generating}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, background: "#12b8cd", color: "#fff",
              border: "none", fontWeight: 700, fontSize: 13, cursor: generating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 10px rgba(18,184,205,0.2)"
            }}
          >
            {generating ? <div style={{width:16,height:16,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"wsp-spin 1s linear infinite"}}/> : <FileSpreadsheet size={16} />}
            {generating ? "Generating..." : "Generate Synthetic"}
          </button>
        </div>

        {/* Aggregated Scores */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Performance Snapshot</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Faithfulness", val: avgFaithfulness, color: "#3bb978" },
              { label: "Answer Relevance", val: avgRelevance, color: "#3b82f6" },
              { label: "Context Precision", val: avgPrecision, color: "#8b5cf6" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: m.val !== null ? m.color : "#cbd5e1" }}>
                    {fmtScore(m.val)}
                  </span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${fmtPct(m.val)}%`, background: m.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation History */}
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Evaluation History</h3>
        
        {loading ? (
          <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 20 }}>Loading metrics...</p>
        ) : metrics.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px", background: "#fff", borderRadius: 16 }}>
            <Beaker size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b", margin: 0 }}>No evaluations yet</p>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Interact with the chat and trigger an evaluation.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Message #{m.message_id}</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#3bb978" }}>F: {m.faithfulness !== null ? m.faithfulness?.toFixed(2) : "N/A"}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6" }}>R: {m.answer_relevance !== null ? m.answer_relevance?.toFixed(2) : "N/A"}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#8b5cf6" }}>P: {m.context_precision !== null ? m.context_precision?.toFixed(2) : "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
