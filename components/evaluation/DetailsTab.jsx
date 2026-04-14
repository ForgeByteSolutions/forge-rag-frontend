"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import MetricBar, { METRICS } from "./MetricBar";

/**
 * Details tab — paginated list of all individual evaluation records.
 */
export default function DetailsTab({ metrics }) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-slate-400">No evaluation records yet.</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        All Evaluations ({metrics.length})
      </h3>

      <div className="flex flex-col gap-2.5">
        {metrics.map((m, i) => {
          const isLow = METRICS.some(metric => m[metric.key] !== null && m[metric.key] < 0.6);
          return (
            <div
              key={i}
              className={`bg-white rounded-xl px-4 py-3.5 shadow-sm border ${
                isLow ? "border-red-500/[0.15]" : "border-black/[0.05]"
              }`}
            >
              {/* Row header */}
              <div className="flex justify-between items-center mb-2.5">
                <p className="text-[11px] text-slate-400">Eval #{i + 1}</p>
                <div className="flex gap-1.5 items-center">
                  {m.user_feedback === "1"  && <ThumbsUp   size={13} className="text-emerald-500" />}
                  {m.user_feedback === "-1" && <ThumbsDown  size={13} className="text-red-500" />}
                  {isLow && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                      Low Score
                    </span>
                  )}
                </div>
              </div>

              {/* Metric bars */}
              <div className="flex flex-col gap-2">
                {METRICS.map(({ key, ...rest }) => (
                  <MetricBar key={key} {...rest} value={m[key] ?? null} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
