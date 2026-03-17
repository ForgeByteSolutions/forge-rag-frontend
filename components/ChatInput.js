"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSendMessage, loading, selectedDocName, themed }) {
    const [text, setText] = useState("");
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [text]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!text.trim() || loading || text.length > 4000) return;
        onSendMessage(text);
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="wsp-input-area" style={{ 
            background: themed ? "rgba(255,255,255,0.7)" : "#fff",
            backdropFilter: themed ? "blur(8px)" : "none",
            borderTop: "1px solid rgba(0,0,0,.07)",
            padding: "18px 24px"
        }}>
            <textarea
                ref={textareaRef}
                className="wsp-textarea wsp-dm"
                placeholder={selectedDocName ? `Ask about ${selectedDocName}…` : "Send a message…"}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
            />
            <button
                className="wsp-send"
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
            >
                {loading ? (
                    <div style={{ width: 22, height: 22, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "wsp-spin 1s linear infinite" }} />
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                )}
            </button>
        </div>
    );
}
