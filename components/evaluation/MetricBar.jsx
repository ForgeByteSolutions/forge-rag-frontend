"use client";

import { Target, MessageCircle, FileSearch } from "lucide-react";

export const METRICS = [
  { key: "faithfulness",      label: "Faithfulness",      color: "text-emerald-500", bar: "bg-emerald-500", icon: <Target size={13} /> },
  { key: "answer_relevance",  label: "Answer Relevance",  color: "text-cyan-500",    bar: "bg-cyan-500",    icon: <MessageCircle size={13} /> },
  { key: "context_precision", label: "Context Precision", color: "text-violet-500",  bar: "bg-violet-500",  icon: <FileSearch size={13} /> },
];

export default function MetricBar({ label, color, bar, icon, value }) {
  const isNull = value === null || value === undefined;
  const pct    = isNull ? 0 : Math.min(value * 100, 100);
  const score  = isNull ? null : (value * 10).toFixed(1);
  const bad    = !isNull && value > 0 && value < 0.6;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className={`text-xs font-black ${isNull ? "text-slate-300" : bad ? "text-red-500" : value >= 0.8 ? color : "text-amber-500"}`}>
          {isNull ? "N/A" : value > 0 ? `${score}/10` : "—"}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bad ? "bg-red-500" : bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
