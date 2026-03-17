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

export default function ChatMessage({ message, onViewCitation, themed }) {
    const isAi = message.type === "ai";

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
                    </div>
                </div>
            ) : (
                <div className="wsp-bubble-user wsp-dm">{message.content}</div>
            )}
        </div>
    );
}
