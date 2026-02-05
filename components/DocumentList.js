"use client";

import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/api";

export default function DocumentList({ selectedDocId, onSelectDoc }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDocs() {
            try {
                const data = await getDocuments();
                setDocuments(data.documents);
            } catch (err) {
                console.error("Failed to fetch documents:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDocs();
    }, []);

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

            {/* "All Documents" option */}
            <button
                onClick={() => onSelectDoc(null)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${selectedDocId === null
                        ? "bg-[#343541] text-white"
                        : "text-gray-300 hover:bg-[#2a2b32]"
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="truncate text-sm">All Documents</span>
            </button>

            {documents.length === 0 ? (
                <div className="px-3 py-4 text-xs text-gray-500 italic">
                    No documents uploaded yet
                </div>
            ) : (
                documents.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => onSelectDoc(doc)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${selectedDocId === doc.id
                                ? "bg-[#343541] text-white"
                                : "text-gray-300 hover:bg-[#2a2b32]"
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm">{doc.filename}</span>
                            <span className="text-[10px] text-gray-500">
                                {(doc.file_size / 1024).toFixed(0)} KB • {new Date(doc.upload_date).toLocaleDateString()}
                            </span>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
}
