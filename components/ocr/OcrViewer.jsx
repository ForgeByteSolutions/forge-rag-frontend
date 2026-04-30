"use client";

import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Import react-pdf styles
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function OcrViewer({ result, onClose }) {
    const [numPages, setNumPages] = useState(result.pages || null);
    const [pageNumber, setPageNumber] = useState(1);
    const [leftScale, setLeftScale] = useState(1.0);
    const [rightScale, setRightScale] = useState(1.0);

    // Results point to URLs returned from the API, e.g. /uploads/ocr_tools/...
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const originalUrl = `${baseUrl}${result.original_file_url}`;
    const processedUrl = `${baseUrl}${result.processed_file_url}`;

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#f8f9fa] relative dh-fade-1">
            {/* Header */}
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-[#12b8cd]/10 p-2 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">Searchable Document</h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Split View Comparison</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Page Controls */}
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-black/5">
                        <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="p-1 px-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 disabled:opacity-30">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-[11px] font-bold text-gray-500 px-3 w-16 text-center">{pageNumber} / {numPages || "..."}</span>
                        <button disabled={pageNumber >= (numPages || 0)} onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))} className="p-1 px-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 disabled:opacity-30">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Scale Controls */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-50 border border-black/5 rounded-lg py-1">
                            <span className="text-[9px] font-bold text-gray-400 pl-2 pr-1 uppercase tracking-wider">Left</span>
                            <button onClick={() => setLeftScale(s => Math.max(0.2, s - 0.1))} className="px-2 font-bold text-gray-400 hover:text-gray-600">-</button>
                            <span className="text-[10px] font-bold text-gray-500 w-10 text-center">{Math.round(leftScale * 100)}%</span>
                            <button onClick={() => setLeftScale(s => Math.min(3, s + 0.1))} className="px-2 font-bold text-gray-400 hover:text-gray-600">+</button>
                        </div>
                        <div className="flex items-center bg-[#f0f9fa] border border-[#12b8cd]/20 rounded-lg py-1 shadow-[0_0_10px_rgba(18,184,205,0.05)]">
                            <span className="text-[9px] font-bold text-[#12b8cd] pl-2 pr-1 uppercase tracking-wider">Right</span>
                            <button onClick={() => setRightScale(s => Math.max(0.2, s - 0.1))} className="px-2 font-bold text-[#12b8cd]/60 hover:text-[#12b8cd]">-</button>
                            <span className="text-[10px] font-bold text-[#12b8cd] w-10 text-center">{Math.round(rightScale * 100)}%</span>
                            <button onClick={() => setRightScale(s => Math.min(3, s + 0.1))} className="px-2 font-bold text-[#12b8cd]/60 hover:text-[#12b8cd]">+</button>
                        </div>
                    </div>

                    {/* Download Button */}
                    <a href={processedUrl} download
                        className="flex items-center gap-2 px-4 py-1.5 bg-[#12b8cd] text-white rounded-md text-[11px] font-bold tracking-wider hover:bg-[#0e9fac] transition-colors shadow-sm"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        DOWNLOAD PDF
                    </a>

                    <div className="w-[1px] h-6 bg-gray-200 mx-2"></div>

                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400" title="Close Viewer">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Split Screen Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Original */}
                <div className="flex-1 flex flex-col border-r border-black/10 overflow-hidden relative bg-gray-50">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm z-20 border border-black/5 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                        Original Scan
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                        <div className="shadow-[0_0_30px_rgba(0,0,0,0.06)] h-fit border border-black/5 bg-white rounded-sm transform-gpu origin-top">
                            <Document file={originalUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page pageNumber={pageNumber} scale={leftScale} width={450} renderTextLayer={false} renderAnnotationLayer={false} />
                            </Document>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Processed */}
                <div className="flex-1 flex flex-col overflow-hidden relative bg-[#f0f9fa]">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#12b8cd]/10 backdrop-blur px-4 py-1.5 rounded-full shadow-sm z-20 border border-[#12b8cd]/20 text-[10px] font-bold tracking-widest text-[#12b8cd] uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12b8cd] animate-pulse"></span>
                        Searchable Text
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                        <div className="shadow-[0_0_40px_rgba(18,184,205,0.1)] h-fit border border-[#12b8cd]/20 bg-white rounded-sm transform-gpu origin-top pdf-container-selectable">
                            <Document file={processedUrl}>
                                <Page pageNumber={pageNumber} scale={rightScale} width={450} renderTextLayer={true} renderAnnotationLayer={false} className="searchable-page" />
                            </Document>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                /* Add a subtle highlight to text selection in the right panel to make the 'searchable' feature obvious */
                .pdf-container-selectable ::selection {
                    background: rgba(18,184,205, 0.3) !important;
                }
                .searchable-page {
                    cursor: text !important;
                }
            `}</style>
        </div>
    );
}

