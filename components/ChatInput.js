"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSendMessage, loading, selectedDocName }) {
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
        if (!text.trim() || loading) return;
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
        <div className="absolute bottom-0 left-0 w-full pt-6 pb-6 md:pb-10 px-4 bg-gradient-to-t from-white via-white to-white/0">
            <div className="max-w-2xl mx-auto">
                <div className="relative flex flex-col w-full py-3 flex-grow md:py-4 md:pl-4 relative border border-black/10 bg-white rounded-xl shadow-lg focus-within:ring-1 focus-within:ring-black/10 transition-all">

                    {/* Active Target Indicator */}
                    <div className="absolute -top-6 left-0 flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            Prompting:
                        </span>
                        <span className="text-[10px] font-semibold text-[#10a37f]">
                            {selectedDocName || "Global Dashboard"}
                        </span>
                    </div>

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-10 focus:ring-0 focus-visible:ring-0 pl-2 md:pl-0 text-base focus:outline-none max-h-[200px]"
                        disabled={loading}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || loading}
                        className={`absolute bottom-2 right-2 p-2 rounded-md transition-colors ${text.trim() && !loading
                            ? "bg-[#10a37f] text-white"
                            : "text-gray-300 bg-transparent"
                            }`}
                    >
                        {loading ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2 px-4 italic">
                    Forge RAG can make mistakes. Verify important info.
                </p>
            </div>
        </div>
    );
}
