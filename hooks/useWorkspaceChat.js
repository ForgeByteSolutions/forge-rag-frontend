"use client";

import { useEffect, useRef, useState } from "react";
import { getChatHistory, streamChat, submitChatFeedback, runManualEvaluation } from "@/lib/api";

/**
 * Manages workspace chat: history loading, streaming, model selection.
 * Returns { messages, question, setQuestion, streaming, model, setModel, handleSend, chatScrollRef }
 */
export function useWorkspaceChat(workspaceId) {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [streaming, setStreaming] = useState(false);
    const streamingRef = useRef(false);
    const abortControllerRef = useRef(null);
    const [model, setModel] = useState("meta-llama/Llama-3.3-70B-Instruct");
    const chatScrollRef = useRef(null);

    useEffect(() => {
        streamingRef.current = streaming;
    }, [streaming]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Load chat history on mount
    useEffect(() => {
        if (!workspaceId) return;
        getChatHistory(null, workspaceId)
            .then(data => {
                const history = data?.history || [];
                if (history.length > 0) {
                    setMessages(history.map((msg) => ({
                        id: msg.id,
                        role: ["user", "human"].includes(msg.role) ? "user" : "ai",
                        content: msg.content,
                        citations: msg.citations || [],
                        user_feedback: msg.user_feedback,
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
        if (!q || streamingRef.current) return;
        setQuestion("");
        setMessages(prev => [...prev, { role: "user", content: q }]);
        setStreaming(true);

        const aiMsgId = Date.now();
        setMessages(prev => [...prev, { role: "ai", content: "", id: aiMsgId, streaming: true }]);

        abortControllerRef.current = new AbortController();

        try {
            await streamChat({
                question: q,
                workspace_id: workspaceId,
                doc_ids: selectedDocIds?.size > 0 ? Array.from(selectedDocIds) : null,
                model,
                signal: abortControllerRef.current.signal,
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
                onEnd: (endPayload) => {
                    if (endPayload?.message_id) {
                        setMessages(prev => prev.map(m =>
                            m.id === aiMsgId ? { ...m, id: endPayload.message_id, streaming: false } : m
                        ));
                    }
                },
            });
        } catch (err) {
            if (err.name === "AbortError") return;
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: "⚠️ Failed to get a response. Please try again.", streaming: false } : m
            ));
        } finally {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, streaming: false } : m
            ));
            setStreaming(false);
            abortControllerRef.current = null;
        }
    };

    const handleFeedback = async (messageId, feedbackText) => {
        try {
            await import("@/lib/api").then(m => m.submitChatFeedback(messageId, feedbackText));
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, user_feedback: feedbackText } : m));
        } catch (err) {
            console.error("Failed to submit feedback", err);
        }
    };

    const handleRunEval = async (messageId) => {
        try {
            await runManualEvaluation(messageId);
        } catch (err) {
            console.error("Failed to run evaluation", err);
            throw err;
        }
    };

    return { messages, question, setQuestion, streaming, model, setModel, handleSend, handleFeedback, handleRunEval, chatScrollRef };
}
