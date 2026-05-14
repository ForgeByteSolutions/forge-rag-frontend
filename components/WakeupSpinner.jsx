"use client";

import { useState, useEffect } from "react";
import "@/styles/dashboard.css";

export default function WakeupSpinner() {
    const [waking, setWaking] = useState(false);

    useEffect(() => {
        const handleStart = () => setWaking(true);
        const handleEnd = () => setWaking(false);

        window.addEventListener("backend-wakeup-start", handleStart);
        window.addEventListener("backend-wakeup-end", handleEnd);

        return () => {
            window.removeEventListener("backend-wakeup-start", handleStart);
            window.removeEventListener("backend-wakeup-end", handleEnd);
        };
    }, []);

    if (!waking) return null;

    return (
        <div className="dh-overlay" style={{ zIndex: 100000, flexDirection: 'column', gap: 16 }}>
            <div className="relative">
                <div className="rounded-xl flex items-center justify-center"
                    style={{ width: 80, height: 80, background: 'linear-gradient(135deg,rgba(18,184,205,.12),rgba(18,184,205,.24))', boxShadow: '0 4px 16px rgba(18,184,205,.18)' }}>
                    <svg className="dh-spin-anim w-12 h-12 text-[#12b8cd]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                </div>
            </div>
            <div className="text-center bg-white px-6 py-4 rounded-2xl shadow-xl border border-black/5" style={{ animation: 'dh-fade-in 0.3s ease-out forwards' }}>
                <p className="font-syne text-lg font-bold text-gray-900 mb-1">Server is waking up...</p>
                <p className="font-dm text-sm text-gray-500">This usually takes about 3-5 minutes. Thank you for your patience.</p>
            </div>
        </div>
    );
}
