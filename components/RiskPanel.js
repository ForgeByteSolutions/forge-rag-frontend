"use client";

// ─── Category Meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
    financial: { icon: "💰", label: "Financial", color: "#ef4444", grad: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "#fca5a588" },
    legal: { icon: "⚖️", label: "Legal", color: "#8b5cf6", grad: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "#c4b5fd88" },
    operational: { icon: "⚙️", label: "Operational", color: "#f59e0b", grad: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "#fcd34d88" },
    compliance: { icon: "📋", label: "Compliance", color: "#3b82f6", grad: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "#93c5fd88" },
};
const catMeta = (cat = "") =>
    CATEGORY_META[cat.toLowerCase()] || { icon: "⚠️", label: cat, color: "#6b7280", grad: "linear-gradient(135deg,#f9fafb,#f3f4f6)", border: "#d1d5db88" };

// ─── Animated SVG Gauge ────────────────────────────────────────────────────────
function ScoreGauge({ score = 0 }) {
    const R = 70;
    const cx = 100, cy = 105;
    const circ = 2 * Math.PI * R;
    const arc = circ * 0.75;
    const filled = (score / 100) * arc;

    const color =
        score >= 70 ? "#ef4444" :
            score >= 40 ? "#f59e0b" :
                "#10a37f";

    const gradId = `gauge-grad-${Math.round(score)}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <svg width="200" height="140" viewBox="0 0 200 140">
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={color} stopOpacity="1" />
                    </linearGradient>
                    {/* glow filter */}
                    <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Track */}
                <circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                    strokeDasharray={`${arc} ${circ - arc}`}
                    strokeDashoffset={-(circ * 0.125)}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                />

                {/* Filled arc */}
                <circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth="14"
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeDashoffset={circ * 0.125}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    filter="url(#gaugeGlow)"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
                />

                {/* Center score */}
                <text x={cx} y={cy - 10} textAnchor="middle" fontSize="32" fontWeight="800" fill={color}
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    {score}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#94a3b8"
                    style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    / 100
                </text>
            </svg>
        </div>
    );
}

// ─── Severity Bar ─────────────────────────────────────────────────────────────
function SeverityBar({ value = 0 }) {
    const pct = (value / 10) * 100;
    const color = value >= 7 ? "#ef4444" : value >= 4 ? "#f59e0b" : "#10a37f";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{
                    width: `${pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    borderRadius: 99,
                    transition: "width .7s cubic-bezier(.4,0,.2,1)",
                    boxShadow: `0 0 6px ${color}66`
                }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 16, textAlign: "right" }}>{value}</span>
        </div>
    );
}

// ─── Info Card ────────────────────────────────────────────────────────────────
function InfoCard({ title, icon, data = {} }) {
    const entries = Object.entries(data).filter(([, v]) => v);
    if (!entries.length) return null;
    return (
        <div style={{
            border: "1px solid rgba(0,0,0,.06)",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 1px 6px rgba(0,0,0,.04)",
        }}>
            <div style={{
                padding: "12px 16px",
                background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
                borderBottom: "1px solid rgba(0,0,0,.05)",
                display: "flex", alignItems: "center", gap: 8
            }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {title}
                </span>
            </div>
            <div style={{
                padding: "14px 16px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "12px 20px"
            }}>
                {entries.map(([k, v]) => (
                    <div key={k}>
                        <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "capitalize", marginBottom: 2, fontWeight: 600, letterSpacing: ".05em" }}>
                            {k.replace(/_/g, " ")}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{String(v)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Risk Card ────────────────────────────────────────────────────────────────
function RiskCard({ risk, idx }) {
    const meta = catMeta(risk.category);
    return (
        <div style={{
            border: `1px solid ${meta.border}`,
            borderRadius: 14,
            padding: "14px 16px",
            background: meta.grad,
            display: "flex", flexDirection: "column", gap: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,.04)",
            transition: "transform .15s, box-shadow .15s",
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"; }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Badge */}
                <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                }}>
                    {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: meta.color,
                            textTransform: "uppercase", letterSpacing: ".06em"
                        }}>
                            {meta.label}
                        </span>
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: meta.color,
                            background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
                            padding: "1px 8px", borderRadius: 99
                        }}>
                            Severity {risk.severity}/10
                        </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{risk.reason}</p>
                </div>
            </div>

            <SeverityBar value={risk.severity} />

            {risk.exact_text && (
                <details>
                    <summary style={{ fontSize: 11, color: "#6b7280", cursor: "pointer", userSelect: "none" }}>
                        View exact clause
                    </summary>
                    <blockquote style={{
                        margin: "8px 0 0",
                        padding: "10px 14px",
                        borderLeft: `3px solid ${meta.color}55`,
                        background: "#ffffff88",
                        borderRadius: "0 10px 10px 0",
                        fontSize: 12, color: "#374151", fontStyle: "italic", lineHeight: 1.65,
                        backdropFilter: "blur(4px)"
                    }}>
                        {risk.exact_text}
                    </blockquote>
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
        risk_level === "High" ? "#ef4444" :
            risk_level === "Medium" ? "#f59e0b" :
                "#10a37f";

    const levelGrad =
        risk_level === "High" ? "linear-gradient(135deg,#fef2f2,#fee2e2)" :
            risk_level === "Medium" ? "linear-gradient(135deg,#fffbeb,#fef3c7)" :
                "linear-gradient(135deg,#f0fdf4,#dcfce7)";

    return (
        <div style={{
            display: "flex", flexDirection: "column", gap: 18,
            padding: "22px 20px",
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>

            {/* ── Contract Banner ── */}
            {is_contract ? (
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 18px",
                    background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                    border: "1px solid #6ee7b7",
                    borderRadius: 16,
                    boxShadow: "0 2px 12px rgba(16,163,127,.1)",
                }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: "linear-gradient(135deg,rgba(16,163,127,.15),rgba(16,163,127,.28))",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>⚖️</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 2 }}>Contract Document</p>
                        <p style={{ fontSize: 12, color: "#047857" }}>This document has been identified as a legal contract</p>
                    </div>
                    <span style={{
                        padding: "6px 16px", borderRadius: 99,
                        fontSize: 13, fontWeight: 700,
                        color: levelColor,
                        background: levelGrad,
                        border: `1.5px solid ${levelColor}40`,
                        whiteSpace: "nowrap",
                        boxShadow: `0 2px 8px ${levelColor}20`,
                    }}>
                        {risk_level} Risk
                    </span>
                </div>
            ) : (
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 18px",
                    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16,
                }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Not identified as a contract</p>
                </div>
            )}

            {/* ── Score Hero ── */}
            {is_contract && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 36, flexWrap: "wrap",
                    padding: "24px 20px",
                    background: "linear-gradient(145deg,#fafbff,#f1f5f9)",
                    border: "1px solid rgba(0,0,0,.06)",
                    borderRadius: 20,
                    boxShadow: "0 4px 24px rgba(0,0,0,.05)",
                }}>
                    <ScoreGauge score={risk_score} />

                    {/* Stats column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[
                            { label: "Risk Score", value: risk_score, color: levelColor, size: 32 },
                            { label: "Risk Level", value: risk_level, color: levelColor, size: 22 },
                            { label: "Risks Found", value: risks.length, color: "#0f172a", size: 22 },
                        ].map(({ label, value, color, size }) => (
                            <div key={label} style={{
                                padding: "12px 20px", borderRadius: 12,
                                background: "#fff",
                                border: "1px solid rgba(0,0,0,.06)",
                                boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                                minWidth: 140,
                            }}>
                                <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 4 }}>
                                    {label}
                                </p>
                                <p style={{ fontSize: size, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Info Cards ── */}
            {is_contract && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <InfoCard title="Commercial" icon="💼" data={commercial} />
                    <InfoCard title="Legal" icon="📜" data={legal} />
                    <InfoCard title="Key Dates" icon="📅" data={dates} />
                </div>
            )}

            {/* ── Risk Cards ── */}
            {is_contract && risks.length > 0 && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: ".06em", textTransform: "uppercase" }}>
                            Risk Factors
                        </p>
                        <span style={{
                            padding: "2px 10px", borderRadius: 99,
                            background: `${levelColor}15`, color: levelColor,
                            fontSize: 12, fontWeight: 700,
                            border: `1px solid ${levelColor}30`
                        }}>
                            {risks.length}
                        </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {risks.map((r, i) => <RiskCard key={i} risk={r} />)}
                    </div>
                </div>
            )}

            {is_contract && risks.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "32px 24px",
                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    borderRadius: 16, border: "1px solid #bbf7d0",
                    color: "#065f46", fontSize: 14, fontWeight: 600
                }}>
                    ✅ No significant risks identified
                </div>
            )}
        </div>
    );
}
