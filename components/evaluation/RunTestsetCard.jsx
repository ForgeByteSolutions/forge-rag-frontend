"use client";

import { useRef } from "react";
import { FlaskConical, Check, X } from "lucide-react";

/**
 * Card for uploading testset.json and running batch evaluation.
 * Handles its own file-input ref internally.
 */
export default function RunTestsetCard({
  testsetFile,
  testsetRunning,
  testsetDone,
  testsetProgress,
  onFileChange,
  onClearFile,
  onRun,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white rounded-2xl p-4 border border-black/[0.05] shadow-sm">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        Run Testset Evaluation
      </h3>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={e => {
          onFileChange(e.target.files?.[0] ?? null);
        }}
      />

      {/* File picker row */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={testsetRunning}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs font-semibold hover:border-cyan-400 hover:text-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate"
        >
          <FlaskConical size={13} />
          <span className="truncate">{testsetFile ? testsetFile.name : "Choose testset.json…"}</span>
        </button>

        {testsetFile && !testsetRunning && (
          <button
            onClick={() => {
              onClearFile();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={!testsetFile || testsetRunning}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
          testsetDone
            ? "bg-emerald-500 text-white"
            : testsetFile && !testsetRunning
            ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)] hover:-translate-y-px"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {testsetRunning ? (
          <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Evaluating in background…</>
        ) : testsetDone ? (
          <><Check size={15} /> Evaluation complete!</>
        ) : (
          <>▶ Run Evaluation {testsetProgress ? `(${testsetProgress.total} rows)` : ""}</>
        )}
      </button>

      {testsetRunning && (
        <p className="text-[11px] text-slate-400 text-center mt-2">
          Running {testsetProgress?.total} rows via RAG + Ragas. Metrics refresh every 5s.
        </p>
      )}
    </div>
  );
}
