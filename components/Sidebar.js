"use client";

import { useState, useEffect, useRef } from "react";
import { getDocuments, getWorkspaces, deleteDocument, deleteWorkspace, createWorkspace } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DeleteConfirmModal from "./DeleteConfirmModal";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

import "@/styles/sidebar.css";

export default function Sidebar({ selectedDocId, onSelectDoc, refreshKey, onUpload, uploading, onTabChange }) {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState("documents"); // "documents" | "workspaces" | "ocr"

    useEffect(() => {
        if (onTabChange) onTabChange(activeTab);
    }, [activeTab, onTabChange]);
    const [documents, setDocuments] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [loadingWS, setLoadingWS] = useState(true);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
    const [deletingWsId, setDeletingWsId] = useState(null);
    
    // Create Workspace State
    const [showCreateWsModal, setShowCreateWsModal] = useState(false);
    const [creatingWorkspace, setCreatingWorkspace] = useState(false);

    const fetchDocs = async () => {
        try {
            const docs = await getDocuments();
            setDocuments((docs || []).filter(d => !d.workspace_id || d.workspace_id === "none"));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        async function fetchData() {
            setLoadingDocs(true);
            setLoadingWS(true);

            Promise.allSettled([
                fetchDocs(),
                getWorkspaces().then(ws => setWorkspaces(ws || []))
            ]).finally(() => {
                setLoadingDocs(false);
                setLoadingWS(false);
            });
        }
        fetchData();
    }, [refreshKey]);

    const handleDeleteDocClick = (e, doc) => {
        e.preventDefault();
        e.stopPropagation();
        setDocumentToDelete(doc);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;
        const docId = documentToDelete.id;
        setDocumentToDelete(null); // instantly hide modal
        setDeletingDocId(docId);

        try {
            await deleteDocument(docId);
            if (selectedDocId === docId) onSelectDoc(null);
            await fetchDocs();
            toast.success("Document deleted successfully");
        } catch (err) {
            console.error("Failed to delete document", err);
            toast.error("Failed to delete document");
        } finally {
            setDeletingDocId(null);
        }
    };

    const handleDeleteWsClick = (e, ws) => {
        e.preventDefault();
        e.stopPropagation();
        setWorkspaceToDelete(ws);
    };

    const handleConfirmDeleteWs = async () => {
        if (!workspaceToDelete) return;
        const wsId = workspaceToDelete.id;
        setWorkspaceToDelete(null); // instantly hide modal
        setDeletingWsId(wsId);

        try {
            await deleteWorkspace(wsId);
            
            // Redirect to dashboard if the user is currently viewing the deleted workspace
            if (typeof window !== "undefined" && window.location.pathname.includes(`/workspace/${wsId}`)) {
                router.push("/");
            }
            
            // Refresh workspace list
            const ws = await getWorkspaces();
            setWorkspaces(ws || []);
            toast.success("Workspace deleted successfully");
        } catch (err) {
            console.error("Failed to delete workspace", err);
            toast.error("Failed to delete workspace");
        } finally {
            setDeletingWsId(null);
        }
    };

    const handleCreateWs = async (name) => {
        setCreatingWorkspace(true);
        try {
            const ws = await createWorkspace(name);
            setShowCreateWsModal(false);
            router.push(`/workspace/${ws.id}`);
            
            // Refresh workspace list
            const updatedWs = await getWorkspaces();
            setWorkspaces(updatedWs || []);
        } catch (err) {
            console.error("Create workspace failed:", err);
            toast.error("Failed to create workspace.");
        } finally {
            setCreatingWorkspace(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside className="w-full h-full bg-[#202123] text-[#ececf1] flex flex-col border-r border-white/10">

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
                <button
                    className={`sb-tab ${activeTab === "ocr" ? "active" : ""}`}
                    onClick={() => setActiveTab("ocr")}
                >
                    OCR Tools
                </button>
            </div>

            {/* ── Content ── */}
            <div className="sb-scroll">
                {activeTab === "documents" && (
                    <div className="flex flex-col h-full">

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
                                <div
                                    key={doc.id}
                                    className={`sb-doc-item group flex justify-between items-center cursor-pointer ${selectedDocId === doc.id ? "selected" : ""}`}
                                    onClick={() => onSelectDoc(doc)}
                                >
                                    <div className="flex items-center gap-3 min-w-0" style={{ maxWidth: '85%' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-sm leading-snug">{doc.filename}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {(doc.file_size / 1024).toFixed(0)} KB • {new Date(doc.upload_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {deletingDocId === doc.id ? (
                                        <div className="p-1 flex-shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #374151", borderTopColor: "#ef4444", animation: "wsp-spin 0.8s linear infinite" }} />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteDocClick(e, doc)}
                                            className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            title="Delete document"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "workspaces" && (
                    <>
                        {loadingWS ? (
                            <div className="sb-loading">Loading workspaces…</div>
                        ) : workspaces.length === 0 ? (
                            <div className="sb-empty">No workspaces created yet</div>
                        ) : (
                            workspaces.map((ws) => (
                                <div
                                    key={ws.id}
                                    className="sb-ws-item group flex justify-between items-center cursor-pointer relative"
                                    onClick={() => router.push(`/workspace/${ws.id}`)}
                                >
                                    <div className="flex items-center gap-3 min-w-0" style={{ maxWidth: '85%' }}>
                                        <div className="sb-ws-icon flex-shrink-0">
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
                                    </div>

                                    {deletingWsId === ws.id ? (
                                        <div className="p-1 flex-shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 'auto' }}>
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #374151", borderTopColor: "#ef4444", animation: "wsp-spin 0.8s linear infinite" }} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 flex-shrink-0" style={{ marginLeft: 'auto' }}>
                                            {/* Delete button shown only on hover */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteWsClick(e, ws)}
                                                className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete workspace"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === "ocr" && (
                    <div className="flex flex-col h-full items-center justify-center p-4 text-center opacity-70">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <p className="text-sm font-medium text-gray-300">OCR Utilities</p>
                        <p className="text-xs text-gray-500 mt-2">Select a tool in the main dashboard view to process documents securely.</p>
                    </div>
                )}
            </div>

            {/* ── Action Button ── */}
            <div className="px-3 pt-3 pb-2 mb-2 border-white/5">
                {activeTab === "documents" ? (
                    <>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 dh-btn text-white rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>Upload Document</span>
                                </>
                            )}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={onUpload}
                            accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.webp,.jfif"
                        />
                    </>
                ) : activeTab === "workspaces" ? (
                    <button
                        onClick={() => setShowCreateWsModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 dh-btn-workspace"
                        style={{ border: '1.5px solid rgba(255,255,255,0.05)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                            <line x1="12" y1="11" x2="12" y2="17" />
                            <line x1="9" y1="14" x2="15" y2="14" />
                        </svg>
                        <span>Create Workspace</span>
                    </button>
                ) : null}
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

            <DeleteConfirmModal
                isOpen={!!documentToDelete}
                onClose={() => setDocumentToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Document"
                message={`Are you sure you want to delete "${documentToDelete?.filename}"? This action cannot be undone.`}
            />

            <DeleteConfirmModal
                isOpen={!!workspaceToDelete}
                onClose={() => setWorkspaceToDelete(null)}
                onConfirm={handleConfirmDeleteWs}
                title="Delete Workspace"
                message={`Are you sure you want to completely delete the workspace "${workspaceToDelete?.name}"? All contained documents and chat history will be permanently deleted.`}
            />

            <CreateWorkspaceModal
                isOpen={showCreateWsModal}
                onClose={() => setShowCreateWsModal(false)}
                onCreate={handleCreateWs}
                creatingWorkspace={creatingWorkspace}
                subtitle="Create a new separate environment"
            />
        </aside>
    );
}
