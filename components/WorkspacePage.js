"use client";

import { useParams } from "next/navigation";
import { Syne, DM_Sans } from "next/font/google";

// Components
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import DocumentsPanel from "@/components/workspace/DocumentsPanel";
import ChatPanel from "@/components/workspace/ChatPanel";
import RiskPanelContainer from "@/components/workspace/RiskPanelContainer";
import ContractPromptModal from "@/components/workspace/ContractPromptModal";
import OcrModal from "@/components/workspace/OcrModal";

// Hooks
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceDocuments } from "@/hooks/useWorkspaceDocuments";
import { useWorkspaceUpload } from "@/hooks/useWorkspaceUpload";
import { useWorkspaceChat } from "@/hooks/useWorkspaceChat";
import { useWorkspaceRisk } from "@/hooks/useWorkspaceRisk";

import "@/styles/workspace.css";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", variable: "--font-dm" });

export default function WorkspacePage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    // — Workspace metadata —
    const { workspaceName } = useWorkspace(workspaceId);

    // — Documents + risk map —
    const {
        workspaceDocs, riskMap, setRiskMap,
        setDocsRefreshKey, selectedDocIds, setSelectedDocIds,
    } = useWorkspaceDocuments(workspaceId);

    // — Risk tab logic —
    const {
        rightTab, setRightTab,
        riskLoading,
        selectedRiskDocId, setSelectedRiskDocId,
        contractPrompt, setContractPrompt,
        handleDocRiskClick, handleContractRisk,
    } = useWorkspaceRisk({ riskMap, setRiskMap });

    // — Upload queue + OCR detection —
    const {
        uploadedFiles,
        pendingUploadFiles, setPendingUploadFiles,
        dragOver, setDragOver,
        addFiles,
        handleFilePick, handleDrop,
    } = useWorkspaceUpload({
        workspaceId,
        onUploadSuccess: () => setDocsRefreshKey(k => k + 1),
        onContractDetected: (prompt) => setContractPrompt(prompt),
    });

    // — Chat —
    const { messages, question, setQuestion, streaming, model, setModel, handleSend } = useWorkspaceChat(workspaceId);

    const contractDocs = Object.entries(riskMap);
    const hasRisk = contractDocs.length > 0;
    const hasDocuments = workspaceDocs.length > 0 || uploadedFiles.length > 0;

    return (
        <div className={`${syne.variable} ${dmSans.variable} wsp-dm flex flex-col h-screen w-screen overflow-hidden`}>

            {/* Top Bar */}
            <WorkspaceHeader
                workspaceName={workspaceName}
                docCount={workspaceDocs.length}
                onFilePick={handleFilePick}
            />

            {/* Body */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* Left: Documents Panel */}
                <DocumentsPanel
                    workspaceDocs={workspaceDocs}
                    uploadedFiles={uploadedFiles}
                    selectedDocIds={selectedDocIds}
                    setSelectedDocIds={setSelectedDocIds}
                    riskMap={riskMap}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    onFilePick={handleFilePick}
                    onDrop={handleDrop}
                    onRiskClick={handleDocRiskClick}
                    onDeleteSuccess={() => setDocsRefreshKey(k => k + 1)}
                />

                {/* Right: Chat / Risk Panel */}
                <div className="wsp-right" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

                    {/* Contract Detected Overlay */}
                    <ContractPromptModal
                        contractPrompt={contractPrompt}
                        onChat={() => { setRightTab("chat"); setContractPrompt(null); }}
                        onRisk={handleContractRisk}
                    />

                    {/* Risk analyzing spinner */}
                    {riskLoading && !contractPrompt && (
                        <div style={{
                            position: "absolute", top: 58, left: "50%", transform: "translateX(-50%)",
                            zIndex: 10, display: "flex", alignItems: "center", gap: 8,
                            background: "#fff", border: "1px solid rgba(18,184,205,.3)",
                            borderRadius: 99, padding: "6px 14px", boxShadow: "0 2px 12px rgba(0,0,0,.08)",
                            animation: "wsp-badge .3s ease",
                        }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid #12b8cd", borderTopColor: "transparent", animation: "wsp-spin .8s linear infinite" }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#12b8cd" }}>Analysing document…</span>
                        </div>
                    )}

                    {/* Tab header */}
                    <div style={{
                        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 20px", borderBottom: "1px solid rgba(0,0,0,.07)",
                        background: "#fff", flexShrink: 0,
                    }}>
                        {hasRisk ? (
                            <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 3 }}>
                                {["chat", "risk"].map(tab => (
                                    <button key={tab}
                                        onClick={() => { setRightTab(tab); setContractPrompt(null); }}
                                        style={{
                                            padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                                            fontSize: 12, fontWeight: 700,
                                            background: rightTab === tab ? "#fff" : "transparent",
                                            color: rightTab === tab ? "#12b8cd" : "#9ca3af",
                                            boxShadow: rightTab === tab ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                                            transition: "all .2s",
                                        }}>
                                        {tab === "chat" ? "💬 Chat" : (
                                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                </svg>
                                                Risk Analysis ({contractDocs.length})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="wsp-syne" style={{ fontSize: 13, fontWeight: 700, color: "#374151", letterSpacing: ".03em" }}>Workspace Chat</p>
                        )}

                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={{
                                fontSize: 12, border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 8,
                                padding: "5px 10px", background: "#fff", outline: "none",
                                fontFamily: "var(--font-dm), sans-serif", color: "#374151", cursor: "pointer",
                            }}
                        >
                            <option value="meta-llama/Llama-3.3-70B-Instruct">Llama 3.3 70B (Free)</option>
                            <option value="gpt-4o-mini">GPT-4o Mini (Paid)</option>
                        </select>
                    </div>

                    {/* Risk tab content */}
                    {rightTab === "risk" && hasRisk && (
                        <RiskPanelContainer
                            contractDocs={contractDocs}
                            selectedRiskDocId={selectedRiskDocId}
                            setSelectedRiskDocId={setSelectedRiskDocId}
                            riskMap={riskMap}
                        />
                    )}

                    {/* Chat tab content */}
                    {rightTab === "chat" && (
                        <ChatPanel
                            messages={messages}
                            question={question}
                            setQuestion={setQuestion}
                            streaming={streaming}
                            onSend={() => handleSend(selectedDocIds)}
                            hasDocuments={hasDocuments}
                            selectedDocIds={selectedDocIds}
                        />
                    )}
                </div>
            </div>

            {/* OCR Engine Modal */}
            <OcrModal
                files={pendingUploadFiles}
                onCancel={() => setPendingUploadFiles(null)}
                onSubmit={(engine) => {
                    addFiles(pendingUploadFiles, engine);
                    setPendingUploadFiles(null);
                }}
            />
        </div>
    );
}
