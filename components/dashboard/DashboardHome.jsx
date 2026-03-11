"use client";

import { useState } from "react";
import "@/styles/dashboard.css";



export default function DashboardHome({ onUpload, uploading, sidebarOpen, onCreateWorkspace, creatingWorkspace }) {
    const [showModal, setShowModal] = useState(false);
    const [wsName, setWsName] = useState("");

    const handleCreate = async () => {
        const name = wsName.trim();
        if (!name) return;

        await onCreateWorkspace(name);

        setShowModal(false);
        setWsName("");
    };

    return (
        <div className={`dh-dm dh-bg flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto`}>

            {/* Logo — hidden when sidebar is open */}
            <div className={`sb-logo dh-fade-1 flex items-center gap-3 mb-8 ${sidebarOpen ? 'hidden-logo' : ''}`}>
                <div className="dh-ring">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#12b8cd,#3bb978)', boxShadow: '0 6px 20px rgba(18,184,205,.4)' }}>
                        <img src="/Icon_White (1).png" className="w-5 h-5 object-contain" />
                    </div>
                </div>
                <div>
                    <h1 className="dh-syne dh-shimmer-text font-bold tracking-tight leading-none"
                        style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>
                        FORGE INTELLI OCR
                    </h1>
                    <p className="dh-dm text-[9px] font-medium text-gray-500 tracking-[.2em] uppercase mt-1">
                        Retrieval Augmented Generation
                    </p>
                </div>
            </div>

            {/* Upload card */}
            <div className="dh-fade-2 dh-card w-full max-w-sm">
                {uploading ? (
                    <div className="flex flex-col items-center gap-4 px-6 py-8">
                        <div className="relative">
                            <div className="rounded-xl flex items-center justify-center"
                                style={{ width: 60, height: 60, background: 'linear-gradient(135deg,rgba(18,184,205,.12),rgba(18,184,205,.24))', boxShadow: '0 4px 16px rgba(18,184,205,.18)' }}>
                                <svg className="dh-spin-anim w-10 h-10 text-[#12b8cd]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                                </svg>
                            </div>
                            {[0, 1, 2].map(i => (
                                <div key={i} className="dh-particle" style={{ left: `${20 + i * 24}px`, bottom: '-6px', animationDelay: `${i * 0.5}s` }} />
                            ))}
                        </div>
                        <div className="text-center">
                            <p className="dh-syne text-base font-semibold text-gray-900 mb-1.5">Processing your document</p>
                            <p className="dh-dm text-xs text-gray-500 tracking-wide">Uploading · Chunking · Embedding</p>
                        </div>
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between items-center mb-2.5">
                                <span className="dh-dm text-[11px] text-gray-500 font-semibold tracking-wider uppercase">Indexing</span>
                                <span className="dh-badge">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#12b8cd] animate-pulse inline-block mr-1.5" />Live
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full"
                                    style={{ background: 'linear-gradient(90deg,#12b8cd,#3bb978)', animation: 'dh-progress 3s ease-in-out infinite alternate' }} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <label className="dh-drop dh-dotgrid flex flex-col items-center gap-4 px-6 py-8 m-3 block">
                        <div className="dh-float flex items-center justify-center rounded-xl"
                            style={{ width: 56, height: 56, background: 'linear-gradient(135deg,rgba(18,184,205,.1),rgba(18,184,205,.22))', border: '1.5px solid rgba(18,184,205,.2)', boxShadow: '0 6px 20px rgba(18,184,205,.15)' }}>
                            <svg className="w-7 h-7 text-[#12b8cd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="dh-syne text-base font-semibold text-gray-900 mb-1.5">Drop your document here</p>
                            <p className="dh-dm text-xs text-gray-500 leading-relaxed">or click to browse your computer</p>
                        </div>
                        <div className="dh-btn">Choose File</div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'JPG', 'PNG'].map(f => (
                                <span key={f} className="dh-badge">{f}</span>
                            ))}
                        </div>
                        <input type="file" accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.webp" className="hidden" onChange={onUpload} />
                    </label>
                )}
            </div>

            {/* Divider */}
            {!uploading && (
                <div className="dh-fade-3 dh-divider-row mt-8 mb-4">
                    <div className="dh-divider-line" />
                    <span className="dh-dm text-[11px] text-gray-400 font-semibold tracking-[.15em] uppercase">or</span>
                    <div className="dh-divider-line" />
                </div>
            )}

            {/* Create Workspace button */}
            {!uploading && (
                <div className="dh-fade-3" style={{ animationDelay: '.3s', opacity: 0 }}>
                    <button className="dh-btn-workspace" onClick={() => setShowModal(true)} disabled={creatingWorkspace}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                            <line x1="12" y1="11" x2="12" y2="17" />
                            <line x1="9" y1="14" x2="15" y2="14" />
                        </svg>
                        {creatingWorkspace ? "Creating..." : "Create Workspace"}
                    </button>
                </div>
            )}

            {!uploading && (
                <p className="dh-fade-3 dh-dm mt-6 text-[11px] text-gray-400 font-medium tracking-widest uppercase" style={{ animationDelay: '.36s', opacity: 0 }}>
                    Files are processed securely and never shared
                </p>
            )}

            {/* Create Workspace Modal */}
            {showModal && (
                <div className="dh-overlay" onClick={() => setShowModal(false)}>
                    <div className="dh-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: 'linear-gradient(135deg, rgba(18,184,205,.12), rgba(18,184,205,.24))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="dh-syne" style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>New Workspace</h3>
                                <p className="dh-dm" style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Upload multiple documents together</p>
                            </div>
                        </div>
                        <label className="dh-dm" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                            Workspace Name
                        </label>
                        <input
                            className="dh-input"
                            placeholder="e.g. Q4 Financial Reports"
                            value={wsName}
                            onChange={e => setWsName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button
                                className="dh-btn-workspace"
                                style={{ padding: '10px 20px', fontSize: 13 }}
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="dh-btn"
                                style={{ padding: '10px 24px', fontSize: 13 }}
                                onClick={handleCreate}
                                disabled={!wsName.trim()}
                            >
                                Create & Open
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
