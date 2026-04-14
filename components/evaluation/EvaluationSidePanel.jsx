"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BarChart2, TrendingUp, Search, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import { getEvaluationMetrics, generateSyntheticData, runTestsetEvaluation } from "@/lib/api";

import GenerateTestsetCard from "./GenerateTestsetCard";
import RunTestsetCard      from "./RunTestsetCard";
import OverviewTab         from "./OverviewTab";
import DetailsTab          from "./DetailsTab";

/**
 * EvaluationSidePanel
 * ====================
 * Slide-in panel showing RAG quality metrics.
 * State + handlers live here; all rendering is delegated to sub-components.
 */
export default function EvaluationSidePanel({ open, onClose, docId, workspaceId }) {
  // ── Metrics state ─────────────────────────────────────────────────────────
  const [metrics,  setMetrics]  = useState([]);
  const [feedback, setFeedback] = useState({ positive: 0, negative: 0, total: 0 });
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState("overview");

  // ── Generate testset state ────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);

  // ── Run testset state ─────────────────────────────────────────────────────
  const [testsetFile,     setTestsetFile]     = useState(null);
  const [testsetRunning,  setTestsetRunning]  = useState(false);
  const [testsetProgress, setTestsetProgress] = useState(null);
  const [testsetDone,     setTestsetDone]     = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvaluationMetrics({ doc_id: docId, workspace_id: workspaceId });
      const m = data?.metrics || [];
      setMetrics(m);
      setFeedback(data?.feedback || { positive: 0, negative: 0, total: 0 });
      return m.length;   // ← callers can use this to detect completion
    } catch (err) {
      console.error(err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [docId, workspaceId]);

  useEffect(() => {
    if (open) {
      setTab("overview");
      fetchMetrics();
      const timer = setInterval(fetchMetrics, 10000);
      return () => clearInterval(timer);
    }
  }, [open, docId, workspaceId, fetchMetrics]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGenerateSynthetic = async () => {
    if (!docId) return toast.error("Please select a single document first.");
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
      toast.error("Failed to generate testset. Document needs at least 100 words.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRunTestset = async () => {
    if (!testsetFile) return;
    try {
      const raw  = JSON.parse(await testsetFile.text());
      const rows = Array.isArray(raw) ? raw : (raw.data ?? []);
      if (!rows.length) {
        toast.error('testset.json has no rows. Expected a "data" array or a root array.');
        return;
      }

      // Snapshot current count so we know when all new rows have landed
      const preCount = await fetchMetrics();

      setTestsetRunning(true);
      setTestsetDone(false);
      setTestsetProgress({ total: rows.length });
      await runTestsetEvaluation({ doc_id: docId, workspace_id: workspaceId, rows });

      // Poll every 5s; stop as soon as new count ≥ preCount + rows.length
      let polls = 0;
      const maxPolls = 120; // 10 min hard cap
      const pollId = setInterval(async () => {
        polls++;
        const newCount = await fetchMetrics();
        const finished = newCount >= preCount + rows.length;
        if (finished || polls >= maxPolls) {
          clearInterval(pollId);
          setTestsetRunning(false);
          setTestsetDone(true);
          setTimeout(() => setTestsetDone(false), 4000);
        }
      }, 5000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit testset: " + (err?.response?.data?.detail ?? err.message));
      setTestsetRunning(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  function avg(key) {
    const vals = metrics.map(m => m[key]).filter(v => v !== null && v !== undefined);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  const avgValues = {
    faithfulness:      avg("faithfulness"),
    answer_relevance:  avg("answer_relevance"),
    context_precision: avg("context_precision"),
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[49] bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 bottom-0 w-[420px] bg-slate-50 z-50 flex flex-col border-l border-black/[0.06] shadow-[-16px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>

        {/* Header */}
        <div className="h-16 bg-white border-b border-black/[0.06] flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white">
              <BarChart2 size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">RAG Evaluation</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              title="Refresh metrics"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              {loading ? "…" : "Refresh"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-black/[0.06] px-5 shrink-0">
          {["overview", "details"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                tab === t
                  ? "text-cyan-500 border-cyan-500"
                  : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
            >
              {t === "overview"
                ? <><TrendingUp size={13} /> Overview</>
                : <><Search size={13} /> Details</>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Testset tools — always visible regardless of tab */}
          <GenerateTestsetCard
            docId={docId}
            generating={generating}
            genSuccess={genSuccess}
            onGenerate={handleGenerateSynthetic}
          />
          <RunTestsetCard
            testsetFile={testsetFile}
            testsetRunning={testsetRunning}
            testsetDone={testsetDone}
            testsetProgress={testsetProgress}
            onFileChange={setTestsetFile}
            onClearFile={() => setTestsetFile(null)}
            onRun={handleRunTestset}
          />

          {/* Tab content */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center pt-10">
              <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin mb-3" />
              <p className="text-sm text-slate-400">Loading metrics…</p>
            </div>
          ) : tab === "overview" ? (
            <OverviewTab metrics={metrics} feedback={feedback} avgValues={avgValues} />
          ) : (
            <DetailsTab metrics={metrics} />
          )}

        </div>
      </div>
    </>
  );
}
