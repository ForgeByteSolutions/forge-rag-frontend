import { useState } from "react";
import ThinkingLoader from "./ThinkingLoader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function ChatMessage({ message, onViewCitation, themed, onFeedback, onRunEval }) {
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalDone, setEvalDone] = useState(false);
  const isAi = message.type === "ai";

  // Only real DB UUIDs (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) can be evaluated.
  // Temporary IDs (Date.now() numbers) don't exist in the DB yet.
  const isRealId = typeof message.id === "string" && /^[0-9a-f-]{36}$/i.test(message.id);

  const handleEval = async () => {
    if (!isRealId || evalLoading) return;
    console.log("[Eval] Running eval for message id:", message.id);
    setEvalLoading(true);
    try {
      await onRunEval?.(message.id);
      setEvalDone(true);
      setTimeout(() => setEvalDone(false), 4000);
    } catch (err) {
      console.error("[Eval] Failed:", err?.response?.data?.detail || err.message);
    } finally {
      setEvalLoading(false);
    }
  };

    return (
        <div className={`wsp-msg ${isAi ? "ai" : "user"}`} style={{ 
            marginTop: 16, 
            marginBottom: 16,
            marginLeft: isAi ? 24 : "auto",
            marginRight: isAi ? "auto" : 24,
            maxWidth: "85%"
        }}>
            {isAi ? (
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
                    <div className="wsp-bubble-ai wsp-dm" style={{ position: "relative", flex: 1 }}>
                        {!message.content ? <ThinkingLoader /> : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {message.content}
                            </ReactMarkdown>
                        )}

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,.05)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {message.citations.map((cite, idx) => (
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
                                        onClick={() => onViewCitation?.(cite)}
                                    >
                                        <span style={{ fontSize: 13 }}>📄</span>
                                        <span>{cite.source} (p.{cite.page})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Feedback Actions */}
                        {message.id && (
                            <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                                {/* Run Eval button — only clickable once backend UUID is assigned */}
                                {!message.feedback_submitted && (
                                    <button
                                        onClick={handleEval}
                                        disabled={evalLoading || evalDone || !isRealId}
                                        title={!isRealId ? "Waiting for message to be saved..." : evalDone ? "Evaluation queued — results appear in the Evals panel" : "Run RAG evaluation on this response"}
                                        style={{
                                            background: evalDone ? "#f0fdf4" : "transparent",
                                            border: evalDone ? "1px solid #86efac" : "1px solid rgba(0,0,0,0.08)",
                                            cursor: (!isRealId || evalLoading || evalDone) ? "not-allowed" : "pointer",
                                            padding: "3px 8px", borderRadius: 6,
                                            fontSize: 11, fontWeight: 700,
                                            color: evalDone ? "#3bb978" : !isRealId ? "#d1d5db" : "#94a3b8",
                                            display: "flex", alignItems: "center", gap: 4,
                                            opacity: !isRealId ? 0.4 : 1,
                                            transition: "all .2s"
                                        }}
                                    >
                                        {evalLoading ? (
                                            <div style={{ width: 10, height: 10, border: "1.5px solid #94a3b8", borderTopColor: "transparent", borderRadius: "50%", animation: "wsp-spin 0.8s linear infinite" }} />
                                        ) : evalDone ? (
                                            <> ✓ Queued </>
                                        ) : (
                                            <> ⚡ Eval </>
                                        )}
                                    </button>
                                )}
                                {/* Thumbs Up */}
                                <button
                                    onClick={() => onFeedback?.(message.id, '1')}
                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                                    title="Good response"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={message.user_feedback === '1' ? "#3bb978" : "none"} stroke={message.user_feedback === '1' ? "#3bb978" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                </button>
                                {/* Thumbs Down */}
                                <button
                                    onClick={() => onFeedback?.(message.id, '-1')}
                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                                    title="Bad response"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={message.user_feedback === '-1' ? "#ef4444" : "none"} stroke={message.user_feedback === '-1' ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className="wsp-bubble-user wsp-dm">{message.content}</div>
            )}
        </div>
    );
}
