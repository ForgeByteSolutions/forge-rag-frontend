"use client";

import { useEffect, useState, useMemo } from "react";
import { getToken } from "@/lib/auth";

export default function TextViewer({ citation, docId, docName, onClose }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = getToken();
    const fileUrl = useMemo(() => {
        return `${process.env.NEXT_PUBLIC_API_BASE}/documents/${docId}/raw?token=${token}`;
    }, [docId, token]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        fetch(fileUrl)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Failed to load file: ${res.statusText}`);
                }
                const text = await res.text();
                if (isMounted) {
                    setContent(text);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [fileUrl]);

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                            {docName}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Text View
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                        title="Close Viewer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
                <div className="bg-white border border-black/5 rounded-sm shadow-sm p-8 min-h-full max-w-4xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-100 border-t-blue-500"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Text...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="bg-red-50 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">Failed to Load</h3>
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    ) : (
                        <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                            {content}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
