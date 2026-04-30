"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { getToken } from "@/lib/auth";

const OcrViewer = dynamic(() => import("./OcrViewer"), { ssr: false });

export default function OcrHome({ sidebarOpen }) {
    const [uploading, setUploading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [progressStats, setProgressStats] = useState(null);
    const [engine, setEngine] = useState("tesseract");

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgressStats({ status: "Uploading" });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("engine", engine);

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}api/tools/ocr-pdf?token=${token}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Upload failed");
            }

            const data = await res.json();
            const taskId = data.data.task_id;
            
            // Poll for status
            let isComplete = false;
            while (!isComplete) {
                await new Promise(r => setTimeout(r, 2000));
                
                const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}api/tools/ocr-pdf/status/${taskId}?token=${token}`);
                if (!statusRes.ok) {
                    throw new Error("Failed to fetch task status");
                }
                const statusData = await statusRes.json();
                
                setProgressStats({
                    status: statusData.status,
                    pagesProcessed: statusData.pages_processed,
                    totalPages: statusData.total_pages
                });

                if (statusData.status === "COMPLETED") {
                    setOcrResult({
                        original_file_url: statusData.original_file_url,
                        processed_file_url: statusData.processed_file_url,
                        pages: statusData.total_pages,
                        engine: statusData.engine
                    });
                    isComplete = true;
                } else if (statusData.status === "FAILED") {
                    throw new Error(statusData.error_message || "OCR Processing failed");
                }
            }

        } catch (error) {
            console.error("OCR Error:", error);
            alert("Failed to process document: " + error.message);
        } finally {
            setUploading(false);
            setProgressStats(null);
        }
    };

    if (ocrResult) {
        return <OcrViewer result={ocrResult} onClose={() => setOcrResult(null)} />;
    }

    return (
        <div className={`dh-dm dh-bg flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto`}>
            
            <div className={`sb-logo dh-fade-1 flex items-center gap-3 mb-8 ${sidebarOpen ? 'hidden-logo' : ''}`}>
                <div className="dh-ring">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#12b8cd,#3bb978)', boxShadow: '0 6px 20px rgba(18,184,205,.4)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </div>
                </div>
                <div>
                    <h1 className="dh-syne dh-shimmer-text font-bold tracking-tight leading-none"
                        style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>
                        OCR UTILITIES
                    </h1>
                    <p className="dh-dm text-[9px] font-medium text-gray-500 tracking-[.2em] uppercase mt-1">
                        Searchable PDF Generator
                    </p>
                </div>
            </div>

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
                            <p className="dh-syne text-base font-semibold text-gray-900 mb-1.5">{progressStats?.status === 'Uploading' ? 'Uploading Document' : `Running ${engine.toUpperCase()} OCR`}</p>
                            <p className="dh-dm text-xs text-gray-500 tracking-wide">
                                {progressStats?.status === 'PROCESSING' && progressStats?.totalPages > 0 
                                    ? `Generating Searchable Document (${progressStats.totalPages} pages)...` 
                                    : 'Initializing Engine...'}
                            </p>
                        </div>
                        <div className="w-full max-w-xs mt-2">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full"
                                    style={{ background: 'linear-gradient(90deg,#12b8cd,#3bb978)', animation: 'dh-progress 15s ease-in-out infinite alternate' }} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="dh-drop dh-dotgrid flex flex-col items-center gap-4 px-6 py-8 m-3 block">
                        <div className="dh-float flex items-center justify-center rounded-xl"
                            style={{ width: 56, height: 56, background: 'linear-gradient(135deg,rgba(18,184,205,.1),rgba(18,184,205,.22))', border: '1.5px solid rgba(18,184,205,.2)', boxShadow: '0 6px 20px rgba(18,184,205,.15)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div className="text-center mb-2">
                            <p className="dh-syne text-base font-semibold text-gray-900 mb-1.5">Drop a scanned PDF here</p>
                            <p className="dh-dm text-xs text-gray-500 leading-relaxed">Will generate an exact copy with searchable text</p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 bg-gray-50 p-1 rounded-lg border border-black/5 relative" style={{ zIndex: 50, pointerEvents: 'auto' }}>
                            {['tesseract', 'textract', 'easyocr'].map((eng) => (
                                <button 
                                    key={eng}
                                    type="button"
                                    onClick={(e) => {
                                        setEngine(eng);
                                    }}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                                        engine === eng 
                                            ? 'bg-white shadow-sm text-[#12b8cd] border border-black/5' 
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {eng}
                                </button>
                            ))}
                        </div>

                        <label className="dh-btn cursor-pointer mt-2 block">
                            Choose PDF File
                            <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                        </label>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            <span className="dh-badge">Max 10MB</span>
                        </div>
                    </div>
                )}
            </div>
            
            <p className="dh-fade-3 dh-dm mt-8 text-[11px] text-gray-400 font-medium tracking-widest uppercase">
                Utility processes locally. File is NOT indexed for RAG chat.
            </p>
        </div>
    );
}

