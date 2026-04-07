"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteDocument } from "@/lib/api";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import "@/styles/workspace.css";

const FILE_ICONS = {
    pdf: { color: "#ef4444", label: "PDF" },
    docx: { color: "#3b82f6", label: "DOCX" },
    txt: { color: "#6b7280", label: "TXT" },
    csv: { color: "#22c55e", label: "CSV" },
    xlsx: { color: "#22c55e", label: "XLSX" },
    xls: { color: "#22c55e", label: "XLS" },
    png: { color: "#8b5cf6", label: "PNG" },
    jpg: { color: "#8b5cf6", label: "JPG" },
    jpeg: { color: "#8b5cf6", label: "JPG" },
    gif: { color: "#8b5cf6", label: "GIF" },
    webp: { color: "#8b5cf6", label: "WEBP" },
};

function FileTypeBadge({ ext }) {
    const info = FILE_ICONS[ext] || { color: "#6b7280", label: ext?.toUpperCase() || "?" };
    return (
        <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: `${info.color}18`, border: `1.5px solid ${info.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: info.color }}>{info.label}</span>
        </div>
    );
}

export default function DocumentsPanel({
    workspaceDocs,
    uploadedFiles,
    selectedDocIds,
    setSelectedDocIds,
    riskMap,
    dragOver,
    setDragOver,
    onFilePick,
    onDrop,
    onRiskClick,
    onDeleteSuccess,
}) {
    const fileInputRef = useRef(null);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [deletingDocId, setDeletingDocId] = useState(null);
    const allDocs = workspaceDocs;
    const hasDocuments = allDocs.length > 0 || uploadedFiles.length > 0;

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;
        const docId = documentToDelete.id;
        setDocumentToDelete(null);
        setDeletingDocId(docId);

        try {
            await deleteDocument(docId);
            if (onDeleteSuccess) onDeleteSuccess();
            toast.success("Document deleted successfully");
            // If it was selected, remove it from selection
            if (selectedDocIds.has(docId)) {
                const newSet = new Set(selectedDocIds);
                newSet.delete(docId);
                setSelectedDocIds(newSet);
            }
        } catch (err) {
            console.error("Failed to delete document", err);
            toast.error("Failed to delete document");
        } finally {
            setDeletingDocId(null);
        }
    };

    return (
        <div className="wsp-left">
            {/* Drop zone */}
            <div
                className={`wsp-drop wsp-dotgrid ${dragOver ? "drag-over" : ""}`}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{ margin: "14px 14px 0", padding: "22px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
            >
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "linear-gradient(135deg,rgba(18,184,205,.1),rgba(18,184,205,.22))",
                    border: "1.5px solid rgba(18,184,205,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "wsp-float 3.5s ease-in-out infinite"
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p className="wsp-syne" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Drop documents here</p>
                    <p className="wsp-dm" style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>or click to browse</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={onFilePick}
                />
            </div>

            {/* Document list header */}
            <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <p className="wsp-syne" style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: ".06em", textTransform: "uppercase" }}>
                    Documents
                </p>
                {allDocs.length > 0 && (
                    <span className="wsp-badge">{allDocs.length}</span>
                )}
            </div>

            {/* Scrollable doc list */}
            <div className="wsp-scroll-left">
                {/* In-progress uploads */}
                {uploadedFiles.filter(f => f.status !== "done").map((f, i) => {
                    const ext = f.file.name.split(".").pop().toLowerCase();
                    return (
                        <div key={f.id} className="wsp-file-card" style={{ marginBottom: 8, animationDelay: `${i * 0.05}s` }}>
                            <FileTypeBadge ext={ext} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="wsp-dm" style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {f.file.name}
                                </p>
                                <p style={{ fontSize: 11, color: "#9ca3af" }}>{(f.file.size / 1024).toFixed(1)} KB</p>
                                {f.status === "uploading" && <div className="wsp-prog-bar"><div className="wsp-prog-fill" /></div>}
                                {f.status === "error" && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{f.error}</p>}
                            </div>
                            {f.status === "uploading" && (
                                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2.5px solid #e5e7eb", borderTopColor: "#12b8cd", animation: "wsp-spin 1s linear infinite", flexShrink: 0 }} />
                            )}
                        </div>
                    );
                })}

                {/* Already-saved documents */}
                {allDocs.map((doc, i) => {
                    const ext = doc.filename.split(".").pop().toLowerCase();
                    const isAnalyzed = !!riskMap[doc.id];
                    const isSelected = selectedDocIds.has(doc.id);
                    return (
                        <div
                            key={doc.id}
                            className="wsp-file-card"
                            style={{
                                marginBottom: 8,
                                animationDelay: `${i * 0.05}s`,
                                background: isSelected ? "rgba(18,184,205,.05)" : "#fff",
                                borderColor: isSelected ? "#12b8cd" : "rgba(0,0,0,.06)",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                const newSet = new Set(selectedDocIds);
                                if (newSet.has(doc.id)) newSet.delete(doc.id);
                                else newSet.add(doc.id);
                                setSelectedDocIds(newSet);
                            }}
                        >
                            <FileTypeBadge ext={ext} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="wsp-dm" style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {doc.filename}
                                </p>
                                <p style={{ fontSize: 11, color: "#9ca3af" }}>
                                    {(doc.file_size / 1024).toFixed(1)} KB · {new Date(doc.upload_date).toLocaleDateString()}
                                </p>
                            </div>
                            {/* Risk Analysis button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onRiskClick(doc); }}
                                title={isAnalyzed ? "View risk analysis" : "Run risk analysis"}
                                style={{
                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: "none",
                                    background: isAnalyzed ? "linear-gradient(135deg,#12b8cd,#3bb978)" : "#f3f4f6",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", transition: "all .2s", marginLeft: "auto"
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isAnalyzed ? "brightness(0) invert(1)" : "none" }}>
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </button>

                            {/* Delete button (like general chat) */}
                            {deletingDocId === doc.id ? (
                                <div className="p-1 flex-shrink-0" style={{ marginLeft: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #e5e7eb", borderTopColor: "#ef4444", animation: "wsp-spin 0.8s linear infinite" }} />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setDocumentToDelete(doc); }}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-opacity flex-shrink-0"
                                    style={{ marginLeft: 6, background: "transparent", border: "none", cursor: "pointer" }}
                                    title="Delete document"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    );
                })}

                {!hasDocuments && uploadedFiles.length === 0 && (
                    <div style={{ padding: "28px 16px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                        No documents yet. Drop files above to get started.
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={!!documentToDelete}
                onClose={() => setDocumentToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Document"
                message={`Are you sure you want to delete "${documentToDelete?.filename}"? This action cannot be undone.`}
            />
        </div>
    );
}
