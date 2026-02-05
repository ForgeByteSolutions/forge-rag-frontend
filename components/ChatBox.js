"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { streamChat, getChatHistory } from "@/lib/api";

export default function ChatBox({ selectedDocId, selectedDocName, onViewCitation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef(null);

  // Load chat history when doc changes
  useEffect(() => {
    async function loadHistory() {
      try {
        setHistoryLoading(true);
        const data = await getChatHistory(selectedDocId);
        // Map backend history to frontend message format
        const history = data.history.map((msg, idx) => ({
          id: `hist-${idx}`,
          type: msg.role,
          content: msg.content,
          citations: msg.citations
        }));
        setMessages(history);
      } catch (err) {
        console.error("Failed to load history:", err);
        setMessages([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, [selectedDocId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, historyLoading]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || loading) return;

    // Add user message
    const userMsg = { type: "user", content };
    setMessages((prev) => [...prev, userMsg]);

    // Add temporary AI message
    const aiMsgId = Date.now();
    setMessages((prev) => [...prev, { id: aiMsgId, type: "ai", content: "", citations: [] }]);

    setLoading(true);

    try {
      let fullAnswer = "";
      await streamChat({
        question: content,
        doc_id: selectedDocId,
        onToken: (token) => {
          fullAnswer += token;
          setMessages((prev) =>
            prev.map(m => m.id === aiMsgId ? { ...m, content: fullAnswer } : m)
          );
        },
        onCitations: (cites) => {
          setMessages((prev) =>
            prev.map(m => m.id === aiMsgId ? { ...m, citations: cites } : m)
          );
        },
      });
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map(m => m.id === aiMsgId ? { ...m, content: "Something went wrong while generating the answer." } : m)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-14 border-b border-black/10 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">Forge RAG Chat</span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-40"
      >
        {historyLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-gray-100 border-t-[#10a37f] rounded-full animate-spin"></div>
              <span className="text-sm text-gray-400 font-medium">Loading history...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 pt-20">
            <h1 className="text-4xl font-bold text-gray-200 mb-8">Forge RAG</h1>
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
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        loading={loading}
        selectedDocName={selectedDocName}
      />
    </div>
  );
}
