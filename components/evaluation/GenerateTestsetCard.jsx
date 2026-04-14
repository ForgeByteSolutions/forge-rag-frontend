"use client";

import { FlaskConical, Check } from "lucide-react";

/**
 * Cyan "Generate Synthetic Testset" button.
 * Downloads a testset.json when clicked.
 */
export default function GenerateTestsetCard({ docId, generating, genSuccess, onGenerate }) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={onGenerate}
        disabled={generating || !docId}
        className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold transition-all duration-300 ${
          genSuccess
            ? "bg-emerald-500 text-white"
            : docId
            ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_4px_16px_rgba(18,184,205,0.25)] hover:shadow-[0_6px_20px_rgba(18,184,205,0.35)] hover:-translate-y-px"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {generating ? (
          <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating testset…</>
        ) : genSuccess ? (
          <><Check size={15} /> Downloaded!</>
        ) : (
          <><FlaskConical size={15} /> Generate Synthetic Testset</>
        )}
      </button>

      {!docId && (
        <p className="text-[11px] text-slate-400 text-center">
          Select a single document to generate a testset
        </p>
      )}
    </div>
  );
}
