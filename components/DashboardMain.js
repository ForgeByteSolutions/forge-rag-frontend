"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getDocuments, createWorkspace, analyzeRisk } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import RiskPanel from "@/components/RiskPanel";
import dynamic from "next/dynamic";
import { getToken } from "@/lib/auth";
import { Syne, DM_Sans } from "next/font/google";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });
const TextViewer = dynamic(() => import("@/components/TextViewer"), { ssr: false });
const DocxViewer = dynamic(() => import("@/components/DocxViewer"), { ssr: false });
const SpreadsheetViewer = dynamic(() => import("@/components/SpreadsheetViewer"), { ssr: false });

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", variable: "--font-dm" });

const SIDEBAR_WIDTH = 250;

const STYLES = `
    .dh-syne { font-family: var(--font-syne), sans-serif; }
    .dh-dm   { font-family: var(--font-dm), sans-serif; }

    @keyframes dh-float {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-8px); }
    }
    @keyframes dh-pulse-ring {
        0%   { transform: scale(0.95); opacity: 0.4; }
        70%  { transform: scale(1.2);  opacity: 0; }
        100% { transform: scale(1.2);  opacity: 0; }
    }
    @keyframes dh-spin { to { transform: rotate(360deg); } }
    @keyframes dh-progress {
        0%   { width: 10%; } 50% { width: 75%; } 100% { width: 55%; }
    }
    @keyframes dh-shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
    }
    @keyframes dh-fade-up {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dh-particle {
        0%   { transform: translateY(0) scale(1);    opacity: .7; }
        100% { transform: translateY(-40px) scale(0); opacity: 0; }
    }

    .dh-float     { animation: dh-float 4s ease-in-out infinite; }
    .dh-spin-anim { animation: dh-spin 1.2s linear infinite; }
    .dh-fade-1 { animation: dh-fade-up .6s ease forwards; }
    .dh-fade-2 { animation: dh-fade-up .6s .12s ease forwards; opacity: 0; }
    .dh-fade-3 { animation: dh-fade-up .6s .24s ease forwards; opacity: 0; }

    .dh-shimmer-text {
        background: linear-gradient(90deg, #1f2937 30%, #12b8cd 55%, #1f2937 80%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: dh-shimmer 4s linear infinite;
    }
    .dh-ring {
        position: relative;
        display: inline-flex; align-items: center; justify-content: center;
    }
    .dh-ring::before {
        content: ''; position: absolute; inset: -6px;
        border-radius: 50%;
        border: 2px solid rgba(18,184,205,.3);
        animation: dh-pulse-ring 2.5s ease-out infinite;
    }
    .dh-card {
        background: rgba(255,255,255,.98);
        border: 1px solid rgba(0,0,0,.06);
        border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,.04), 0 20px 48px rgba(0,0,0,.08);
        transition: all .3s ease; overflow: hidden;
    }
    .dh-card:hover {
        border-color: rgba(18,184,205,.2);
        box-shadow: 0 4px 16px rgba(18,184,205,.08), 0 24px 64px rgba(0,0,0,.12);
    }
    .dh-drop {
        border: 2px dashed rgba(18,184,205,.3);
        border-radius: 18px;
        background: linear-gradient(145deg, rgba(18,184,205,.02), rgba(18,184,205,.06));
        cursor: pointer;
        transition: border-color .22s, background .22s;
        position: relative; overflow: hidden;
    }
    .dh-drop::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at 60% 40%, rgba(18,184,205,.09) 0%, transparent 70%);
        opacity: 0; transition: opacity .3s;
    }
    .dh-drop:hover { border-color: rgba(18,184,205,.6); background: linear-gradient(145deg, rgba(18,184,205,.04), rgba(18,184,205,.08)); }
    .dh-drop:hover::before { opacity: 1; }
    .dh-dotgrid {
        background-image: radial-gradient(circle, rgba(18,184,205,.12) 1px, transparent 1px);
        background-size: 22px 22px;
    }
    .dh-badge {
        display: inline-flex; align-items: center;
        padding: 4px 12px; border-radius: 999px;
        background: rgba(18,184,205,.08); border: 1px solid rgba(18,184,205,.16);
        color: #3bb978; font-size: 11px; font-weight: 600; letter-spacing: .04em;
        font-family: var(--font-dm), sans-serif;
    }
    .dh-btn {
        background: linear-gradient(135deg, #12b8cd, #3bb978);
        color: #fff; border: none; border-radius: 10px;
        padding: 10px 28px;
        font-family: var(--font-syne), sans-serif;
        font-weight: 700; font-size: 12.5px; letter-spacing: .04em;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(18,184,205,.35);
        transition: transform .18s, box-shadow .18s;
        position: relative; overflow: hidden;
    }
    .dh-btn::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,.15) 0%, transparent 55%);
    }
    .dh-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(18,184,205,.45); }
    .dh-btn:active { transform: translateY(0); }
    .dh-btn-workspace {
        background: transparent;
        color: #12b8cd;
        border: 1.5px solid rgba(18,184,205,.25);
        border-radius: 12px;
        padding: 10px 22px;
        font-family: var(--font-syne), sans-serif;
        font-weight: 700; font-size: 12.5px; letter-spacing: .04em;
        cursor: pointer;
        transition: all .25s ease;
        display: inline-flex; align-items: center; gap: 8px;
    }
    .dh-btn-workspace:hover {
        background: rgba(18,184,205,.06);
        border-color: rgba(18,184,205,.5);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(18,184,205,.15);
    }
    .dh-btn-workspace:active { transform: translateY(0); }
    .dh-particle {
        position: absolute; width: 5px; height: 5px;
        border-radius: 50%; background: #12b8cd;
        animation: dh-particle 1.6s ease-out infinite;
    }
    .dh-bg {
        background-color: #f7f8fa;
        background-image:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(18,184,205,.08) 0%, transparent 70%),
            linear-gradient(rgba(18,184,205,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(18,184,205,.03) 1px, transparent 1px);
        background-size: auto, 28px 28px, 28px 28px;
    }
    .dh-overlay {
        position: fixed; inset: 0; z-index: 100;
        background: rgba(0,0,0,.4); backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        animation: dh-fade-up .25s ease;
    }
    .dh-modal {
        background: #fff; border-radius: 24px;
        box-shadow: 0 24px 80px rgba(0,0,0,.18);
        padding: 32px; width: 100%; max-width: 420px;
        animation: dh-fade-up .3s ease;
    }
    .dh-input {
        width: 100%; padding: 14px 18px;
        border: 1.5px solid rgba(0,0,0,.1); border-radius: 12px;
        font-size: 15px; outline: none;
        font-family: var(--font-dm), sans-serif;
        transition: border-color .2s, box-shadow .2s;
    }
    .dh-input:focus {
        border-color: #12b8cd;
        box-shadow: 0 0 0 3px rgba(18,184,205,.12);
    }
    .dh-divider-row {
        display: flex; align-items: center; gap: 16px;
        width: 100%; max-width: 420px;
    }
    .dh-divider-line {
        flex: 1; height: 1px;
        background: rgba(0,0,0,.08);
    }

    /* Sidebar slide */
    .sb-wrapper {
        flex-shrink: 0;
        overflow: hidden;
        transition: width 0.28s cubic-bezier(.4,0,.2,1);
        height: 100%;
    }

    /* Toggle button */
    .sb-toggle {
        position: absolute;
        top: 14px;
        left: 14px;
        z-index: 50;
        width: 34px; height: 34px;
        border-radius: 9px;
        background: rgba(255,255,255,0.9);
        border: 1px solid rgba(0,0,0,.09);
        box-shadow: 0 1px 6px rgba(0,0,0,.1);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background .18s, box-shadow .18s, transform .15s, left 0.28s cubic-bezier(.4,0,.2,1);
        backdrop-filter: blur(6px);
    }
    .sb-toggle:hover {
        background: #fff;
        box-shadow: 0 3px 12px rgba(0,0,0,.14);
        transform: scale(1.06);
    }

    /* Logo fade */
    .sb-logo {
        transition: opacity 0.22s ease, transform 0.22s ease;
    }
    .sb-logo.hidden-logo {
        opacity: 0;
        pointer-events: none;
        transform: translateX(-8px);
    }
`;

function ToggleIcon({ open }) {
    return (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <rect x="1" y="1" width="15" height="15" rx="3.5" stroke="#4B5563" strokeWidth="1.4" />
            <line x1="5.5" y1="1" x2="5.5" y2="16" stroke="#4B5563" strokeWidth="1.4" />
            {open && <rect x="1" y="1" width="4.5" height="15" rx="2.5" fill="rgba(18,184,205,.2)" />}
        </svg>
    );
}

function DashboardHome({ onUpload, uploading, sidebarOpen, onCreateWorkspace, creatingWorkspace }) {
    const [showModal, setShowModal] = useState(false);
    const [wsName, setWsName] = useState("");

    const handleCreate = async () => {
        const name = wsName.trim();
        if (!name) return;
        setShowModal(false);
        setWsName("");
        onCreateWorkspace(name);
    };
    return (
        <div className={`${syne.variable} ${dmSans.variable} dh-dm dh-bg flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto`}>
            <style>{STYLES}</style>

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
                            {['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX'].map(f => (
                                <span key={f} className="dh-badge">{f}</span>
                            ))}
                        </div>
                        <input type="file" accept=".pdf,.docx,.txt,.csv,.xlsx,.xls" className="hidden" onChange={onUpload} />
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

export default function DashboardMain() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [refreshSidebar, setRefreshSidebar] = useState(0);
    const [activeCitation, setActiveCitation] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [creatingWorkspace, setCreatingWorkspace] = useState(false);

    // Risk analysis
    const [riskData, setRiskData] = useState(null);
    const [riskLoading, setRiskLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn()) router.push("/login");
        else syncSelectedDoc();
    }, [router, params?.docId]);

    useEffect(() => {
        if (selectedDoc) setSidebarOpen(true);
    }, [selectedDoc]);

    // Auto-trigger risk analysis when ?tab=risk is present
    useEffect(() => {
        const tab = searchParams?.get("tab");
        if (tab === "risk" && selectedDoc) {
            setRiskData(null);
            setRiskLoading(true);
            analyzeRisk({ doc_id: selectedDoc.id })
                .then(data => setRiskData(data))
                .catch(err => console.error("Risk analysis failed:", err))
                .finally(() => setRiskLoading(false));
        } else if (tab !== "risk") {
            setRiskData(null);
        }
    }, [searchParams, selectedDoc]);

    const syncSelectedDoc = async () => {
        const docIdFromUrl = params?.docId;
        if (docIdFromUrl) {
            try {
                const docs = await getDocuments();
                const doc = docs.find(d => d.id === docIdFromUrl);
                if (doc) setSelectedDoc(doc);
                else router.push("/dashboard");
            } catch (err) { console.error("Sync error:", err); }
        } else {
            setSelectedDoc(null);
        }
    };

    const handleSelectDoc = (doc) => {
        if (doc) router.push(`/dashboard/${doc.id}`);
        else router.push("/dashboard");
        setActiveCitation(null);
    };

    const handleUploadSuccess = () => setRefreshSidebar(prev => prev + 1);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["pdf", "docx", "txt", "csv", "xlsx", "xls"].includes(ext)) {
            alert("❌ Invalid file type!"); return;
        }
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("workspace_id", "none"); // standalone upload, not in a workspace
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/documents/upload`,
                { method: "POST", headers: { Authorization: `Bearer ${await getToken()}` }, body: formData }
            );
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            const newDocId = data.doc_id || data.id;
            if (!newDocId) throw new Error("No doc id returned");
            setRefreshSidebar(prev => prev + 1);

            if (data.is_contract) {
                // Contract detected → go to decision screen
                router.push(`/dashboard/${newDocId}?tab=choice`);
            } else {
                // Not a contract → go directly to chat
                router.push(`/dashboard/${newDocId}`);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Upload failed.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleViewCitation = (citation) => setActiveCitation(citation);
    const handleClosePdf = () => setActiveCitation(null);

    const handleCreateWorkspace = async (name) => {
        try {
            setCreatingWorkspace(true);
            const ws = await createWorkspace(name);
            router.push(`/workspace/${ws.id}`);
        } catch (err) {
            console.error("Create workspace failed:", err);
            alert("❌ Failed to create workspace.");
        } finally {
            setCreatingWorkspace(false);
        }
    };

    return (
        <div className={`${syne.variable} ${dmSans.variable} flex h-screen w-screen overflow-hidden bg-white relative`}>
            <style>{STYLES}</style>


            {/* ── Toggle button — floats over everything, moves with sidebar ── */}
            <button
                className="sb-toggle"
                style={{ left: sidebarOpen ? `${SIDEBAR_WIDTH + 14}px` : '14px' }}
                onClick={() => setSidebarOpen(v => !v)}
                title={sidebarOpen ? "Hide sidebar" : "Show documents"}
            >
                <ToggleIcon open={sidebarOpen} />
            </button>

            {/* ── Sidebar ── */}
            <div className="sb-wrapper" style={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}>
                <div style={{ width: SIDEBAR_WIDTH, height: '100%' }}>
                    <Sidebar
                        key={`sidebar-${refreshSidebar}`}
                        refreshKey={refreshSidebar}
                        selectedDocId={selectedDoc?.id || null}
                        onSelectDoc={handleSelectDoc}
                        onUploadSuccess={handleUploadSuccess}
                    />
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Billing button — only on Dashboard home (no doc selected) */}
                {!selectedDoc && (
                    <button
                        onClick={() => router.push("/usage")}
                        style={{
                            position: "fixed",
                            top: 12, right: 16,
                            zIndex: 60,
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "7px 16px",
                            background: "linear-gradient(135deg,#12b8cd,#3bb978)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: ".04em",
                            cursor: "pointer",
                            boxShadow: "0 2px 10px rgba(18,184,205,.35)",
                            transition: "transform .15s, box-shadow .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(18,184,205,.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(18,184,205,.35)"; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        AI GOVERNANCE
                    </button>
                )}
                {/* Document viewer panel */}
                <div className={`h-full border-r border-black/5 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${activeCitation ? "flex-[1.2] opacity-100" : "flex-0 w-0 opacity-0 invisible"
                    }`}>
                    {activeCitation && (() => {
                        const lowerName = (activeCitation.source || "").toLowerCase();
                        if (lowerName.endsWith(".pdf"))
                            return <PdfViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                        if (lowerName.endsWith(".docx"))
                            return <DocxViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                        if (lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls"))
                            return <SpreadsheetViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                        const textExts = [".txt", ".md", ".json", ".xml", ".py", ".js", ".ts", ".jsx", ".tsx", ".css", ".html", ".log"];
                        if (textExts.some(ext => lowerName.endsWith(ext)))
                            return <TextViewer citation={activeCitation} docId={activeCitation.doc_id} docName={activeCitation.source} onClose={handleClosePdf} />;
                        return (
                            <div className="flex flex-col h-full bg-white">
                                <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{activeCitation.source}</h3>
                                    <button onClick={handleClosePdf} className="p-2 hover:bg-gray-100 rounded-full">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                                    <h3 className="text-gray-900 font-bold">Preview Not Available</h3>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Chat or risk or upload */}
                <main className="h-full flex flex-col min-w-0 overflow-hidden flex-1">
                    {selectedDoc ? (
                        searchParams?.get("tab") === "choice" ? (
                            <div className="flex-1 flex flex-col items-center justify-center dh-bg dh-dm px-6">
                                <style>{STYLES}</style>
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
                                                {selectedDoc.filename}
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
                                            onClick={() => router.push(`/dashboard/${selectedDoc.id}?tab=risk`)}
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
                                            onClick={() => router.push(`/dashboard/${selectedDoc.id}`)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                            </svg>
                                            Open in Chatbox
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : searchParams?.get("tab") === "risk" ? (

                            // Risk Analysis view
                            <div className="h-full flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="h-14 border-b border-black/10 flex items-center justify-between px-6 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <span className="text-base font-semibold text-gray-900">Risk Analysis</span>
                                        <span className="text-xs text-gray-400 truncate max-w-xs">{selectedDoc.filename}</span>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/dashboard/${selectedDoc.id}`)}
                                        className="text-sm text-[#12b8cd] font-semibold hover:underline"
                                    >
                                        Switch to Chat →
                                    </button>
                                </div>
                                {/* Body */}
                                <div className="flex-1 overflow-y-auto">
                                    {riskLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4">
                                            <div className="h-10 w-10 border-4 border-gray-100 border-t-[#12b8cd] rounded-full animate-spin" />
                                            <p className="text-sm text-gray-400">Analyzing contract risks…</p>
                                        </div>
                                    ) : (
                                        <RiskPanel analysis={riskData} docName={selectedDoc.filename} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <ChatBox
                                selectedDocId={selectedDoc?.id || null}
                                selectedDocName={selectedDoc?.filename || null}
                                onViewCitation={handleViewCitation}
                                onSwitchToRisk={() => router.push(`/dashboard/${selectedDoc.id}?tab=risk`)}
                                isCitationActive={!!activeCitation}
                            />
                        )
                    ) : (
                        <DashboardHome
                            onUpload={handleFileUpload}
                            uploading={uploading}
                            sidebarOpen={sidebarOpen}
                            onCreateWorkspace={handleCreateWorkspace}
                            creatingWorkspace={creatingWorkspace}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}