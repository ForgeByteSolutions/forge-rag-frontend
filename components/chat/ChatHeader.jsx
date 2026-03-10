"use client";

import "@/styles/chatThemes.css";

export default function ChatHeader({
    selectedDocName,
    isCitationActive,
    model,
    setModel,
    activeTheme,
    onOpenThemes,
    onSwitchToRisk,
    selectedDocId,
}) {
    return (
        <div style={{
            height: 58,
            borderBottom: "1px solid rgba(0,0,0,.08)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: isCitationActive ? "0 20px" : "0 20px 0 62px",
            flexShrink: 0,
            background: activeTheme ? "rgba(255,255,255,0.75)" : "#fff",
            backdropFilter: activeTheme ? "blur(1px)" : "none",
            position: "relative", zIndex: 2,
            gap: 12,
        }}>
            {/* Left: logo + doc name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {!isCitationActive && (
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: "linear-gradient(135deg,#12b8cd,#3bb978)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </div>
                )}
                <div style={{ minWidth: 0 }}>
                    {!isCitationActive && (
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                            FORGE INTELLI OCR
                        </p>
                    )}
                    {selectedDocName && (
                        <p style={{
                            fontSize: isCitationActive ? 13 : 11,
                            fontWeight: isCitationActive ? 700 : 400,
                            color: isCitationActive ? "#0f172a" : "#94a3b8",
                            margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: isCitationActive ? 400 : 220,
                        }}>
                            {isCitationActive && "📖 "}
                            {selectedDocName}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {/* Themes button */}
                <button className="cb-themes-btn" onClick={onOpenThemes} title="Change chat background">
                    🎨 Themes
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
