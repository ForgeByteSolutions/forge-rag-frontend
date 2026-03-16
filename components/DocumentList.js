"use client";

import { useState, useEffect } from "react";
import { getDocuments, deleteDocument } from "@/lib/api";

export default function DocumentList({ selectedDocId, onSelectDoc }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchDocs() {
        try {
            const docs = await getDocuments();
            setDocuments(docs || []);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleDelete = async (e, docId) => {
        e.preventDefault();
        e.stopPropagation(); // prevent selecting the document
        if (!confirm("Are you sure you want to delete this document?")) return;
        
        try {
            await deleteDocument(docId);
            if (selectedDocId === docId) onSelectDoc(null);
            await fetchDocs();
        } catch (err) {
            console.error("Failed to delete document:", err);
            alert("Failed to delete document");
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-2 text-sm text-gray-500 animate-pulse">
                Loading documents...
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Documents
            </h3>

            {/* Dashboard Link */}
            <button
                onClick={() => onSelectDoc(null)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${selectedDocId === null
                    ? "bg-[#343541] text-white"
                    : "text-gray-300 hover:bg-[#2a2b32]"
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="truncate text-sm font-medium">Dashboard</span>
            </button>

            {documents.length === 0 ? (
                <div className="px-3 py-4 text-xs text-gray-500 italic">
                    No documents uploaded yet
                </div>
            ) : (
                documents.map((doc) => (
                    <div
                        key={doc.id}
                        onClick={() => onSelectDoc(doc)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group cursor-pointer ${selectedDocId === doc.id
                            ? "bg-[#343541] text-white"
                            : "text-gray-300 hover:bg-[#2a2b32]"
                            }`}
                    >
                        <div className="flex items-center gap-3 min-w-0" style={{ maxWidth: '85%' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm">{doc.filename}</span>
                                <span className="text-[10px] text-gray-500">
                                    {(doc.file_size / 1024).toFixed(0)} KB • {new Date(doc.upload_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => handleDelete(e, doc.id)}
                            className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete document"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
