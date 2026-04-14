"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { getEvaluationMetrics } from "@/lib/api";
import { AlertTriangle, ThumbsUp, ThumbsDown, FlaskConical } from "lucide-react";

const METRICS = [
  { key: "faithfulness",      label: "Faithfulness",      color: "#3bb978" },
  { key: "answer_relevance",  label: "Answer Relevance",  color: "#12b8cd" },
  { key: "context_precision", label: "Context Precision", color: "#8b5cf6" },
];

function ScoreGauge({ label, value, color }) {
  const isNull = value === null || value === undefined;
  const pct    = isNull ? 0 : Math.min(value * 100, 100);
  const score  = isNull ? null : (value * 10).toFixed(1);
  const status = isNull ? "No Data"
    : value >= 0.8 ? "Excellent"
    : value >= 0.6 ? "Good"
    : value > 0    ? "Needs Work"
    : "No Data";
  const statusBg = isNull     ? "bg-slate-100 text-slate-400"
    : value >= 0.8             ? "bg-emerald-50 text-emerald-600"
    : value >= 0.6             ? "bg-amber-50 text-amber-600"
    : value > 0                ? "bg-red-50 text-red-500"
    : "bg-slate-100 text-slate-400";

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-sm flex-1 min-w-[130px]">
      <div className="flex justify-between items-start mb-3.5">
        <span className="text-[13px] font-semibold text-slate-500">{label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBg}`}>{status}</span>
      </div>
      <div className="text-3xl font-black text-slate-800 mb-2.5 leading-none">
        {isNull || value === 0 ? <span className="text-slate-300">—</span> : score}
        <span className="text-sm font-medium text-slate-400 ml-1">/10</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function FeedbackBar({ positive, negative }) {
  const total  = positive + negative;
  const posPct = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negPct = total > 0 ? 100 - posPct : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-sm">
      <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">User Sentiment</div>
      <div className="flex gap-6 mb-3.5">
        <div className="text-center">
          <div className="flex items-center gap-2 text-2xl font-black text-emerald-500">
            <ThumbsUp size={22} /> {posPct}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{positive} positive</div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-2xl font-black text-red-500">
            <ThumbsDown size={22} /> {negPct}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{negative} negative</div>
        </div>
      </div>
      {total > 0 ? (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${posPct}%` }} />
          <div className="bg-red-400 transition-all duration-1000" style={{ width: `${negPct}%` }} />
        </div>
      ) : (
        <div className="h-2 bg-slate-100 rounded-full" />
      )}
      <div className="text-[11px] text-slate-400 mt-2">{total} total ratings</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-[11px] text-slate-400 mb-1.5">Message #{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-[13px] font-bold my-0.5" style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function EvaluationDashboard() {
  const [metrics,        setMetrics]        = useState([]);
  const [feedbackCounts, setFeedbackCounts] = useState({ positive: 0, negative: 0, total: 0 });
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    getEvaluationMetrics()
      .then(data => {
        setMetrics(data?.metrics  || []);
        setFeedbackCounts(data?.feedback || { positive: 0, negative: 0, total: 0 });
      })
      .catch(() => setMetrics([]))
      .finally(() => setLoading(false));
  }, []);

  function avg(key) {
    const vals = metrics.map(m => m[key]).filter(v => v !== null && v !== undefined);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const avgFaithfulness = avg("faithfulness");
  const avgRelevance    = avg("answer_relevance");
  const avgPrecision    = avg("context_precision");
  const positiveCount   = feedbackCounts.positive;
  const negativeCount   = feedbackCounts.negative;

  const chartData = metrics.slice(-20).map((m, i) => ({
    name:         i + 1,
    Faithfulness: parseFloat((m.faithfulness    ?? 0).toFixed(2)),
    Relevance:    parseFloat((m.answer_relevance ?? 0).toFixed(2)),
    Precision:    parseFloat((m.context_precision ?? 0).toFixed(2)),
  }));

  const worstPerformers = metrics.filter(m =>
    (m.faithfulness    !== null && m.faithfulness    < 0.6) ||
    (m.answer_relevance !== null && m.answer_relevance < 0.6) ||
    (m.context_precision !== null && m.context_precision < 0.6)
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-9 h-9 rounded-full border-[3px] border-slate-200 border-t-cyan-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading evaluation metrics…</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">RAG Quality Metrics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Aggregate performance trends across all documents and workspaces.
          {metrics.length > 0 && (
            <span className="text-cyan-500 font-semibold"> {metrics.length} evaluations recorded.</span>
          )}
        </p>
      </div>

      {/* Score Gauges */}
      <div className="flex gap-4 mb-5 flex-wrap">
        <ScoreGauge label="Faithfulness"      value={avgFaithfulness} color="#3bb978" />
        <ScoreGauge label="Answer Relevance"  value={avgRelevance}    color="#12b8cd" />
        <ScoreGauge label="Context Precision" value={avgPrecision}    color="#8b5cf6" />
      </div>

      {/* Feedback Bar */}
      <div className="mb-6">
        <FeedbackBar positive={positiveCount} negative={negativeCount} />
      </div>

      {/* Trends Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-sm mb-6">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-5">
            Performance Trends (last {chartData.length} evals)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                {[["faith","#3bb978"],["rel","#12b8cd"],["prec","#8b5cf6"]].map(([id, color]) => (
                  <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              <Area type="monotone" dataKey="Faithfulness" stroke="#3bb978" fill="url(#g-faith)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Relevance"    stroke="#12b8cd" fill="url(#g-rel)"   strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Precision"    stroke="#8b5cf6" fill="url(#g-prec)"  strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Worst Performers */}
      {worstPerformers.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-red-500/[0.12] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="text-[13px] font-bold text-red-500 uppercase tracking-widest">
              Low-Scoring Interactions
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            These interactions are pulling your scores down. Consider reviewing source documents or retrieval configuration.
          </p>
          <div className="flex flex-col gap-2.5">
            {worstPerformers.map((m, i) => (
              <div
                key={i}
                className="bg-red-50 rounded-xl px-4 py-3 border border-red-500/[0.08] flex justify-between items-center"
              >
                <div>
                  <p className="text-[11px] text-slate-400 mb-0.5">
                    {m.doc_id
                      ? `Doc: ${m.doc_id.substring(0, 8)}…`
                      : m.workspace_id
                      ? `Workspace: ${m.workspace_id.substring(0, 8)}…`
                      : "Global"}
                  </p>
                  <p className="text-xs text-slate-700 font-medium">Message #{i + 1}</p>
                </div>
                <div className="flex gap-3">
                  {METRICS.map(metric => {
                    const val = m[metric.key] ?? null;
                    const bad = val !== null && val < 0.6;
                    return (
                      <div key={metric.key} className="text-center">
                        <div className={`text-[13px] font-black ${bad ? "text-red-500" : "text-slate-600"}`}>
                          {val !== null ? val.toFixed(2) : "N/A"}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase">
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

      {/* Empty State */}
      {metrics.length === 0 && (
        <div className="text-center py-12 px-5 bg-white rounded-2xl border border-black/[0.05]">
          <div className="flex justify-center mb-3">
            <FlaskConical size={40} className="text-slate-300" />
          </div>
          <p className="text-[15px] font-bold text-slate-700">No evaluations yet</p>
          <p className="text-[13px] text-slate-400 mt-2">
            Open a workspace, ask questions, then click <strong>Evals</strong> to run your first evaluation.
          </p>
        </div>
      )}
    </div>
  );
}
