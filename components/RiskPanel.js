"use client";

// ─── Category Meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
    financial: { icon: "💰", label: "Financial", color: "#ef4444", grad: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "#fca5a588" },
    legal: { icon: "🛡️", label: "Legal", color: "#8b5cf6", grad: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "#c4b5fd88" },
    operational: { icon: "⚙️", label: "Operational", color: "#f59e0b", grad: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "#fcd34d88" },
    compliance: { icon: "📋", label: "Compliance", color: "#3b82f6", grad: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "#93c5fd88" },
};
const catMeta = (cat = "") =>
    CATEGORY_META[cat.toLowerCase()] || { icon: "⚠️", label: cat, color: "#6b7280", grad: "linear-gradient(135deg,#f9fafb,#f3f4f6)", border: "#d1d5db88" };

// ─── Animated SVG Gauge ────────────────────────────────────────────────────────
function ScoreGauge({ score = 0 }) {
    const R = 75;
    const cx = 100, cy = 100;
    const circ = 2 * Math.PI * R;
    const filled = (score / 100) * circ;

    const color =
        score >= 70 ? "#ef4444" :
            score >= 40 ? "#f59e0b" :
                "#10a37f";

    const gradId = `gauge-grad-${Math.round(score)}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={color} stopOpacity="1" />
                    </linearGradient>
                    <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Track */}
                <circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                    strokeLinecap="round"
                />

                {/* Filled arc */}
                <circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth="16"
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    filter="url(#gaugeGlow)"
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
                />

                {/* Center score */}
                <text x={cx} y={cy - 5} textAnchor="middle" fontSize="38" fontWeight="800" fill={color}
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    {score}
                </text>
                <text x={cx} y={cy + 22} textAnchor="middle" fontSize="12" fill="#94a3b8"
                    style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
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
            border: "1px solid rgba(0,0,0,.04)",
            borderRadius: 20,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,.03)",
        }}>
            <div style={{
                padding: "18px 24px",
                background: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
                borderBottom: "1px solid rgba(0,0,0,.04)",
                display: "flex", alignItems: "center", gap: 12
            }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#475569", letterSpacing: ".12em", textTransform: "uppercase" }}>
                    {title}
                </span>
            </div>
            <div style={{
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px 32px"
            }}>
                {entries.map(([k, v]) => (
                    <div key={k}>
                        <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6, fontWeight: 700, letterSpacing: ".06em" }}>
                            {k.replace(/_/g, " ")}
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{String(v)}</p>
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
            border: `1.5px solid ${meta.border}`,
            borderRadius: 20,
            padding: "20px 24px",
            background: meta.grad,
            display: "flex", flexDirection: "column", gap: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,.03)",
            transition: "transform .2s ease, box-shadow .2s ease",
            position: "relative",
            overflow: "hidden"
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.03)"; }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Badge */}
                <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: `${meta.color}22`,
                    border: `1px solid ${meta.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                }}>
                    {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                        <span style={{
                            fontSize: 13, fontWeight: 800, color: meta.color,
                            textTransform: "uppercase", letterSpacing: ".08em"
                        }}>
                            {meta.label}
                        </span>
                        <div style={{
                            fontSize: 12, fontWeight: 800, color: meta.color,
                            background: `#fff`, border: `1.5px solid ${meta.color}40`,
                            padding: "4px 12px", borderRadius: 12,
                            boxShadow: `0 2px 6px ${meta.color}15`
                        }}>
                            Severity {risk.severity}/10
                        </div>
                    </div>
                    <p style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.6, fontWeight: 500 }}>{risk.reason}</p>
                </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.4)", padding: "12px", borderRadius: 14 }}>
                <SeverityBar value={risk.severity} />
            </div>

            {risk.exact_text && (
                <details style={{ marginTop: 4 }}>
                    <summary style={{ fontSize: 12, color: meta.color, fontWeight: 700, cursor: "pointer", userSelect: "none", opacity: 0.85 }}>
                        View original clause
                    </summary>
                    <blockquote style={{
                        margin: "12px 0 0",
                        padding: "16px 20px",
                        borderLeft: `4px solid ${meta.color}`,
                        background: "#ffffff99",
                        borderRadius: "0 14px 14px 0",
                        fontSize: 14, color: "#334155", fontStyle: "italic", lineHeight: 1.7,
                        backdropFilter: "blur(8px)",
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.02)"
                    }}>
                        "{risk.exact_text}"
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
            display: "flex", flexDirection: "column", gap: 24,
            padding: "24px",
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
            maxWidth: "100%",
        }}>

            {/* ── Contract Banner ── */}
            {is_contract ? (
                <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px",
                    background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)",
                    border: "1px solid #5eead4",
                    borderRadius: 20,
                    boxShadow: "0 4px 15px rgba(20,184,166,0.12)",
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: "linear-gradient(135deg,rgba(20,184,166,0.2),rgba(20,184,166,0.3))",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                    }}>⚖️</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#0f766e", marginBottom: 2 }}>Contract Document Detected</p>
                        <p style={{ fontSize: 13, color: "#134e4a", opacity: 0.8 }}>Identity and risks verified for {docName || "the active file"}</p>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
                    background: "#f8fafc99", border: "1px solid #e2e8f0", borderRadius: 20,
                    backdropFilter: "blur(8px)"
                }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>General Document (Not a Legal Contract)</p>
                </div>
            )}

            {/* ── Score Hero (THE "FILL" SECTION) ── */}
            {is_contract && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 32,
                    padding: "40px",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 30,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                    alignItems: "center"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1.5px solid #f1f5f9", paddingRight: 32 }}>
                        <ScoreGauge score={risk_score} />
                        <p style={{ marginTop: 12, fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>Aggregate Risk Index</p>
                    </div>

                    {/* Stats column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{
                            padding: "24px 28px", borderRadius: 24,
                            background: levelGrad,
                            border: `2px solid ${levelColor}25`,
                            boxShadow: `0 8px 20px ${levelColor}15`,
                        }}>
                            <p style={{ fontSize: 13, color: levelColor, textTransform: "uppercase", letterSpacing: ".15em", fontWeight: 900, marginBottom: 8, opacity: 0.8 }}>
                                Criticality Rating
                            </p>
                            <p style={{ fontSize: 36, fontWeight: 900, color: levelColor, lineHeight: 1 }}>{risk_level}</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {[
                                { label: "Numeric Score", value: `${risk_score}/100`, color: "#0f172a" },
                                { label: "Detected Flags", value: risks.length, color: risks.length > 0 ? "#ef4444" : "#10a37f" },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{
                                    padding: "20px 16px", borderRadius: 20,
                                    background: "#f8fafc",
                                    border: "1.5px solid #f1f5f9",
                                    textAlign: "center",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.02)"
                                }}>
                                    <p style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 800, marginBottom: 8 }}>
                                        {label}
                                    </p>
                                    <p style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Info Grid ── */}
            {is_contract && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <InfoCard title="Commercial Details" icon="💼" data={commercial} />
                        <InfoCard title="Legal Framework" icon="📜" data={legal} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <InfoCard title="Critical Deadlines" icon="📅" data={dates} />

                        {/* Summary Box or Call to Action */}
                        <div style={{
                            padding: "28px", borderRadius: 20,
                            background: "linear-gradient(145deg, #0f172a, #1e293b)",
                            color: "#fff", height: "100%",
                            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
                            display: "flex", flexDirection: "column", justifyContent: "center"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }} />
                                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: ".1em" }}>Analysis Insight</h4>
                            </div>
                            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#e2e8f0", fontWeight: 500 }}>
                                {risks.length > 3
                                    ? "Multiple high-severity risks detected. Immediate legal review is highly recommended before proceeding with this agreement."
                                    : "Standard risk profiles identified. The document appears largely compliant with standard procedures, though caution is advised on specific clauses."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Risk Factors Section ── */}
            {is_contract && risks.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 900, color: "#1e293b", letterSpacing: ".12em", textTransform: "uppercase" }}>
                            Detailed Risk Factors
                        </h3>
                        <span style={{
                            padding: "4px 14px", borderRadius: 12,
                            background: "linear-gradient(135deg, #0f172a, #334155)", color: "#fff",
                            fontSize: 14, fontWeight: 900,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                        }}>
                            {risks.length} Flags
                        </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                        {risks.map((r, i) => <RiskCard key={i} risk={r} />)}
                    </div>
                </div>
            )}

            {is_contract && risks.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "40px 24px",
                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    borderRadius: 24, border: "1px solid #bbf7d0",
                    boxShadow: "0 6px 20px rgba(22,163,74,0.05)"
                }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>🛡️</span>
                    <p style={{ color: "#166534", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Security Review Passed</p>
                    <p style={{ color: "#15803d", fontSize: 13, opacity: 0.8 }}>No significant financial or legal risks were identified in this document.</p>
                </div>
            )}
        </div>
    );
}
