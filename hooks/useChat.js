"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { streamChat, getChatHistory } from "@/lib/api";

/**
 * Encapsulates all chat logic: history loading, streaming, and message state.
 * Returns { messages, loading, historyLoading, sendMessage }
 */
export function useChat(selectedDocId, model) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);
    const abortControllerRef = useRef(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const scrollRef = useRef(null);

    // Sync loading state
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Load history whenever the selected doc changes
    useEffect(() => {
        async function loadHistory() {
            if (!selectedDocId) {
                setMessages([]);
                return;
            }
            try {
                setHistoryLoading(true);
                const data = await getChatHistory(selectedDocId);
                const history = (data.history || []).map((msg, idx) => ({
                    id: `hist-${idx}`,
                    type: msg.role,
                    content: msg.content,
                    citations: msg.citations,
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

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, historyLoading]);

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || loadingRef.current) return;

        const userMsg = { id: Date.now() + "-user", type: "user", content };
        setMessages(prev => [...prev, userMsg]);

        const aiMsgId = Date.now();
        setMessages(prev => [...prev, { id: aiMsgId, type: "ai", content: "", citations: [] }]);

        setLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            let fullAnswer = "";
            await streamChat({
                question: content,
                doc_id: selectedDocId,
                model,
                signal: abortControllerRef.current.signal,
                onToken: (token) => {
                    fullAnswer += token;
                    setMessages(prev =>
                        prev.map(m => m.id === aiMsgId ? { ...m, content: fullAnswer } : m)
                    );
                },
                onCitations: (cites) => {
                    setMessages(prev =>
                        prev.map(m => m.id === aiMsgId ? { ...m, citations: cites } : m)
                    );
                },
            });
        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("Chat error:", err);
            setMessages(prev =>
                prev.map(m => m.id === aiMsgId
                    ? { ...m, content: "Something went wrong while generating the answer." }
                    : m
                )
            );
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [selectedDocId, model]);

    return { messages, loading, historyLoading, sendMessage, scrollRef };
}
