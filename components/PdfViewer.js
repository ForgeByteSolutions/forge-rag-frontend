"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { getToken } from "@/lib/auth";

// Import react-pdf styles
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ citation, docId, docName, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1.0);

    const token = getToken();
    const pdfUrl = useMemo(() => {
        return `${process.env.NEXT_PUBLIC_API_BASE}/documents/${docId}/raw?token=${token}`;
    }, [docId, token]);

    // Update page number when citation changes
    useEffect(() => {
        if (citation?.page) {
            setPageNumber(citation.page);
        }
    }, [citation]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    // Unified highlighting function with robust fuzzy matching
    const applyHighlight = () => {
        // Clear previous image overlay if it exists
        const existingOverlay = document.getElementById("pdf-image-highlight-overlay");
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Only highlight bounding box if it's explicitly a vision citation.
        const isVisionCitation = ["vector_chart", "chart_table", "structured"].includes(citation?.source_type);
        if (citation?.image_bbox && isVisionCitation) {
            const pageElement = containerRef.current?.querySelector('.react-pdf__Page');
            if (!pageElement) return false;

            // PyMuPDF returns coordinates in raw PDF points (1/72 inch). 
            // react-pdf scales these according to the `scale` prop.
            // We need to render an absolute div relative to the `.react-pdf__Page`.
            const { x0, y0, x1, y1 } = citation.image_bbox;

            const overlay = document.createElement("div");
            overlay.id = "pdf-image-highlight-overlay";
            overlay.style.position = "absolute";
            overlay.style.left = `${x0 * scale}px`;
            overlay.style.top = `${y0 * scale}px`;
            overlay.style.width = `${(x1 - x0) * scale}px`;
            overlay.style.height = `${(y1 - y0) * scale}px`;

            // Styling to match text highlight
            overlay.style.backgroundColor = 'rgba(252, 211, 77, 0.4)';
            overlay.style.border = '2px solid rgba(252, 211, 77, 0.8)';
            overlay.style.borderRadius = '4px';
            overlay.style.pointerEvents = 'none'; // let clicks pass through
            overlay.style.zIndex = "10";

            pageElement.appendChild(overlay);
            overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });

            return true;
        }

        if (!isVisionCitation && citation?.source_type !== "text") {
            // It's some other non-text citation but has no valid box
            // Just return true to stop retries, we can't highlight it.
            return true;
        }

        if (!citation?.snippet) return false;

        const textLayer = containerRef.current?.querySelector(
            '.react-pdf__Page__textContent'
        );
        if (!textLayer) return false;

        const spans = Array.from(textLayer.querySelectorAll('span'));
        if (!spans.length) return false;

        // Reset
        spans.forEach(span => {
            span.style.backgroundColor = 'transparent';
            span.style.boxShadow = 'none';
            span.style.borderRadius = '0';
        });

        // Prepare snippet: clean and tokenize
        const cleanText = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
        const snippetText = cleanText(citation.snippet);
        const snippetWords = snippetText.split(' ').filter(w => w.length > 2);

        if (snippetWords.length === 0) return false;

        // Strategy 1: Bigram/Trigram matching (Good for long snippets crossing lines)
        const generateNgrams = (words, n) => {
            const grams = [];
            for (let i = 0; i <= words.length - n; i++) {
                grams.push(words.slice(i, i + n).join(' '));
            }
            return grams;
        };

        const bigrams = new Set(generateNgrams(snippetWords, 2));
        const trigrams = new Set(generateNgrams(snippetWords, 3));

        let firstMatch = null;
        let matchCount = 0;

        spans.forEach(span => {
            const spanText = cleanText(span.textContent || "");
            if (spanText.length < 3) return; // Skip noise

            let isMatch = false;

            // Check 1: Is a significant portion of the span in the snippet? (Reverse match)
            // Useful when the span is a shorter part of the full sentence (e.g. "cancer and")
            if (spanText.split(' ').length >= 2 && snippetText.includes(spanText)) {
                isMatch = true;
            }
            // Check 2: Does the span contain any unique bigrams/trigrams from the snippet?
            // Useful when the span is long and contains the snippet or parts of it
            else {
                const spanWords = spanText.split(' ');

                // Try to find at least one trigram match (strong signal)
                if (spanWords.length >= 3) {
                    const spanTrigrams = generateNgrams(spanWords, 3);
                    if (spanTrigrams.some(gram => trigrams.has(gram))) isMatch = true;
                }

                // If not, try bigrams (weaker signal, check for multiple or shortness)
                if (!isMatch && spanWords.length >= 2) {
                    const spanBigrams = generateNgrams(spanWords, 2);
                    if (spanBigrams.some(gram => bigrams.has(gram))) isMatch = true;
                }
            }

            if (isMatch) {
                span.style.backgroundColor = 'rgba(252, 211, 77, 0.4)';
                span.style.boxShadow = '0 0 0 2px rgba(252, 211, 77, 0.4)';
                span.style.borderRadius = '2px';
                matchCount++;
                if (!firstMatch) firstMatch = span;
            }
        });

        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
        }

        return false;
    };


    // Re-highlight trigger with retries
    useEffect(() => {
        let retries = 0;
        const maxRetries = 6;

        const tryHighlight = () => {
            const success = applyHighlight();
            if (!success && retries < maxRetries) {
                retries++;
                setTimeout(tryHighlight, 500);
            }
        };

        const timer = setTimeout(tryHighlight, 500);
        return () => clearTimeout(timer);
    }, [pageNumber, citation, scale]);

    const onPageRenderSuccess = () => {
        applyHighlight();
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm z-10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-red-50 p-2 rounded-lg shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                            {docName}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Page {pageNumber} of {numPages || "..."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-black/5">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            className="p-1 px-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 disabled:opacity-30 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1.5 px-2">
                            <input
                                type="number"
                                min={1}
                                max={numPages || 1}
                                value={pageNumber}
                                onChange={(e) => setPageNumber(Number(e.target.value))}
                                className="w-8 bg-transparent text-center text-[11px] font-bold focus:outline-none border-b border-transparent focus:border-[#10a37f]"
                            />
                            <span className="text-[10px] font-bold text-gray-300">/</span>
                            <span className="text-[10px] font-bold text-gray-400">{numPages || "..."}</span>
                        </div>
                        <button
                            disabled={pageNumber >= (numPages || 0)}
                            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
                            className="p-1 px-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 disabled:opacity-30 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-black/5">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="px-2 font-bold text-gray-400 hover:text-gray-600">-</button>
                        <span className="text-[10px] font-bold text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="px-2 font-bold text-gray-400 hover:text-gray-600">+</button>
                    </div>

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

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto bg-[#f8f9fa] scroll-smooth pdf-container"
            >
                <div className="flex flex-col items-center p-8 min-h-max">
                    <div className="shadow-[0_0_50px_rgba(0,0,0,0.1)] h-fit border border-black/5 bg-white rounded-sm mb-12 transform-gpu origin-top">
                        <Document
                            key={`doc_${docId}`}
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex items-center justify-center p-40 bg-white min-w-[500px]">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-[#10a37f]"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Document...</span>
                                    </div>
                                </div>
                            }
                        >
                            <Page
                                key={`page_${pageNumber}_scale_${scale}`}
                                pageNumber={pageNumber}
                                scale={scale}
                                renderAnnotationLayer={false}
                                renderTextLayer={true}
                                onRenderSuccess={onPageRenderSuccess}
                            />
                        </Document>
                    </div>
                </div>
            </div>
        </div>
    );
}
