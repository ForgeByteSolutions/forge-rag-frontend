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
        </header>
    );
}
