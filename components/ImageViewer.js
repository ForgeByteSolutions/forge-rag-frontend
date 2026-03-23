"use client";
 
import { useMemo, useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
 
export default function ImageViewer({ citation, docId, docName, onClose }) {
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [imgSrc, setImgSrc] = useState(null);
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
                if (!res.ok) throw new Error("Failed to load image");
                const blob = await res.blob();
                if (isMounted) {
                    setImgSrc(URL.createObjectURL(blob));
                    setLoading(false);
                }
            })
            .catch(err => {
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
            <div className="h-14 border-b border-black/5 flex items-center justify-between px-6 shrink-0 bg-white shadow-sm z-10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                            {docName}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Image Viewer
                        </p>
                    </div>
                </div>
 
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-black/5">
                        <button onClick={() => setScale(s => Math.max(0.1, s - 0.2))} className="px-2 font-bold text-gray-400 hover:text-gray-600">-</button>
                        <span className="text-[10px] font-bold text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(5, s + 0.2))} className="px-2 font-bold text-gray-400 hover:text-gray-600">+</button>
                    </div>
 
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                        title="Close Viewer"
                    >
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
 
            <div className="flex-1 overflow-auto bg-[#f8f9fa] relative flex items-center justify-center p-8">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-[#12b8cd]"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Image...</span>
                        </div>
                    </div>
                )}
               
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <p className="text-red-500 font-bold">{error}</p>
                    </div>
                )}
 
                {!loading && !error && imgSrc && (
                    <div
                        className="shadow-[0_0_50px_rgba(0,0,0,0.1)] bg-white transform-gpu origin-center overflow-hidden flex items-center justify-center relative"
                        style={{
                            transform: `scale(${scale})`,
                            transition: "transform 0.15s ease-out",
                            minWidth: "fit-content",
                            minHeight: "fit-content",
                            margin: "auto"
                        }}
                    >
                        <img
                            src={imgSrc}
                            alt={docName}
                            className="max-w-full max-h-full object-contain"
                            draggable={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
 
 