"use client";

import { useEffect } from "react";
import "@/styles/chatThemes.css";

// Theme definitions — matches files in /public/themes/
const THEMES = [
    { id: "default", name: "Default", image: null },
    { id: "t1", name: "Theme 1", image: "/themes/0bd3c3a423c2d9607ab7b8679195e7c9.jpg" },
    { id: "t2", name: "Theme 2", image: "/themes/10aee9b950c1a0b2513eb59968b2b078.jpg" },
    { id: "t3", name: "Theme 3", image: "/themes/10bdcee5acece5da5ea77a89d61ee653.jpg" },
    { id: "t4", name: "Theme 4", image: "/themes/1d3c9efa19b1cf37a3ae92f032423337.jpg" },
    { id: "t5", name: "Theme 5", image: "/themes/3acc191dc9a273e58fb08dadcc190c63.jpg" },
    { id: "t6", name: "Theme 6", image: "/themes/9ae79506c718899f9c11e56dfb826a1e.jpg" },
    { id: "t7", name: "Theme 7", image: "/themes/bc01d892e9da3f9caf23d873fe7486f7.jpg" },
    { id: "t8", name: "Theme 8", image: "/themes/download (12).jpg" },
    { id: "t9", name: "Theme 9", image: "/themes/e00ae23732a78d97a061d03e7b6d3636.jpg" },
];

export default function ThemePickerModal({ open, onClose, activeTheme, setActiveTheme }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;


    return (
        <div className="cb-theme-overlay" onClick={onClose}>
            <div className="cb-theme-modal" onClick={e => e.stopPropagation()}>

                {/* Modal header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, fontSize: 18,
                            background: "linear-gradient(135deg,rgba(18,184,205,.12),rgba(18,184,205,.26))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>🎨</div>
                        <div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Chat Background</p>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, marginTop: 2 }}>Pick a theme to personalise your chat</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: "1.5px solid rgba(0,0,0,.1)",
                            background: "rgba(0,0,0,.04)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, color: "#6b7280",
                        }}
                    >✕</button>
                </div>

                {/* Theme grid */}
                <div className="cb-theme-grid">
                    {THEMES.map(t => {
                        const isSelected = t.image === null
                            ? activeTheme === null
                            : activeTheme === t.image;
                        return (
                            <div
                                key={t.id}
                                className={`cb-theme-card${isSelected ? " cb-selected" : ""}`}
                                onClick={() => { setActiveTheme(t.image); onClose(); }}
                                title={t.name}
                            >
                                {t.image
                                    ? <img src={t.image} alt={t.name} />
                                    : <div className="cb-default-thumb">⬜</div>
                                }
                                <div className="cb-label">{t.name}</div>
                                <div className="cb-tick">
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="2,6 5,9 10,3" />
                                    </svg>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
