"use client";

import "@/styles/dashboard.css";

export default function UploadingModal({ open }) {
    if (!open) return null;
    return (
        <div className="dh-overlay" style={{ zIndex: 9999 }}>
            <div className="dh-card w-full max-w-sm flex flex-col items-center gap-4 px-6 py-8" style={{ background: '#fff', animation: 'dh-fade-in 0.3s ease-out forwards' }}>
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
                <div className="text-center mt-2">
                    <p className="dh-syne text-base font-semibold text-gray-900 mb-1.5">Processing your document</p>
                    <p className="dh-dm text-xs text-gray-500 tracking-wide">Uploading · Chunking · Embedding</p>
                </div>
                <div className="w-full max-w-xs mt-2">
                    <div className="flex justify-between items-center mb-2.5">
                        <span className="dh-dm text-[11px] text-gray-500 font-semibold tracking-wider uppercase">Indexing</span>
                        <span className="dh-badge">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#12b8cd] animate-pulse inline-block mr-1.5" />Live
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg,#12b8cd,#3bb978)', animation: 'dh-progress 3s ease-in-out infinite alternate' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
