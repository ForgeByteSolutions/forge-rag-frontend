"use client";

import { useState, useEffect } from "react";
import { getDocuments, getWorkspaces } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const SIDEBAR_STYLES = `
    .sb-tab {
        flex: 1;
        padding: 8px 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: color .18s, background .18s;
        border-radius: 8px;
    }
    .sb-tab.active {
        background: rgba(18, 184, 205,.15);
        color: #12b8cd;
    }
    .sb-tab:not(.active) {
        color: #6b7280;
    }
    .sb-tab:not(.active):hover {
        color: #9ca3af;
        background: rgba(255,255,255,.04);
    }
    .sb-doc-item {
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: background .15s;
        color: #d1d5db;
    }
    .sb-doc-item:hover {
        background: rgba(255,255,255,.06);
    }
    .sb-doc-item.selected {
        background: #343541;
        color: #fff;
    }
    .sb-ws-item {
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.06);
        background: rgba(255,255,255,.03);
        cursor: pointer;
        transition: all .18s;
        color: #d1d5db;
        margin-bottom: 6px;
    }
    .sb-ws-item:hover {
        background: rgba(18, 184, 205,.08);
        border-color: rgba(18, 184, 205,.2);
        color: #fff;
    }
    .sb-ws-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(18, 184, 205,.18), rgba(18, 184, 205,.3));
        border: 1px solid rgba(18, 184, 205,.2);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .sb-empty {
        padding: 24px 12px;
        text-align: center;
        font-size: 12px;
        color: #4b5563;
        font-style: italic;
    }
    .sb-loading {
        padding: 12px;
        font-size: 12px;
        color: #6b7280;
        animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
    .sb-scroll { flex: 1; overflow-y: auto; padding: 8px; }
    .sb-scroll::-webkit-scrollbar { width: 4px; }
    .sb-scroll::-webkit-scrollbar-track { background: transparent; }
    .sb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
`;

export default function Sidebar({ selectedDocId, onSelectDoc, refreshKey }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("documents"); // "documents" | "workspaces"
    const [documents, setDocuments] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [loadingWS, setLoadingWS] = useState(true);

    useEffect(() => {
        async function fetchDocs() {
            setLoadingDocs(true);
            try {
                const docs = await getDocuments();
                setDocuments((docs || []).filter(d => !d.workspace_id));
            } catch (err) {
                console.error("Failed to fetch documents:", err);
            } finally {
                setLoadingDocs(false);
            }
        }
        fetchDocs();
    }, [refreshKey]);

    useEffect(() => {
        async function fetchWS() {
            setLoadingWS(true);
            try {
                const ws = await getWorkspaces();
                setWorkspaces(ws || []);
            } catch (err) {
                console.error("Failed to fetch workspaces:", err);
            } finally {
                setLoadingWS(false);
            }
        }
        fetchWS();
    }, [refreshKey]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside className="w-full h-full bg-[#202123] text-[#ececf1] flex flex-col border-r border-white/10">
            <style>{SIDEBAR_STYLES}</style>

            {/* ── Tab bar ── */}
            <div style={{
                display: "flex",
                gap: 4,
                padding: "12px 10px 8px",
                borderBottom: "1px solid rgba(255,255,255,.07)",
                flexShrink: 0,
            }}>
                <button
                    className={`sb-tab ${activeTab === "documents" ? "active" : ""}`}
                    onClick={() => setActiveTab("documents")}
                >
                    Documents
                </button>
                <button
                    className={`sb-tab ${activeTab === "workspaces" ? "active" : ""}`}
                    onClick={() => setActiveTab("workspaces")}
                >
                    Workspaces
                </button>
            </div>

            {/* ── Content ── */}
            <div className="sb-scroll">
                {activeTab === "documents" && (
                    <>
                        {/* Dashboard home button */}
                        <button
                            className={`sb-doc-item ${selectedDocId === null ? "selected" : ""}`}
                            onClick={() => onSelectDoc(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="truncate text-sm font-medium">Dashboard</span>
                        </button>

                        {loadingDocs ? (
                            <div className="sb-loading">Loading documents…</div>
                        ) : documents.length === 0 ? (
                            <div className="sb-empty">No documents uploaded yet</div>
                        ) : (
                            documents.map((doc) => (
                                <button
                                    key={doc.id}
                                    className={`sb-doc-item ${selectedDocId === doc.id ? "selected" : ""}`}
                                    onClick={() => onSelectDoc(doc)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="flex flex-col min-w-0">
                                        <span className="truncate text-sm leading-snug">{doc.filename}</span>
                                        <span className="text-[10px] text-gray-500">
                                            {(doc.file_size / 1024).toFixed(0)} KB • {new Date(doc.upload_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </>
                )}

                {activeTab === "workspaces" && (
                    <>
                        {loadingWS ? (
                            <div className="sb-loading">Loading workspaces…</div>
                        ) : workspaces.length === 0 ? (
                            <div className="sb-empty">No workspaces created yet</div>
                        ) : (
                            workspaces.map((ws) => (
                                <button
                                    key={ws.id}
                                    className="sb-ws-item"
                                    onClick={() => router.push(`/workspace/${ws.id}`)}
                                >
                                    <div className="sb-ws-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="truncate text-sm font-medium leading-snug">{ws.name}</span>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(ws.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            ))
                        )}
                    </>
                )}
            </div>

            {/* ── Logout ── */}
            <div className="mt-auto p-2 border-t border-white/10 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2b2c2f] transition-colors text-base text-left"
                >
                    <div className="h-5 w-5 rounded-full bg-[#12b8cd] flex items-center justify-center text-[10px] font-bold">
                        U
                    </div>
                    <span className="flex-1 font-medium">Log out</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </aside>
    );
}
