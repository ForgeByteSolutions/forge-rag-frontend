"use client";

import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/styles/workspace.css";

const mdComponents = {
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
        : <code style={{ display: 'block', background: '#f3f4f6', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0 0.8rem', fontSize: '0.85em', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid #e5e7eb' }} {...props} />,
};

export default function ChatPanel({
    messages,
    question,
    setQuestion,
    streaming,
    onSend,
    hasDocuments,
    selectedDocIds,
    onFeedback,
    onRunEval,
}) {
    const chatScrollRef = useRef(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    // Scroll to bottom when messages update
    // Note: parent should also keep ref if needed for full control
    const handleChange = (e) => {
        setQuestion(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
    };

    return (
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
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                            {msg.content}
                                        </ReactMarkdown>

                                        {/* Citations */}
                                        {msg.citations && msg.citations.length > 0 && (
                                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,.05)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                {msg.citations.map((cite, idx) => (
                                                    <div
                                                        key={idx}
                                                        title={cite.snippet}
                                                        style={{
                                                            padding: "4px 10px", background: "#f8fafc", border: "1px solid #e2e8f0",
                                                            borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#64748b",
                                                            display: "flex", alignItems: "center", gap: 6,
                                                            cursor: "help", transition: "all .2s"
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#12b8cd"; e.currentTarget.style.background = "#fff"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
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

                                        {/* Actions Footer */}
                                        {!msg.streaming && msg.id && (
                                            <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                                                {/* ⚡ Eval button */}
                                                <button
                                                    onClick={() => onRunEval?.(msg.id)}
                                                    title="Run RAG evaluation on this response"
                                                    style={{
                                                        background: "transparent",
                                                        border: "1px solid rgba(0,0,0,0.08)",
                                                        cursor: "pointer",
                                                        padding: "3px 8px", borderRadius: 6,
                                                        fontSize: 11, fontWeight: 700,
                                                        color: "#94a3b8",
                                                        display: "flex", alignItems: "center", gap: 4,
                                                    }}
                                                >
                                                    ⚡ Eval
                                                </button>
                                                {/* Thumbs Up */}
                                                <button
                                                    onClick={() => onFeedback?.(msg.id, '1')}
                                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                                                    title="Good response"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={msg.user_feedback === '1' ? "#3bb978" : "none"} stroke={msg.user_feedback === '1' ? "#3bb978" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                                </button>
                                                {/* Thumbs Down */}
                                                <button
                                                    onClick={() => onFeedback?.(msg.id, '-1')}
                                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                                                    title="Bad response"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={msg.user_feedback === '-1' ? "#ef4444" : "none"} stroke={msg.user_feedback === '-1' ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                                                </button>
                                            </div>
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
                    className="wsp-textarea wsp-dm"
                    placeholder={
                        hasDocuments
                            ? (selectedDocIds?.size > 0
                                ? `Ask a question about ${selectedDocIds.size} selected document(s)…`
                                : "Ask a question about your documents…")
                            : "Upload documents to start chatting…"
                    }
                    value={question}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={streaming}
                />
                <button
                    className="wsp-send"
                    onClick={onSend}
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
    );
}
