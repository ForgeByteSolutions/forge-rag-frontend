"use client";

import "@/styles/dashboard.css";

export default function RiskDashboardModal({ open, onClose, data, loading, router }) {
    if (!open) return null;

    return (
        <div className="dh-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div
                className="dh-modal"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '0' }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid rgba(0,0,0,.05)', background: '#fff', borderRadius: '24px 24px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'linear-gradient(135deg, rgba(239,68,68,.1), rgba(220,38,38,.2))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontFamily: 'Calibri, "Segoe UI", sans-serif', fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Your Risks Panel</h2>
                            <p style={{ fontFamily: 'Calibri, "Segoe UI", sans-serif', fontSize: 14, color: '#6b7280', marginTop: 2 }}>Overview of all automated legal & compliance risk analyses</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(0,0,0,.04)', border: 'none', width: 36, height: 36, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px', background: '#f8fafc', borderRadius: '0 0 24px 24px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                            <div className="dh-spin-anim" style={{ width: 32, height: 32, border: '3px solid #fca5a5', borderTopColor: '#ef4444', borderRadius: '50%' }}></div>
                            <p className="dh-dm" style={{ color: '#9ca3af', fontSize: 14 }}>Aggregating risk profiles...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%', background: '#fff', border: '1px solid rgba(0,0,0,.04)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,.03)'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p className="dh-syne" style={{ color: '#4b5563', fontSize: 18, fontWeight: 700, letterSpacing: '.02em' }}>No Risks Detected</p>
                                <p className="dh-dm" style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>You have no high or low risks listed in this workspace.</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.map((risk, index) => {
                                const level = (risk.risk_level || "Low").toLowerCase();
                                let color = '#10b981', bg = '#f0fdf4', label = 'Low Risk';
                                if (level === 'high') {
                                    color = '#f43f5e'; bg = '#fff1f2'; label = 'High Risk';
                                } else if (level === 'medium') {
                                    color = '#f59e0b'; bg = '#fffbeb'; label = 'Medium Risk';
                                }

                                return (
                                    <div key={`${risk.doc_id}-${index}`} className="dh-fade-1" style={{
                                        background: '#fff',
                                        border: '1px solid rgba(0,0,0,.04)',
                                        borderRadius: 20,
                                        padding: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '16px 20px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,.01)',
                                        animationDelay: `${index * 0.05}s`,
                                        transition: 'all 0.3s cubic-bezier(.165, .84, .44, 1)',
                                        cursor: 'default',
                                        overflow: 'hidden'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor = color + '33'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.01)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,.04)'; }}
                                    >
                                        {/* Left: Score Box */}
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            width: 80, height: 80, borderRadius: 16, background: bg, border: `1px solid ${color}15`,
                                            flexShrink: 0
                                        }}>
                                            <span style={{
                                                fontFamily: 'var(--font-syne)',
                                                fontSize: 30, fontWeight: 800, color: color, lineHeight: 1
                                            }}>
                                                {risk.risk_score}
                                            </span>
                                            <span style={{
                                                fontFamily: 'var(--font-dm)',
                                                fontSize: 9, fontWeight: 800, color: color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em'
                                            }}>
                                                {label}
                                            </span>
                                        </div>

                                        {/* Middle: Info */}
                                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                                            <h3 className="dh-syne" style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                                                {risk.filename}
                                            </h3>
                                            <div className="dh-dm" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px', fontSize: 11, color: '#64748b' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    {new Date(risk.uploaded_at).toLocaleDateString()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: color, fontWeight: 600 }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M12 8v4" /><path d="M12 16h.01" />
                                                    </svg>
                                                    {risk.risk_level} Risk
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: Action */}
                                        <button
                                            onClick={() => {
                                                onClose();
                                                router.push(`/dashboard/${risk.doc_id}?tab=risk`);
                                            }}
                                            style={{
                                                background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10,
                                                padding: '10px 20px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em',
                                                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(.4, 0, .2, 1)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                                                marginLeft: 'auto'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.15)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)'; }}
                                            className="dh-syne"
                                        >
                                            Analysis
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
