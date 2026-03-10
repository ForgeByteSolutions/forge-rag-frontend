"use client";

import "@/styles/workspace.css";

export default function ContractPromptModal({ contractPrompt, onChat, onRisk }) {
    if (!contractPrompt) return null;

    return (
        <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            background: "rgba(247,248,250,.97)", backdropFilter: "blur(6px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
            padding: 32, animation: "wsp-fade .4s ease",
        }}>
            {/* Glow icon */}
            <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: "linear-gradient(135deg,rgba(18,184,205,.15),rgba(18,184,205,.30))",
                border: "1.5px solid rgba(18,184,205,.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "wsp-float 3.5s ease-in-out infinite",
            }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>

            {/* Text */}
            <div style={{ textAlign: "center" }}>
                <p className="wsp-syne" style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
                    Contract Detected
                </p>
                <p className="wsp-dm" style={{ fontSize: 13, color: "#6b7280", maxWidth: 320 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{contractPrompt.docName}</span> was identified as a legal contract. What would you like to do?
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 14 }}>
                <button
                    onClick={onChat}
                    style={{
                        padding: "12px 28px", borderRadius: 12,
                        border: "1.5px solid rgba(0,0,0,.12)", background: "#fff",
                        fontSize: 14, fontWeight: 700, color: "#374151", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8,
                    }}>💬 Chat
                </button>
                <button
                    onClick={() => onRisk(contractPrompt)}
                    style={{
                        padding: "12px 28px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg,#12b8cd,#3bb978)",
                        fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 4px 14px rgba(18,184,205,.35)",
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Risk Analysis
                </button>
            </div>
        </div>
    );
}
