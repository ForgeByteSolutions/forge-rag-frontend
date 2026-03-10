"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });
const TextViewer = dynamic(() => import("@/components/TextViewer"), { ssr: false });
const DocxViewer = dynamic(() => import("@/components/DocxViewer"), { ssr: false });
const SpreadsheetViewer = dynamic(() => import("@/components/SpreadsheetViewer"), { ssr: false });
const ImageViewer = dynamic(() => import("@/components/ImageViewer"), { ssr: false });

export default function DocumentViewer({ citation, onClose }) {
    if (!citation) return null;

    const lowerName = (citation.source || "").toLowerCase();

    if (lowerName.endsWith(".pdf"))
        return <PdfViewer citation={citation} docId={citation.doc_id} docName={citation.source} onClose={onClose} />;

    if (lowerName.endsWith(".docx"))
        return <DocxViewer citation={citation} docId={citation.doc_id} docName={citation.source} onClose={onClose} />;

    if (lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls"))
        return <SpreadsheetViewer citation={citation} docId={citation.doc_id} docName={citation.source} onClose={onClose} />;

    const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"];
    if (imageExts.some(ext => lowerName.endsWith(ext)))
        return <ImageViewer citation={citation} docId={citation.doc_id} docName={citation.source} onClose={onClose} />;

    const textExts = [".txt", ".md", ".json", ".xml", ".py", ".js", ".ts", ".jsx", ".tsx", ".css", ".html", ".log"];
    if (textExts.some(ext => lowerName.endsWith(ext)))
        return <TextViewer citation={citation} docId={citation.doc_id} docName={citation.source} onClose={onClose} />;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white">
                <h3 className="text-sm font-bold text-gray-900 truncate">{citation.source}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <h3 className="text-gray-900 font-bold">Preview Not Available</h3>
            </div>
        </div>
    );
}
