"use client";

import React from "react";
import ChatMessage from "@/components/ChatMessage";

/**
 * Renders the scrollable messages area: loading state, empty state, or message list.
 * Memoized to prevent re-renders when unrelated parent state changes.
 */
const ChatMessages = React.memo(function ChatMessages({
    messages,
    historyLoading,
    onViewCitation,
    activeTheme,
    scrollRef,
    onFeedback,
    onRunEval,
}) {
    return (
        <div
            ref={scrollRef}
            className="wsp-chat-scroll flex-1"
            style={{ position: "relative", zIndex: 1 }}
        >
            {historyLoading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-4 border-gray-100 border-t-[#12b8cd] rounded-full animate-spin" />
                        <span className="text-sm text-gray-400 font-medium">Loading history...</span>
                    </div>
                </div>
            ) : messages.length === 0 ? (
                <div className="wsp-chat-empty">
                    <div style={{
                        width: 76, height: 76, borderRadius: 22,
                        background: "linear-gradient(135deg,rgba(18,184,205,.1),rgba(18,184,205,.22))",
                        border: "1.5px solid rgba(18,184,205,.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 10
                    }}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="wsp-syne" style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                            Global Intelligence
                        </p>
                        <p className="wsp-dm" style={{ fontSize: 13, color: "#9ca3af", maxWidth: 300, margin: '0 auto' }}>
                            Ask questions across all your uploaded documents — I'll find insights instantly or switch to a Workspace for focus.
                        </p>
                    </div>
                </div>
            ) : (
                messages.map((m, idx) => (
                    <ChatMessage
                        key={m.id || idx}
                        message={m}
                        onViewCitation={onViewCitation}
                        themed={!!activeTheme}
                        onFeedback={onFeedback}
                        onRunEval={onRunEval}
                    />
                ))
            )}
        </div>
    );
});

export default ChatMessages;
