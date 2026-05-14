"use client";

import "@/styles/dashboard.css";

export default function ContractChoiceScreen({ doc, router }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center dh-bg dh-dm px-6">
            <div className="dh-card w-full max-w-md p-8 dh-fade-1">
                {/* Icon + heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(18,184,205,.15), rgba(18,184,205,.28))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="dh-syne" style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                            Contract Detected
                        </h3>
                        <p className="dh-dm" style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                            {doc.filename}
                        </p>
                    </div>
                </div>

                <p className="dh-dm" style={{ fontSize: 15, color: '#4b5563', marginBottom: 32, lineHeight: 1.6 }}>
                    This document has been identified as a legal contract. What would you like to do?
                </p>

                {/* Option buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Risk Analysis — Primary Action */}
                    <button
                        className="dh-btn"
                        style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 10, padding: '16px' }}
                        onClick={() => router.push(`/dashboard?doc=${doc.id}&tab=risk`)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Perform Risk Analysis
                    </button>

                    {/* Chat */}
                    <button
                        className="dh-btn-workspace"
                        style={{ justifyContent: 'center', padding: '16px' }}
                        onClick={() => router.push(`/dashboard?doc=${doc.id}`)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        Open in Chatbox
                    </button>
                </div>
            </div>
        </div>
    );
}
