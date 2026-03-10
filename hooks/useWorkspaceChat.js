"use client";

import { useEffect, useRef, useState } from "react";
import { getChatHistory, streamChat } from "@/lib/api";

/**
 * Manages workspace chat: history loading, streaming, model selection.
 * Returns { messages, question, setQuestion, streaming, model, setModel, handleSend, chatScrollRef }
 */
export function useWorkspaceChat(workspaceId) {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [model, setModel] = useState("meta-llama/Llama-3.3-70B-Instruct");
    const chatScrollRef = useRef(null);

    // Load chat history on mount
    useEffect(() => {
        if (!workspaceId) return;
        getChatHistory(null, workspaceId)
            .then(data => {
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
            })
            .catch(err => console.error("Failed to load workspace chat history:", err));
    }, [workspaceId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (selectedDocIds) => {
        const q = question.trim();
        if (!q || streaming) return;
        setQuestion("");
        setMessages(prev => [...prev, { role: "user", content: q }]);
        setStreaming(true);

        const aiMsgId = Date.now();
        setMessages(prev => [...prev, { role: "ai", content: "", id: aiMsgId, streaming: true }]);

        try {
            await streamChat({
                question: q,
                workspace_id: workspaceId,
                doc_ids: selectedDocIds?.size > 0 ? Array.from(selectedDocIds) : null,
                model,
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

    return { messages, question, setQuestion, streaming, model, setModel, handleSend, chatScrollRef };
}
