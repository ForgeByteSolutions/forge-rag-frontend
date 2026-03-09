"use client";

// ─── Category Meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
    financial: { icon: "💰", label: "Financial", color: "#f43f5e", grad: "linear-gradient(135deg,#fff1f2,#ffe4e6)", border: "#fecdd388" },
    legal: { icon: "⚖️", label: "Legal", color: "#8b5cf6", grad: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "#ddd6fe88" },
    operational: { icon: "⚙️", label: "Operational", color: "#f59e0b", grad: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "#fde68a88" },
    compliance: { icon: "📋", label: "Compliance", color: "#0ea5e9", grad: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", border: "#bae6fd88" },
};
const catMeta = (cat = "") =>
    CATEGORY_META[cat.toLowerCase()] || { icon: "⚠️", label: cat, color: "#64748b", grad: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "#e2e8f088" };

// ─── Animated SVG Gauge ────────────────────────────────────────────────────────
function ScoreGauge({ score = 0, riskLevel = "Low" }) {
    const R = 75;
    const cx = 100, cy = 100;
    const circ = 2 * Math.PI * R;
    const filled = (score / 100) * circ;

    const color =
        riskLevel === "High" ? "#f43f5e" :
            riskLevel === "Medium" ? "#f59e0b" :
                "#10b981";

    const gradId = `gauge-grad-${Math.round(score)}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="1" />
                    </linearGradient>
                    <filter id="gaugeGlow" x="-25%" y="-25%" width="150%" height="150%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Track */}
                <circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    strokeLinecap="round"
                />

                {/* Filled arc */}
                <circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth="12"
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    filter="url(#gaugeGlow)"
                    style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
                />

                {/* Center score */}
                <text x={cx} y={cy - 2} textAnchor="middle" fontSize="42" fontWeight="800" fill="#1e293b"
                    style={{ fontFamily: "inherit" }}>
                    {score}
                </text>
                <text x={cx} y={cy + 24} textAnchor="middle" fontSize="11" fill="#94a3b8"
                    style={{ fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                    RISK INDEX
                </text>
            </svg>
        </div>
    );
}

// ─── Severity Bar ─────────────────────────────────────────────────────────────
function SeverityBar({ value = 0 }) {
    const pct = (value / 10) * 100;
    const color = value >= 7 ? "#f43f5e" : value >= 4 ? "#f59e0b" : "#10b981";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{
                    width: `${pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    borderRadius: 99,
                    transition: "width 1s cubic-bezier(.4,0,.2,1)",
                }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color, minWidth: 16, textAlign: "right" }}>{value}</span>
        </div>
    );
}

// ─── Info Card ────────────────────────────────────────────────────────────────
function InfoCard({ title, icon, data = {} }) {
    const entries = Object.entries(data).filter(([, v]) => v && v !== "Not specified" && v !== "N/A");
    if (!entries.length) return null;
    return (
        <div style={{
            border: "1px solid rgba(0,0,0,.04)",
            borderRadius: 24,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 4px 24px rgba(0,0,0,.02)",
        }}>
            <div style={{
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid rgba(0,0,0,.04)",
                display: "flex", alignItems: "center", gap: 10
            }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {title}
                </span>
            </div>
            <div style={{
                padding: "20px",
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px"
            }}>
                {entries.map(([k, v]) => (
                    <div key={k} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 10, lastChild: { border: "none" } }}>
                        <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4, fontWeight: 800, letterSpacing: ".05em" }}>
                            {k.replace(/_/g, " ")}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", lineHeight: 1.4 }}>{String(v)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Risk Card ────────────────────────────────────────────────────────────────
function RiskCard({ risk }) {
    const meta = catMeta(risk.category);
    return (
        <div style={{
            border: `1px solid ${meta.border}`,
            borderRadius: 24,
            padding: "20px",
            background: "#fff",
            display: "flex", flexDirection: "column", gap: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,.01)",
            transition: "all .3s ease",
            position: "relative",
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.04)"; e.currentTarget.style.borderColor = meta.color + "44"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = meta.border; }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: meta.grad, color: meta.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                    }}>
                        {meta.icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, textTransform: "uppercase", letterSpacing: ".08em" }}>
                        {meta.label}
                    </span>
                </div>
                <div style={{
                    fontSize: 10, fontWeight: 800, color: meta.color,
                    background: meta.grad, padding: "4px 10px", borderRadius: 8,
                }}>
                    SEVERITY {risk.severity}
                </div>
            </div>

            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, fontWeight: 500 }}>{risk.reason}</p>

            <SeverityBar value={risk.severity} />

            {risk.exact_text && (
                <details style={{ marginTop: 4 }}>
                    <summary style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, cursor: "pointer", userSelect: "none" }}>
                        View Clause
                    </summary>
                    <div style={{
                        margin: "10px 0 0",
                        padding: "12px 16px",
                        borderLeft: `2px solid ${meta.color}`,
                        background: "#f8fafc",
                        borderRadius: "0 12px 12px 0",
                        fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.6,
                    }}>
                        "{risk.exact_text}"
                    </div>
                </details>
            )}
        </div>
    );
}

// ─── Main RiskPanel ─────────────────────────────────────────────────────────
export default function RiskPanel({ analysis, docName }) {
    if (!analysis) return null;

    const {
        is_contract, risk_score = 0, risk_level = "Low",
        commercial = {}, legal = {}, dates = {}, risks = [],
    } = analysis;

    const levelColor =
        risk_level === "High" ? "#f43f5e" :
            risk_level === "Medium" ? "#f59e0b" :
                "#10b981";

    const levelGrad =
        risk_level === "High" ? "linear-gradient(135deg,#fef2f2,#fee2e2)" :
            risk_level === "Medium" ? "linear-gradient(135deg,#fffbeb,#fef3c7)" :
                "linear-gradient(135deg,#f0fdf4,#dcfce7)";

    return (
        <div style={{
            display: "flex", flexDirection: "column", gap: 24, padding: "24px",
            fontFamily: "inherit", maxWidth: "100%",
        }}>
            {/* ── Banner ── */}
            <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                background: is_contract ? "linear-gradient(135deg,#f0fdfa,#ccfbf1)" : "#f8fafc",
                border: is_contract ? "1px solid #5eead4" : "1px solid #e2e8f0",
                borderRadius: 24, boxShadow: is_contract ? "0 4px 20px rgba(20,184,166,0.08)" : "none",
            }}>
                <div style={{ fontSize: 22 }}>{is_contract ? "⚖️" : "📄"}</div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: is_contract ? "#0f766e" : "#475569" }}>
                        {is_contract ? "Contract Document Detected" : "General Document"}
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>{docName}</p>
                </div>
            </div>

            {/* ── Score Hero ── */}
            {is_contract && (
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 24, padding: "32px", background: "#fff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 32, boxShadow: "0 12px 40px rgba(0,0,0,0.03)", alignItems: "center"
                }}>
                    <ScoreGauge score={risk_score} riskLevel={risk_level} />

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{
                            padding: "20px 24px", borderRadius: 20, background: levelGrad,
                            border: `1.5px solid ${levelColor}15`,
                        }}>
                            <p style={{ fontSize: 10, color: levelColor, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 800, marginBottom: 4 }}>
                                Criticality Level
                            </p>
                            <p style={{ fontSize: 32, fontWeight: 900, color: levelColor, lineHeight: 1 }}>{risk_level}</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ padding: "16px", borderRadius: 16, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                                <p style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, marginBottom: 4 }}>Score</p>
                                <p style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{risk_score}/100</p>
                            </div>
                            <div style={{ padding: "16px", borderRadius: 16, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                                <p style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, marginBottom: 4 }}>Flags</p>
                                <p style={{ fontSize: 20, fontWeight: 800, color: risks.length > 0 ? "#f43f5e" : "#10b981" }}>{risks.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Info Grid ── */}
            {is_contract && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
                    <InfoCard title="Commercial" icon="💼" data={commercial} />
                    <InfoCard title="Legal" icon="📜" data={legal} />
                    <InfoCard title="Deadlines" icon="📅" data={dates} />
                </div>
            )}

            {/* ── Risks ── */}
            {is_contract && risks.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>
                        Identified Risks
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                        {risks.map((r, i) => <RiskCard key={i} risk={r} />)}
                    </div>
                </div>
            )}

            {is_contract && risks.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "48px 24px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    borderRadius: 32, border: "1px solid #bbf7d0",
                }}>
                    <p style={{ color: "#166534", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Secure Agreement</p>
                    <p style={{ color: "#15803d", fontSize: 13 }}>No critical risks identified.</p>
                </div>
            )}
        </div>
    );
}
