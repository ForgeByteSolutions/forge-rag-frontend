"use client";

import "@/styles/chatThemes.css";
import { useRouter } from "next/navigation";

export default function ChatHeader({
    selectedDocName,
    isCitationActive,
    model,
    setModel,
    activeTheme,
    onOpenThemes,
    onSwitchToRisk,
    selectedDocId,
    onOpenEval,
}) {
    const router = useRouter();
    return (
        <div style={{
            height: 52,
            borderBottom: "1px solid rgba(0,0,0,.07)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px 0 60px",
            flexShrink: 0,
            background: activeTheme ? "rgba(255,255,255,0.75)" : "#fff",
            backdropFilter: activeTheme ? "blur(1px)" : "none",
            position: "relative", zIndex: 2,
            gap: 12,
        }}>
            {/* Left: logo + doc name */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                height: "100%",
                paddingTop: 4 // Subtle shift downwards to line up with buttons
            }}>
                {isCitationActive ? (
                    <p className="wsp-syne" style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>📖 Citation View</p>
                ) : (
                    <p className="wsp-dm" style={{
                        fontSize: 16,
                        fontWeight: 650,
                        color: "#334155",
                        margin: 0,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap"
                    }}>FORGEBYTE CHAT</p>
                )}
                {selectedDocName && !isCitationActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                        <p style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#64748b",
                            margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: 220,
                        }}>
                            {selectedDocName}
                        </p>
                    </div>
                )}
            </div>

            {/* Right: controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                {/* Themes button (Compact) */}
                <button
                    onClick={onOpenThemes}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: 18, padding: 4, borderRadius: 6, display: 'flex', transition: 'background 0.2s'
                    }}
                    title="Change Background"
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    🎨
                </button>

                <div style={{ width: 1, height: 18, background: "rgba(0,0,0,.08)" }} />

                {/* Dashboard button (Workspace Style) */}
                <button
                    onClick={() => router.push("/dashboard")}
                    style={{
                        padding: "5px 14px", borderRadius: 8, border: "1.5px solid rgba(18,184,205,0.2)", cursor: "pointer",
                        fontSize: 12, fontWeight: 700,
                        background: "#fff",
                        color: "#12b8cd",
                        transition: "all .2s",
                        fontFamily: "var(--font-syne), sans-serif"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(18,184,205,0.05)";
                        e.currentTarget.style.borderColor = "rgba(18,184,205,0.4)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.borderColor = "rgba(18,184,205,0.2)";
                    }}
                >
                    Dashboard
                </button>

                <div style={{ width: 1, height: 22, background: "rgba(0,0,0,.08)" }} />

                {/* Risk Analysis button */}
                {selectedDocId && onSwitchToRisk && (
                    <button
                        onClick={onSwitchToRisk}
                        style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "6px 13px",
                            background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                            color: "#065f46",
                            border: "1.5px solid #6ee7b780",
                            borderRadius: 9,
                            fontSize: 12, fontWeight: 700,
                            letterSpacing: ".02em",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all .15s",
                            boxShadow: "0 1px 4px rgba(18,184,205,.12)",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "linear-gradient(135deg,#d1fae5,#a7f3d0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(18,184,205,.25)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "linear-gradient(135deg,#ecfdf5,#d1fae5)";
                            e.currentTarget.style.boxShadow = "0 1px 4px rgba(18,184,205,.12)";
                            e.currentTarget.style.transform = "";
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Risk Analysis
                    </button>
                )}

                {/* Evals button */}
                {selectedDocId && (
                    <>
                        <div style={{ width: 1, height: 22, background: "rgba(0,0,0,.08)" }} />
                        <button
                            onClick={onOpenEval}
                            style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "6px 13px",
                                background: "#f0f9ff",
                                color: "#0369a1",
                                border: "1.5px solid rgba(18,184,205,0.3)",
                                borderRadius: 9,
                                fontSize: 12, fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                transition: "all .15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(18,184,205,0.1)";
                                e.currentTarget.style.borderColor = "rgba(18,184,205,0.5)";
                                e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "#f0f9ff";
                                e.currentTarget.style.borderColor = "rgba(18,184,205,0.3)";
                                e.currentTarget.style.transform = "";
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                            Evals
                        </button>
                    </>
                )}

                <div style={{ width: 1, height: 22, background: "rgba(0,0,0,.08)" }} />

                {/* Model selector */}
                <div style={{ position: "relative" }}>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        style={{
                            appearance: "none",
                            padding: "6px 28px 6px 10px",
                            fontSize: 12, fontWeight: 600,
                            color: "#374151",
                            background: "#f8fafc",
                            border: "1.5px solid rgba(0,0,0,.1)",
                            borderRadius: 9,
                            cursor: "pointer",
                            outline: "none",
                            transition: "border-color .15s",
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#12b8cd"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,.1)"; }}
                    >
                        <option value="meta-llama/Llama-3.3-70B-Instruct">Llama 3.3 70B (Free)</option>
                        <option value="gpt-4o-mini">GPT-4o Mini (Paid)</option>
                    </select>
                    <svg style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
