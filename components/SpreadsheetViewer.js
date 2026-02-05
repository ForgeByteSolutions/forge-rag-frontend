"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { getToken } from "@/lib/auth";

export default function SpreadsheetViewer({ citation, docId, docName, onClose }) {
    const [html, setHtml] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [scale, setScale] = useState(1.0);
    const tableRef = useRef(null);
    const token = getToken();

    const fileUrl = useMemo(() => {
        return `${process.env.NEXT_PUBLIC_API_BASE}/documents/${docId}/raw?token=${token}`;
    }, [docId, token]);

    // Unified highlighting function with robust fuzzy matching
    const applyHighlight = () => {
        if (!citation?.snippet || !tableRef.current) return false;

        // Query all cells
        const cells = Array.from(tableRef.current.querySelectorAll('td'));
        if (!cells.length) return false;

        // Reset previous highlights
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.boxShadow = 'none';
        });

        // Prepare snippet: clean and tokenize
        const cleanText = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
        const snippetText = cleanText(citation.snippet);
        const snippetWords = snippetText.split(' ').filter(w => w.length > 2);

        if (snippetWords.length === 0) return false;

        // Strategy: N-gram matching
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

        cells.forEach(cell => {
            const cellText = cleanText(cell.textContent || "");
            if (cellText.length < 2) return;

            let isMatch = false;

            // Check 1: Direct containment
            if (snippetText.includes(cellText) || cellText.includes(snippetText)) {
                isMatch = true;
            }
            // Check 2: Trigram match
            else {
                const cellWords = cellText.split(' ');
                if (cellWords.length >= 3) {
                    const cellTrigrams = generateNgrams(cellWords, 3);
                    if (cellTrigrams.some(gram => trigrams.has(gram))) isMatch = true;
                }
                // Check 3: Bigram match
                if (!isMatch && cellWords.length >= 2) {
                    const cellBigrams = generateNgrams(cellWords, 2);
                    if (cellBigrams.some(gram => bigrams.has(gram))) isMatch = true;
                }
            }

            if (isMatch) {
                cell.style.backgroundColor = 'rgba(252, 211, 77, 0.4)';
                cell.style.boxShadow = 'inset 0 0 0 2px rgba(252, 211, 77, 0.4)';
                if (!firstMatch) firstMatch = cell;
            }
        });

        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            return true;
        }

        return false;
    };

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        async function fetchAndRender() {
            try {
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load file: ${response.statusText}`);
                }
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();

                if (!isMounted) return;

                // Parse workbook
                const wb = XLSX.read(arrayBuffer, { type: 'array' });

                // Get first sheet
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Convert to HTML
                const sheetHtml = XLSX.utils.sheet_to_html(ws, {
                    id: "spreadsheet-table",
                    editable: false
                });

                setHtml(sheetHtml);
                setLoading(false);

                // Trigger highlight after render
                setTimeout(() => {
                    if (isMounted) applyHighlight();
                }, 100);
            } catch (err) {
                console.error("Spreadsheet rendering error:", err);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        fetchAndRender();

        return () => {
            isMounted = false;
        };
    }, [fileUrl]);

    // Re-highlight when citation changes
    useEffect(() => {
        if (!loading) {
            applyHighlight();
        }
    }, [citation, loading]);

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm z-10 w-full">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-green-50 p-2 rounded-lg shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                            {docName}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Spreadsheet View
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Zoom Controls */}
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-black/5">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="px-2 font-bold text-gray-400 hover:text-gray-600 text-sm"
                            title="Zoom Out"
                        >
                            -
                        </button>
                        <span className="text-[10px] font-bold text-gray-500 w-12 text-center select-none">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                            className="px-2 font-bold text-gray-400 hover:text-gray-600 text-sm"
                            title="Zoom In"
                        >
                            +
                        </button>
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

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 p-8 scroll-smooth">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-green-600"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parsing Spreadsheet...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">Failed to Render</h3>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                ) : (
                    <div className="flex justify-center w-full">
                        <div
                            ref={tableRef}
                            className="bg-white shadow-sm border border-black/5 rounded-sm overflow-auto transition-transform duration-200 origin-top"
                            style={{
                                transform: `scale(${scale})`,
                                maxHeight: 'none' // Ensure no height restriction
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: html }}
                                className="w-full"
                            />
                            <style jsx global>{`
                                #spreadsheet-table {
                                    border-collapse: collapse;
                                    width: 100%;
                                    font-size: 13px;
                                    table-layout: auto;
                                }
                                #spreadsheet-table td, #spreadsheet-table th {
                                    border: 1px solid #e5e7eb;
                                    padding: 8px 12px;
                                    text-align: left;
                                    white-space: nowrap;
                                    color: #374151;
                                }
                                #spreadsheet-table tr:first-child td {
                                    background-color: #f9fafb;
                                    font-weight: 600;
                                    color: #111827;
                                    border-bottom: 2px solid #e5e7eb;
                                }
                                #spreadsheet-table tr:nth-child(even) {
                                    background-color: #f9fafb;
                                }
                                #spreadsheet-table tr:hover {
                                    background-color: #f3f4f6;
                                }
                            `}</style>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
