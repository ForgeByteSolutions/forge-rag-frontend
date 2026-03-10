"use client";

import { Syne, DM_Sans } from "next/font/google";
import "@/styles/workspace.css";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", variable: "--font-dm" });

export default function WorkspaceHeader({ workspaceName, docCount, onFilePick }) {
    return (
        <header style={{
            height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", borderBottom: "1px solid rgba(0,0,0,.07)",
            background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", flexShrink: 0,
            zIndex: 10,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <a href="/dashboard" className="wsp-btn-outline" style={{ textDecoration: "none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Dashboard
                </a>
                <div>
                    <h1 className={`${syne.variable} wsp-syne`} style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                        {workspaceName}
                    </h1>
                    <p className={`${dmSans.variable} wsp-dm`} style={{ fontSize: 10, color: "#9ca3af", letterSpacing: ".07em", marginTop: 1 }}>
                        WORKSPACE · {docCount} document{docCount !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>
            {/* Upload button */}
            <label className="wsp-btn" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Files
                <input
                    type="file"
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={onFilePick}
                />
            </label>
        </header>
    );
}
