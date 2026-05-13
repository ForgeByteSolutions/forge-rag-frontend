"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { isLoggedIn, getToken } from "@/lib/auth";
import { createWorkspace } from "@/lib/api";

import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import RiskPanel from "@/components/RiskPanel";

import SidebarToggle from "@/components/dashboard/SidebarToggle";
import DashboardHome from "@/components/dashboard/DashboardHome";
import DocumentViewer from "@/components/dashboard/DocumentViewer";
import ContractChoiceScreen from "@/components/dashboard/ContractChoiceScreen";
import RiskDashboardModal from "@/components/dashboard/RiskDashboardModal";
import OcrEngineModal from "@/components/dashboard/OcrEngineModal";

import { useDocumentSync } from "@/hooks/useDocumentSync";
import { useUploadDocument } from "@/hooks/useUploadDocument";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";

import "@/styles/dashboard.css";

const SIDEBAR_WIDTH = 250;

export default function DashboardMain() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [refreshSidebar, setRefreshSidebar] = useState(0);
    const [activeCitation, setActiveCitation] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [creatingWorkspace, setCreatingWorkspace] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Hooks
    const [selectedDoc, setSelectedDoc] = useDocumentSync(router);

    const { executeUpload, handleFileUpload, uploading, pendingFile, setPendingFile } = useUploadDocument({
        onSuccess: () => setRefreshSidebar(prev => prev + 1),
        router,
    });

    const {
        riskData, riskLoading,
        showRiskDashboard, setShowRiskDashboard,
        allRisksData, loadingAllRisks,
        handleOpenRiskDashboard,
    } = useRiskAnalysis(searchParams, selectedDoc);

    // Run auth check only on the client (after hydration) so localStorage is always available.
    useEffect(() => {
        setMounted(true);
        if (!isLoggedIn()) router.push("/login");
        else setIsAuthChecking(false);
    }, [router]);

    useEffect(() => {
        if (selectedDoc) setSidebarOpen(true);
    }, [selectedDoc]);

    const handleSelectDoc = (doc) => {
        if (doc) router.push(`/dashboard?doc=${doc.id}`);
        else router.push("/dashboard");
        setActiveCitation(null);
    };

    const handleCreateWorkspace = async (name) => {
        try {
            setCreatingWorkspace(true);
            const ws = await createWorkspace(name);
            router.push(`/workspace?id=${ws.id}`);
        } catch (err) {
            console.error("Create workspace failed:", err);
            alert("❌ Failed to create workspace.");
        } finally {
            setCreatingWorkspace(false);
        }
    };

    const tab = searchParams?.get("tab");

    if (!mounted || isAuthChecking) return null;

    return (
        <div className={`flex h-screen w-screen overflow-hidden bg-white relative`}>

            {/* Floating Sidebar Toggle */}
            <SidebarToggle
                open={sidebarOpen}
                sidebarWidth={SIDEBAR_WIDTH}
                onClick={() => setSidebarOpen(v => !v)}
            />

            {/* Sidebar */}
            <div className="sb-wrapper" style={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}>
                <div style={{ width: SIDEBAR_WIDTH, height: '100%' }}>
                    <Sidebar
                        key={`sidebar-${refreshSidebar}`}
                        refreshKey={refreshSidebar}
                        selectedDocId={selectedDoc?.id || null}
                        onSelectDoc={handleSelectDoc}
                        onUploadSuccess={() => setRefreshSidebar(prev => prev + 1)}
                        onUpload={handleFileUpload}
                        uploading={uploading}
                    />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">

                {/* Top-right action buttons (dashboard home only) */}
                {!selectedDoc && (
                    <div style={{ position: "fixed", top: 12, right: 16, zIndex: 60, display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            onClick={handleOpenRiskDashboard}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
                                background: "#fff", color: "#ef4444", border: "1.5px solid #fca5a5",
                                borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
                                cursor: "pointer", boxShadow: "0 2px 10px rgba(239,68,68,.1)",
                                transition: "transform .15s, box-shadow .15s, background .15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(239,68,68,.2)"; e.currentTarget.style.background = "#fef2f2"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(239,68,68,.1)"; e.currentTarget.style.background = "#fff"; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            YOUR RISKS
                        </button>

                        <button
                            onClick={() => router.push("/usage")}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
                                background: "linear-gradient(135deg,#12b8cd,#3bb978)", color: "#fff",
                                border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700,
                                letterSpacing: ".04em", cursor: "pointer",
                                boxShadow: "0 2px 10px rgba(18,184,205,.35)",
                                transition: "transform .15s, box-shadow .15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(18,184,205,.4)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(18,184,205,.35)"; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            AI GOVERNANCE
                        </button>
                    </div>
                )}

                {/* Document Viewer panel */}
                <div className={`h-full border-r border-black/5 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${activeCitation ? "flex-[1.2] opacity-100" : "flex-0 w-0 opacity-0 invisible"}`}>
                    <DocumentViewer citation={activeCitation} onClose={() => setActiveCitation(null)} />
                </div>

                {/* Chat / Risk / Upload */}
                <main className="h-full flex flex-col min-w-0 overflow-hidden flex-1">
                    {selectedDoc ? (
                        tab === "choice" ? (
                            <ContractChoiceScreen doc={selectedDoc} router={router} />
                        ) : tab === "risk" ? (
                            <div className="h-full flex flex-col overflow-hidden">
                                <div className="h-14 border-b border-black/10 flex items-center justify-between px-6 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <span className="text-base font-semibold text-gray-900">Risk Analysis</span>
                                        <span className="text-xs text-gray-400 truncate max-w-xs">{selectedDoc.filename}</span>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/dashboard?doc=${selectedDoc.id}`)}
                                        className="text-sm text-[#12b8cd] font-semibold hover:underline"
                                    >
                                        Switch to Chat →
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {riskLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4">
                                            <div className="h-10 w-10 border-4 border-gray-100 border-t-[#12b8cd] rounded-full animate-spin" />
                                            <p className="text-sm text-gray-400">Analyzing contract risks…</p>
                                        </div>
                                    ) : (
                                        <RiskPanel analysis={riskData} docName={selectedDoc.filename} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <ChatBox
                                selectedDocId={selectedDoc?.id || null}
                                selectedDocName={selectedDoc?.filename || null}
                                onViewCitation={setActiveCitation}
                                onSwitchToRisk={() => router.push(`/dashboard?doc=${selectedDoc.id}&tab=risk`)}
                                isCitationActive={!!activeCitation}
                            />
                        )
                    ) : (
                        <DashboardHome
                            onUpload={handleFileUpload}
                            uploading={uploading}
                            sidebarOpen={sidebarOpen}
                            onCreateWorkspace={handleCreateWorkspace}
                            creatingWorkspace={creatingWorkspace}
                        />
                    )}
                </main>
            </div>

            {/* Risk Dashboard Modal */}
            <RiskDashboardModal
                open={showRiskDashboard}
                onClose={() => setShowRiskDashboard(false)}
                data={allRisksData}
                loading={loadingAllRisks}
                router={router}
            />

            {/* OCR Engine Modal */}
            <OcrEngineModal
                file={pendingFile}
                onCancel={() => setPendingFile(null)}
                onSubmit={(engine) => {
                    executeUpload(pendingFile, engine);
                    setPendingFile(null);
                }}
            />
        </div>
    );
}