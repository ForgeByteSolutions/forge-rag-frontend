"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { renderAsync } from "docx-preview";
import { getToken } from "@/lib/auth";

export default function DocxViewer({ citation, docId, docName, onClose }) {
    const docxRef = useRef(null);
    const viewportRef = useRef(null);
    const [scale, setScale] = useState(0.8);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = getToken();
    const fileUrl = useMemo(
        () =>
            `${process.env.NEXT_PUBLIC_API_BASE}/documents/${docId}/raw?token=${token}`,
        [docId, token]
    );

    // Unified highlighting function with robust fuzzy matching
    const applyHighlight = () => {
        if (!citation?.snippet || !docxRef.current) return false;

        // Query all content-bearing elements
        const elements = Array.from(docxRef.current.querySelectorAll('p, span, td, li, h1, h2, h3, h4, h5, h6'));
        if (!elements.length) return false;

        // Reset previous highlights
        elements.forEach(el => {
            el.style.backgroundColor = 'transparent';
            el.style.boxShadow = 'none';
            el.style.borderRadius = '0';
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

        elements.forEach(el => {
            const elText = cleanText(el.textContent || "");
            if (elText.length < 3) return;

            let isMatch = false;

            // Check 1: Direct containment
            if (elText.length >= 10 && (snippetText.includes(elText) || elText.includes(snippetText))) {
                isMatch = true;
            }
            // Check 2: Trigram match
            else {
                const elWords = elText.split(' ');
                if (elWords.length >= 3) {
                    const elTrigrams = generateNgrams(elWords, 3);
                    if (elTrigrams.some(gram => trigrams.has(gram))) isMatch = true;
                }
                // Check 3: Bigram match (if long enough)
                if (!isMatch && elWords.length >= 2) {
                    const elBigrams = generateNgrams(elWords, 2);
                    if (elBigrams.some(gram => bigrams.has(gram))) isMatch = true;
                }
            }

            if (isMatch) {
                el.style.backgroundColor = 'rgba(252, 211, 77, 0.4)';
                el.style.boxShadow = '0 0 0 2px rgba(252, 211, 77, 0.4)';
                el.style.borderRadius = '2px';
                if (!firstMatch) firstMatch = el;
            }
        });

        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
        }

        return false;
    };

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        async function loadDocx() {
            try {
                const res = await fetch(fileUrl);
                if (!res.ok) throw new Error("Failed to load document");

                const blob = await res.blob();
                if (!mounted) return;

                docxRef.current.innerHTML = "";

                await renderAsync(blob, docxRef.current, null, {
                    inWrapper: false,
                    breakPages: true,
                });

                // Remove inline styles that override our CSS
                if (mounted && docxRef.current) {
                    const sections = docxRef.current.querySelectorAll('section.docx');
                    sections.forEach(section => {
                        // Remove inline padding and width that docx-preview adds
                        section.style.padding = '';
                        section.style.width = '';
                        section.style.minHeight = '';
                    });
                }

                setLoading(false);
                // Trigger highlight after render
                setTimeout(() => {
                    if (mounted) applyHighlight();
                }, 100);
            } catch (e) {
                console.error(e);
                setError("Failed to render document");
                setLoading(false);
            }
        }

        loadDocx();
        return () => (mounted = false);
    }, [fileUrl]);

    // Re-highlight when citation changes
    useEffect(() => {
        if (!loading) {
            applyHighlight();
        }
    }, [citation, loading]);

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* ================= HEADER ================= */}
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                            {docName}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Word Document
                        </p>
                    </div>
                </div>

                {/* Zoom + Close */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-black/5">
                        <button
                            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                            className="px-2 font-bold text-gray-400 hover:text-gray-600"
                        >
                            –
                        </button>
                        <span className="text-[10px] font-bold text-gray-500 w-12 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
                            className="px-2 font-bold text-gray-400 hover:text-gray-600"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* ================= VIEWPORT ================= */}
            <div
                ref={viewportRef}
                className="flex-1 overflow-auto bg-[#f8f9fa] scroll-smooth"
            >
                <div className="min-w-full min-h-full flex justify-center p-8">
                    {/* FIXED-WIDTH SCALE WRAPPER */}
                    <div
                        style={{
                            width: "21cm",
                            transform: `scale(${scale})`,
                            transformOrigin: "top center",
                        }}
                    >
                        <div ref={docxRef} className="docx-pages" />
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-blue-600"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Rendering Document...
                        </span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center text-red-500">
                    {error}
                </div>
            )}

            {/* ================= DOCX OVERRIDES ================= */}
            <style jsx global>{`
        .docx-pages {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        section.docx {
          width: 21cm !important;
          min-height: 29.7cm !important;
          margin-bottom: 32px !important;
          padding: 2.54cm !important;
          background: white !important;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e5e7eb !important;
          box-sizing: border-box !important;
        }
        
        /* Ensure all content inside sections is properly contained */
        section.docx * {
          box-sizing: border-box !important;
        }
      `}</style>
        </div>
    );
}
