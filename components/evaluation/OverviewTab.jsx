"use client";

import { ThumbsUp, ThumbsDown, AlertTriangle, FlaskConical } from "lucide-react";
import MetricBar, { METRICS } from "./MetricBar";

/**
 * Overview tab — performance snapshot, user feedback bar, and low-scoring alert.
 */
export default function OverviewTab({ metrics, feedback, avgValues }) {
  const lowScoring = metrics.filter(m =>
    (m.faithfulness     !== null && m.faithfulness     < 0.6) ||
    (m.answer_relevance !== null && m.answer_relevance < 0.6) ||
    (m.context_precision !== null && m.context_precision < 0.6)
  );

  return (
    <>
      {/* Performance Snapshot */}
      <div className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-sm">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Performance Snapshot • {metrics.length} evals
        </h3>
        <div className="flex flex-col gap-3.5">
          {METRICS.map(({ key, ...rest }) => (
            <MetricBar key={key} {...rest} value={avgValues[key]} />
          ))}
        </div>
      </div>

      {/* User Feedback */}
      <div className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-sm">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">
          User Feedback
        </h3>
        <div className="flex gap-4 mb-3">
          <div className="flex-1 flex flex-col items-center py-3 bg-emerald-50 rounded-xl">
            <ThumbsUp size={22} className="text-emerald-500 mb-1" />
            <div className="text-lg font-black text-emerald-500">{feedback.positive}</div>
            <div className="text-[10px] text-slate-500">Positive</div>
          </div>
          <div className="flex-1 flex flex-col items-center py-3 bg-red-50 rounded-xl">
            <ThumbsDown size={22} className="text-red-500 mb-1" />
            <div className="text-lg font-black text-red-500">{feedback.negative}</div>
            <div className="text-[10px] text-slate-500">Negative</div>
          </div>
        </div>
        {feedback.total > 0 && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.round(feedback.positive / feedback.total * 100)}%` }}
            />
            <div className="flex-1 bg-red-300" />
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1.5">{feedback.total} total ratings</p>
      </div>

      {/* Low Scoring Alert */}
      {lowScoring.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-500/[0.12]">
          <p className="text-xs font-bold text-red-500 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle size={13} />
            {lowScoring.length} interaction{lowScoring.length > 1 ? "s" : ""} pulling scores down
          </p>
          <p className="text-[11px] text-slate-500">
            Switch to <strong>Details</strong> tab to see which ones and what metrics are failing.
          </p>
        </div>
      )}

      {/* Empty State */}
      {metrics.length === 0 && (
        <div className="text-center py-10 px-5 bg-white rounded-2xl">
          <div className="flex justify-center mb-3">
            <FlaskConical size={36} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-700">No evaluations yet</p>
          <p className="text-xs text-slate-400 mt-1.5">
            Chat with documents, give ratings, and run evaluations to see data here.
          </p>
        </div>
      )}
    </>
  );
}
