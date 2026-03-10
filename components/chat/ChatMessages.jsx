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
}) {
    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pb-40"
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
                <div className="h-full flex flex-col items-center justify-center text-center px-6 pt-20">
                    <h1 className="text-4xl font-bold text-gray-200 mb-8">FORGE INTELLI OCR</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                        <div className="p-4 border border-black/10 rounded-xl hover:bg-gray-50 transition-colors cursor-default text-left">
                            <span className="text-sm font-medium block mb-1">Upload Documents</span>
                            <span className="text-xs text-gray-500">Add PDFs to your knowledge base to ask questions about them.</span>
                        </div>
                        <div className="p-4 border border-black/10 rounded-xl hover:bg-gray-50 transition-colors cursor-default text-left">
                            <span className="text-sm text-gray-500">Select specific documents in the sidebar to narrow down your search.</span>
                        </div>
                    </div>
                </div>
            ) : (
                messages.map((m, idx) => (
                    <ChatMessage
                        key={m.id || idx}
                        message={m}
                        onViewCitation={onViewCitation}
                        themed={!!activeTheme}
                    />
                ))
            )}
        </div>
    );
});

export default ChatMessages;
