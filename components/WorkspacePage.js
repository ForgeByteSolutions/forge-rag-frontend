"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { isLoggedIn, getToken } from "@/lib/auth";
import { uploadDocumentToWorkspace, getWorkspaces, getWorkspaceDocuments, streamChat, analyzeRisk, getChatHistory } from "@/lib/api";
import RiskPanel from "./RiskPanel";
import { Syne, DM_Sans } from "next/font/google";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", variable: "--font-dm" });

const WS_STYLES = `
    .wsp-syne { font-family: var(--font-syne), sans-serif; }
    .wsp-dm   { font-family: var(--font-dm), sans-serif; }

    @keyframes wsp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes wsp-spin  { to{transform:rotate(360deg)} }
    @keyframes wsp-fade  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes wsp-badge { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
    @keyframes wsp-check { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
    @keyframes wsp-progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
    @keyframes wsp-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes wsp-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    .wsp-bg {
        background-color: #f7f8fa;
        background-image:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(18,184,205,.08) 0%, transparent 70%),
            linear-gradient(rgba(18,184,205,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(18,184,205,.03) 1px, transparent 1px);
        background-size: auto, 28px 28px, 28px 28px;
    }
    /* Left panel */
    .wsp-left {
        width: 320px;
        min-width: 260px;
        flex-shrink: 0;
        background: #fff;
        border-right: 1px solid rgba(0,0,0,.07);
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }
    /* Drop zone */
    .wsp-drop {
        border: 2px dashed rgba(18,184,205,.3);
        border-radius: 14px;
        background: linear-gradient(145deg, rgba(18,184,205,.02), rgba(18,184,205,.06));
        cursor: pointer;
        transition: border-color .2s, background .2s;
        position: relative;
    }
    .wsp-drop:hover, .wsp-drop.drag-over {
        border-color: rgba(18,184,205,.65);
        background: linear-gradient(145deg, rgba(18,184,205,.05), rgba(18,184,205,.11));
    }
    /* File card */
    .wsp-file-card {
        background: #f9fafb;
        border: 1px solid rgba(0,0,0,.06);
        border-radius: 10px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: wsp-fade .35s ease forwards;
        transition: border-color .2s;
    }
    .wsp-file-card:hover { border-color: rgba(18,184,205,.2); }
    /* Progress */
    .wsp-prog-bar { height: 3px; border-radius: 3px; background: #f0f0f0; overflow:hidden; margin-top:5px; }
    .wsp-prog-fill { height: 100%; border-radius:3px; background:linear-gradient(90deg,#12b8cd,#34d399); animation: wsp-progress 1.4s ease-in-out infinite; width:30%; }
    /* Badge */
    .wsp-badge {
        display:inline-flex; align-items:center;
        padding:3px 10px; border-radius:999px;
        background:rgba(18,184,205,.08); border:1px solid rgba(18,184,205,.16);
        color:#3bb978; font-size:11px; font-weight:600; letter-spacing:.04em;
    }
    /* Btn */
    .wsp-btn {
        background:linear-gradient(135deg,#12b8cd,#3bb978);
        color:#fff; border:none; border-radius:10px;
        padding:10px 22px;
        font-family:var(--font-syne),sans-serif;
        font-weight:700; font-size:13px; letter-spacing:.04em;
        cursor:pointer;
        box-shadow:0 4px 14px rgba(18,184,205,.35);
        transition:transform .17s,box-shadow .17s;
    }
    .wsp-btn:hover { transform:translateY(-2px); box-shadow:0 7px 20px rgba(18,184,205,.45); }
    .wsp-btn:active { transform:translateY(0); }
    .wsp-btn-outline {
        background:transparent;
        color:#12b8cd; border:1.5px solid rgba(18,184,205,.3); border-radius:9px;
        padding:7px 16px; font-size:12px;
        font-family:var(--font-syne),sans-serif;
        font-weight:700; cursor:pointer;
        display:flex; align-items:center; gap:5px;
        transition:all .2s;
    }
    .wsp-btn-outline:hover { background:rgba(18,184,205,.06); border-color:rgba(18,184,205,.5); }
    /* Chat right panel */
    .wsp-right {
        flex:1;
        display:flex;
        flex-direction:column;
        overflow:hidden;
        background: #f7f8fa;
    }
    .wsp-chat-scroll {
        flex:1; overflow-y:auto; padding:24px 28px;
        display:flex; flex-direction:column; gap:16px;
    }
    .wsp-chat-scroll::-webkit-scrollbar { width:4px; }
    .wsp-chat-scroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,.12); border-radius:4px; }
    /* Messages */
    .wsp-msg { animation: wsp-msg-in .3s ease forwards; max-width:78%; }
    .wsp-msg.user { align-self:flex-end; }
    .wsp-msg.ai { align-self:flex-start; }
    .wsp-bubble-user {
        background: linear-gradient(135deg,#12b8cd,#3bb978);
        color:#fff; padding:12px 18px; border-radius:18px 18px 4px 18px;
        font-size:14px; line-height:1.55;
        box-shadow:0 3px 12px rgba(18,184,205,.28);
    }
    .wsp-bubble-ai {
        background:#fff;
        border: 1px solid rgba(0,0,0,.07);
        color:#111827; padding:14px 20px; border-radius:18px 18px 18px 4px;
        font-size:14px; line-height:1.6;
        box-shadow:0 2px 8px rgba(0,0,0,.06);
    }
    /* Input bar */
    .wsp-input-area {
        padding:16px 24px;
        background:#fff;
        border-top:1px solid rgba(0,0,0,.07);
        display:flex; gap:10px; align-items:flex-end;
        flex-shrink:0;
    }
    .wsp-textarea {
        flex:1; resize:none; border:1.5px solid rgba(0,0,0,.1); border-radius:12px;
        padding:12px 16px; font-size:14px; outline:none;
        font-family:var(--font-dm),sans-serif;
        transition:border-color .2s,box-shadow .2s;
        max-height:140px; min-height:46px; line-height:1.5;
        background:#f9fafb;
    }
    .wsp-textarea:focus {
        border-color:#12b8cd;
        box-shadow:0 0 0 3px rgba(18,184,205,.1);
        background:#fff;
    }
    .wsp-send {
        width:44px; height:44px; border-radius:12px;
        background:linear-gradient(135deg,#12b8cd,#3bb978);
        border:none; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 3px 10px rgba(18,184,205,.35);
        transition:transform .17s,box-shadow .17s;
        flex-shrink:0;
    }
    .wsp-send:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(18,184,205,.45); }
    .wsp-send:disabled { opacity:.5; cursor:not-allowed; transform:none; }
    /* Empty chat state */
    .wsp-chat-empty {
        flex:1; display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        color:#9ca3af; gap:14px; padding:40px;
        text-align:center;
    }
    .wsp-dotgrid {
        background-image:radial-gradient(circle,rgba(18,184,205,.12) 1px,transparent 1px);
        background-size:22px 22px;
    }
    .wsp-scroll-left { flex:1; overflow-y:auto; padding:12px; }
    .wsp-scroll-left::-webkit-scrollbar { width:3px; }
    .wsp-scroll-left::-webkit-scrollbar-thumb { background:rgba(0,0,0,.1); border-radius:3px; }
`;

const FILE_ICONS = {
    pdf: { color: "#ef4444", label: "PDF" },
    docx: { color: "#3b82f6", label: "DOCX" },
    txt: { color: "#6b7280", label: "TXT" },
    csv: { color: "#22c55e", label: "CSV" },
    xlsx: { color: "#22c55e", label: "XLSX" },
    xls: { color: "#22c55e", label: "XLS" },
};

function FileTypeBadge({ ext }) {
    const info = FILE_ICONS[ext] || { color: "#6b7280", label: ext?.toUpperCase() || "?" };
    return (
        <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: `${info.color}18`, border: `1.5px solid ${info.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: info.color }}>{info.label}</span>
        </div>
    );
}

export default function WorkspacePage() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [workspaceName, setWorkspaceName] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]); // files being uploaded (with status)
    const [workspaceDocs, setWorkspaceDocs] = useState([]);  // already-uploaded docs from API
    const [selectedDocIds, setSelectedDocIds] = useState(new Set()); // docs selected for chat scoping
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Chat
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [model, setModel] = useState("meta-llama/Llama-3.3-70B-Instruct");
    const chatScrollRef = useRef(null);
    const textareaRef = useRef(null);

    // Risk Analysis — one entry per doc_id
    const [rightTab, setRightTab] = useState("chat"); // "chat" | "risk"
    const [riskMap, setRiskMap] = useState({});        // { doc_id: { analysis, filename } }
    const [riskLoading, setRiskLoading] = useState(false);
    const [selectedRiskDocId, setSelectedRiskDocId] = useState(null);
    // Contract detection prompt: { docName }
    const [contractPrompt, setContractPrompt] = useState(null);

    const [docsRefreshKey, setDocsRefreshKey] = useState(0);

    // Load workspace name
    useEffect(() => {
        if (!isLoggedIn()) { router.push("/login"); return; }
        async function loadWorkspace() {
            try {
                const data = await getWorkspaces();
                const ws = data.workspaces?.find(w => w.id === workspaceId);
                setWorkspaceName(ws ? ws.name : "Workspace");
            } catch { setWorkspaceName("Workspace"); }
        }
        loadWorkspace();
    }, [workspaceId]);

    // Load existing workspace documents
    useEffect(() => {
        if (!workspaceId) return;
        async function loadDocs() {
            try {
                const data = await getWorkspaceDocuments(workspaceId);
                const docs = Array.isArray(data) ? data : (data?.documents || []);
                setWorkspaceDocs(docs);

                // Populate riskMap permanently
                const newRiskMap = {};
                docs.forEach(d => {
                    if (d.risk_analysis) {
                        try {
                            newRiskMap[d.id] = { analysis: typeof d.risk_analysis === 'string' ? JSON.parse(d.risk_analysis) : d.risk_analysis, filename: d.filename };
                        } catch (e) { }
                    }
                });
                setRiskMap(prev => ({ ...prev, ...newRiskMap }));
            } catch (err) {
                console.error("Failed to load workspace docs:", err);
            }
        }
        loadDocs();
    }, [workspaceId, docsRefreshKey]);

    // Load workspace chat history on mount
    useEffect(() => {
        if (!workspaceId) return;
        async function loadHistory() {
            try {
                const data = await getChatHistory(null, workspaceId);
                const history = data?.history || [];
                if (history.length > 0) {
                    setMessages(history.map((msg, i) => ({
                        id: i,
                        role: msg.role === "user" ? "user" : "ai",
                        content: msg.content,
                        citations: msg.citations || [],
                        streaming: false,
                    })));
                }
            } catch (err) {
                console.error("Failed to load workspace chat history:", err);
            }
        }
        loadHistory();
    }, [workspaceId]);

    // Scroll chat to bottom when messages change
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages]);

    // === File upload logic ===
    const addFiles = (newFiles) => {
        const entries = Array.from(newFiles).map((file, idx) => ({
            id: `${Date.now()}-${idx}-${file.name}`,
            file,
            status: "pending",
            result: null,
            error: null,
        }));
        setUploadedFiles(prev => [...prev, ...entries]);
        entries.forEach(entry => startUpload(entry));
    };

    const startUpload = async (entry) => {
        setUploadedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "uploading" } : f));
        try {
            const result = await uploadDocumentToWorkspace(entry.file, workspaceId);
            setUploadedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "done", result } : f));
            // Refresh doc list
            setDocsRefreshKey(k => k + 1);

            // ── Use fast is_contract flag from upload response (no extra API call needed) ──
            if (result?.is_contract && result?.doc_id) {
                setContractPrompt({ docName: entry.file.name, doc_id: result.doc_id });
            }
        } catch (err) {
            setUploadedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error", error: err.message || "Upload failed" } : f));
        }
    };

    const handleFilePick = (e) => {
        if (e.target.files?.length) addFiles(e.target.files);
        e.target.value = "";
    };
    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    };

    // === Chat logic ===
    const handleSend = async () => {
        const q = question.trim();
        if (!q || streaming) return;
        setQuestion("");
        const userMsg = { role: "user", content: q };
        setMessages(prev => [...prev, userMsg]);
        setStreaming(true);

        // Add placeholder AI message
        const aiMsgId = Date.now();
        setMessages(prev => [...prev, { role: "ai", content: "", id: aiMsgId, streaming: true }]);

        try {
            await streamChat({
                question: q,
                workspace_id: workspaceId,
                doc_ids: selectedDocIds.size > 0 ? Array.from(selectedDocIds) : null,
                model: model,
                onToken: (token) => {
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, content: m.content + token } : m
                    ));
                },
                onCitations: (cites) => {
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, citations: cites } : m
                    ));
                },
            });
        } catch (err) {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: "⚠️ Failed to get a response. Please try again.", streaming: false } : m
            ));
        } finally {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, streaming: false } : m
            ));
            setStreaming(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const allDocs = workspaceDocs;
    const hasDocuments = allDocs.length > 0 || uploadedFiles.length > 0;
    const contractDocs = Object.entries(riskMap); // [[doc_id, {analysis, filename}], ...]
    const hasRisk = contractDocs.length > 0;
    const activeRisk = selectedRiskDocId ? riskMap[selectedRiskDocId] : null;

    // Trigger risk analysis for an existing saved doc (on click)
    const handleDocRiskClick = async (doc) => {
        if (riskMap[doc.id]) {
            // Already analyzed — just switch tab
            setSelectedRiskDocId(doc.id);
            setRightTab("risk");
            return;
        }
        setRiskLoading(true);
        try {
            const analysis = await analyzeRisk({ doc_id: doc.id });
            // Show risk panel as long as the API returned something useful
            if (analysis) {
                setRiskMap(prev => ({ ...prev, [doc.id]: { analysis, filename: doc.filename } }));
                setSelectedRiskDocId(doc.id);
                setRightTab("risk");
            } else {
                alert(`Risk analysis returned no data for "${doc.filename}".`);
            }
        } catch (e) {
            console.warn("Risk analysis failed:", e);
            alert(`⚠️ Risk analysis failed for "${doc.filename}". Please try again.`);
        } finally {
            setRiskLoading(false);
        }
    };

    return (
        <div className={`${syne.variable} ${dmSans.variable} wsp-dm flex flex-col h-screen w-screen overflow-hidden`}>
            <style>{WS_STYLES}</style>

            {/* ── TOP BAR ── */}
            <header style={{
                height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px", borderBottom: "1px solid rgba(0,0,0,.07)",
                background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", flexShrink: 0,
                zIndex: 10,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="wsp-btn-outline"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Dashboard
                    </button>
                    <div>
                        <h1 className="wsp-syne" style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                            {workspaceName}
                        </h1>
                        <p className="wsp-dm" style={{ fontSize: 10, color: "#9ca3af", letterSpacing: ".07em", marginTop: 1 }}>
                            WORKSPACE · {allDocs.length} document{allDocs.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                {/* upload button */}
                <label className="wsp-btn" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Files
                    <input
                        type="file"
                        accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFilePick}
                    />
                </label>
            </header>

            {/* ── BODY ── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* ═══ LEFT: Documents Panel ═══ */}
                <div className="wsp-left">
                    {/* Drop zone */}
                    <div
                        className={`wsp-drop wsp-dotgrid ${dragOver ? "drag-over" : ""}`}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ margin: "14px 14px 0", padding: "22px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                    >
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: "linear-gradient(135deg,rgba(18,184,205,.1),rgba(18,184,205,.22))",
                            border: "1.5px solid rgba(18,184,205,.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            animation: "wsp-float 3.5s ease-in-out infinite"
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p className="wsp-syne" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Drop documents here</p>
                            <p className="wsp-dm" style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>or click to browse</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleFilePick}
                        />
                    </div>

                    {/* Document list header */}
                    <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <p className="wsp-syne" style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: ".06em", textTransform: "uppercase" }}>
                            Documents
                        </p>
                        {allDocs.length > 0 && (
                            <span className="wsp-badge">{allDocs.length}</span>
                        )}
                    </div>

                    {/* Scrollable doc list */}
                    <div className="wsp-scroll-left">
                        {/* Uploading files (in-progress only — done files already appear in workspaceDocs) */}
                        {uploadedFiles.filter(f => f.status !== "done").map((f, i) => {
                            const ext = f.file.name.split(".").pop().toLowerCase();
                            return (
                                <div key={f.id} className="wsp-file-card" style={{ marginBottom: 8, animationDelay: `${i * 0.05}s` }}>
                                    <FileTypeBadge ext={ext} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="wsp-dm" style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {f.file.name}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#9ca3af" }}>{(f.file.size / 1024).toFixed(1)} KB</p>
                                        {f.status === "uploading" && <div className="wsp-prog-bar"><div className="wsp-prog-fill" /></div>}
                                        {f.status === "error" && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{f.error}</p>}
                                    </div>
                                    {f.status === "done" && (
                                        <>
                                            <button
                                                onClick={() => f.result?.doc_id ? handleDocRiskClick({ id: f.result.doc_id, filename: f.file.name }) : null}
                                                title={f.result?.doc_id && riskMap[f.result.doc_id] ? "View risk analysis" : "Run risk analysis"}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: "none",
                                                    background: f.result?.doc_id && riskMap[f.result.doc_id] ? "linear-gradient(135deg,#12b8cd,#3bb978)" : "#f3f4f6",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", transition: "all .2s", marginRight: 8
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: f.result?.doc_id && riskMap[f.result.doc_id] ? "brightness(0) invert(1)" : "none" }}>
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                </svg>
                                            </button>
                                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#12b8cd,#3bb978)", display: "flex", alignItems: "center", justifyContent: "center", animation: "wsp-check .4s ease", flexShrink: 0 }}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                    {f.status === "uploading" && (
                                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2.5px solid #e5e7eb", borderTopColor: "#12b8cd", animation: "wsp-spin 1s linear infinite", flexShrink: 0 }} />
                                    )}
                                </div>
                            );
                        })}

                        {/* Already-saved documents */}
                        {allDocs.map((doc, i) => {
                            const ext = doc.filename.split(".").pop().toLowerCase();
                            const isAnalyzed = !!riskMap[doc.id];
                            const isSelected = selectedDocIds.has(doc.id);
                            return (
                                <div
                                    key={doc.id}
                                    className="wsp-file-card"
                                    style={{
                                        marginBottom: 8,
                                        animationDelay: `${i * 0.05}s`,
                                        background: isSelected ? "rgba(18,184,205,.05)" : "#fff",
                                        borderColor: isSelected ? "#12b8cd" : "rgba(0,0,0,.06)",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        const newSet = new Set(selectedDocIds);
                                        if (newSet.has(doc.id)) newSet.delete(doc.id);
                                        else newSet.add(doc.id);
                                        setSelectedDocIds(newSet);
                                    }}
                                >
                                    <FileTypeBadge ext={ext} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="wsp-dm" style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {doc.filename}
                                        </p>
                                        <p style={{ fontSize: 11, color: "#9ca3af" }}>
                                            {(doc.file_size / 1024).toFixed(1)} KB · {new Date(doc.upload_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {/* Risk Analysis button per doc */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDocRiskClick(doc); }}
                                        title={isAnalyzed ? "View risk analysis" : "Run risk analysis"}
                                        style={{
                                            width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: "none",
                                            background: isAnalyzed ? "linear-gradient(135deg,#12b8cd,#3bb978)" : "#f3f4f6",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer", transition: "all .2s",
                                            marginLeft: "auto"
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isAnalyzed ? "brightness(0) invert(1)" : "none" }}>
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}

                        {!hasDocuments && uploadedFiles.length === 0 && (
                            <div style={{ padding: "28px 16px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                                No documents yet. Drop files above to get started.
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT: Chat Panel ═══ */}
                <div className="wsp-right" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

                    {/* ── Contract Detected Prompt ── */}
                    {contractPrompt && (
                        <div style={{
                            position: "absolute", inset: 0, zIndex: 20,
                            background: "rgba(247,248,250,.97)", backdropFilter: "blur(6px)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
                            padding: 32, animation: "wsp-fade .4s ease",
                        }}>
                            {/* Glow icon */}
                            <div style={{
                                width: 80, height: 80, borderRadius: 24,
                                background: "linear-gradient(135deg,rgba(18,184,205,.15),rgba(18,184,205,.30))",
                                border: "1.5px solid rgba(18,184,205,.3)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                animation: "wsp-float 3.5s ease-in-out infinite",
                            }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>

                            {/* Text */}
                            <div style={{ textAlign: "center" }}>
                                <p className="wsp-syne" style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
                                    Contract Detected
                                </p>
                                <p className="wsp-dm" style={{ fontSize: 13, color: "#6b7280", maxWidth: 320 }}>
                                    <span style={{ fontWeight: 600, color: "#374151" }}>{contractPrompt.docName}</span> was identified as a legal contract. What would you like to do?
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: 14 }}>
                                {/* Chat — dismiss prompt, stay on chat tab */}
                                <button
                                    onClick={() => { setRightTab("chat"); setContractPrompt(null); }}
                                    style={{
                                        padding: "12px 28px", borderRadius: 12,
                                        border: "1.5px solid rgba(0,0,0,.12)", background: "#fff",
                                        fontSize: 14, fontWeight: 700, color: "#374151", cursor: "pointer",
                                        display: "flex", alignItems: "center", gap: 8,
                                    }}>💬 Chat
                                </button>
                                {/* Risk Analysis — run the full analysis NOW (user confirmed intent) */}
                                <button
                                    onClick={async () => {
                                        const { doc_id, docName } = contractPrompt;
                                        setContractPrompt(null);
                                        setRiskLoading(true);
                                        try {
                                            const analysis = await analyzeRisk({ doc_id });
                                            setRiskMap(prev => ({ ...prev, [doc_id]: { analysis, filename: docName } }));
                                            setSelectedRiskDocId(doc_id);
                                            setRightTab("risk");
                                        } catch (e) {
                                            console.warn("Risk analysis failed:", e);
                                            alert("⚠️ Risk analysis failed. Please try again.");
                                        } finally {
                                            setRiskLoading(false);
                                        }
                                    }}
                                    style={{
                                        padding: "12px 28px", borderRadius: 12, border: "none",
                                        background: "linear-gradient(135deg,#12b8cd,#3bb978)",
                                        fontSize: 14, fontBold: 700, color: "#fff", cursor: "pointer",
                                        display: "flex", alignItems: "center", gap: 8,
                                        boxShadow: "0 4px 14px rgba(18,184,205,.35)",
                                    }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    Risk Analysis
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Risk Analyzing indicator (while LLM runs) ── */}
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

                    {/* ── Header ── */}
                    <div style={{
                        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 20px", borderBottom: "1px solid rgba(0,0,0,.07)",
                        background: "#fff", flexShrink: 0,
                    }}>
                        {/* Tab Toggle — always shown when any contract analyzed */}
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
                            <p className="wsp-syne" style={{ fontSize: 13, fontWeight: 700, color: "#374151", letterSpacing: ".03em" }}>
                                Workspace Chat
                            </p>
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

                    {/* ── Risk Analysis Tab Content — shows all analyzed contracts ── */}
                    {rightTab === "risk" && hasRisk && (
                        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                            {/* Doc selector when multiple contracts */}
                            {contractDocs.length > 1 && (
                                <div style={{
                                    padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,.07)",
                                    background: "#fff", display: "flex", alignItems: "center", gap: 10, flexShrink: 0
                                }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>Viewing:</span>
                                    <select
                                        value={selectedRiskDocId || ""}
                                        onChange={e => setSelectedRiskDocId(e.target.value)}
                                        style={{
                                            flex: 1, fontSize: 12, fontWeight: 600, color: "#374151",
                                            border: "1.5px solid rgba(0,0,0,.1)", borderRadius: 8,
                                            padding: "5px 10px", background: "#f8fafc", outline: "none", cursor: "pointer"
                                        }}
                                    >
                                        {contractDocs.map(([docId, { filename }]) => (
                                            <option key={docId} value={docId}>{filename}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {activeRisk
                                ? <RiskPanel analysis={activeRisk.analysis} docName={activeRisk.filename} />
                                : <div style={{ padding: 24, color: "#9ca3af", fontSize: 13 }}>Select a contract above to view its risk analysis.</div>
                            }
                        </div>
                    )}

                    {/* ── Chat Tab Content (only rendered when rightTab === chat) ── */}
                    {rightTab === "chat" && (
                        <div style={{ display: "contents" }}>

                            {/* Messages */}
                            <div className="wsp-chat-scroll" ref={chatScrollRef}>
                                {messages.length === 0 ? (
                                    <div className="wsp-chat-empty">
                                        <div style={{
                                            width: 70, height: 70, borderRadius: 20,
                                            background: "linear-gradient(135deg,rgba(18,184,205,.1),rgba(18,184,205,.22))",
                                            border: "1.5px solid rgba(18,184,205,.2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="wsp-syne" style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                                                Ask about your workspace
                                            </p>
                                            <p className="wsp-dm" style={{ fontSize: 13, color: "#9ca3af", maxWidth: 280 }}>
                                                Upload documents on the left, then ask any question — I'll find answers across all of them.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} className={`wsp-msg ${msg.role}`}>
                                            {msg.role === "user" ? (
                                                <div className="wsp-bubble-user wsp-dm">{msg.content}</div>
                                            ) : (
                                                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                                                        background: "linear-gradient(135deg,#12b8cd,#3bb978)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        marginTop: 2
                                                    }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                                                            <path d="M12 8v4l2 2" />
                                                        </svg>
                                                    </div>
                                                    <div className="wsp-bubble-ai wsp-dm" style={{ position: "relative" }}>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1rem 0 0.5rem', color: '#111827' }} {...props} />,
                                                                h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.8rem 0 0.4rem', color: '#111827' }} {...props} />,
                                                                h3: ({ node, ...props }) => <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.6rem 0 0.3rem', color: '#111827' }} {...props} />,
                                                                p: ({ node, ...props }) => <p style={{ margin: '0 0 0.8rem 0', lineHeight: 1.6 }} className="last:mb-0" {...props} />,
                                                                ul: ({ node, ...props }) => <ul style={{ margin: '0 0 0.8rem 0', paddingLeft: '1.5rem', listStyleType: 'disc' }} {...props} />,
                                                                ol: ({ node, ...props }) => <ol style={{ margin: '0 0 0.8rem 0', paddingLeft: '1.5rem', listStyleType: 'decimal' }} {...props} />,
                                                                li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                                                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 600, color: '#111827' }} {...props} />,
                                                                blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '3px solid #12b8cd', paddingLeft: '0.75rem', margin: '0.5rem 0 0.8rem', color: '#4b5563', fontStyle: 'italic' }} {...props} />,
                                                                code: ({ node, inline, ...props }) => inline
                                                                    ? <code style={{ background: '#f3f4f6', padding: '0.15rem 0.35rem', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace', color: '#db2777' }} {...props} />
                                                                    : <code style={{ display: 'block', background: '#f3f4f6', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0 0.8rem', fontSize: '0.85em', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid #e5e7eb' }} {...props} />
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>

                                                        {/* Citations */}
                                                        {msg.citations && msg.citations.length > 0 && (
                                                            <div style={{
                                                                marginTop: 14,
                                                                paddingTop: 12,
                                                                borderTop: "1px solid rgba(0,0,0,.05)",
                                                                display: "flex",
                                                                flexWrap: "wrap",
                                                                gap: 8
                                                            }}>
                                                                {msg.citations.map((cite, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        title={cite.snippet}
                                                                        style={{
                                                                            padding: "4px 10px",
                                                                            background: "#f8fafc",
                                                                            border: "1px solid #e2e8f0",
                                                                            borderRadius: 6,
                                                                            fontSize: 11,
                                                                            fontWeight: 600,
                                                                            color: "#64748b",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 6,
                                                                            cursor: "help",
                                                                            transition: "all .2s"
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.borderColor = "#12b8cd";
                                                                            e.currentTarget.style.background = "#fff";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.borderColor = "#e2e8f0";
                                                                            e.currentTarget.style.background = "#f8fafc";
                                                                        }}
                                                                    >
                                                                        <span style={{ fontSize: 13 }}>📄</span>
                                                                        <span>{cite.source} (p.{cite.page})</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {msg.streaming && (
                                                            <span style={{ display: "inline-block", width: 8, height: 16, background: "#12b8cd", borderRadius: 2, marginLeft: 2, animation: "wsp-pulse 1s infinite", verticalAlign: "middle" }} />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input area */}
                            <div className="wsp-input-area">
                                <textarea
                                    ref={textareaRef}
                                    className="wsp-textarea wsp-dm"
                                    placeholder={hasDocuments ? (selectedDocIds.size > 0 ? `Ask a question about ${selectedDocIds.size} selected document(s)…` : "Ask a question about your documents…") : "Upload documents to start chatting…"}
                                    value={question}
                                    onChange={(e) => {
                                        setQuestion(e.target.value);
                                        // Auto-resize
                                        e.target.style.height = "auto";
                                        e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                                    }}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    disabled={streaming}
                                />
                                <button
                                    className="wsp-send"
                                    onClick={handleSend}
                                    disabled={!question.trim() || streaming}
                                >
                                    {streaming ? (
                                        <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "wsp-spin 1s linear infinite" }} />
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
