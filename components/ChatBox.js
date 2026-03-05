"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { streamChat, getChatHistory } from "@/lib/api";

// ── Theme definitions — matches files in /public/themes/ ──
const THEMES = [
  { id: "default", name: "Default", image: null },
  { id: "t1", name: "Theme 1", image: "/themes/0bd3c3a423c2d9607ab7b8679195e7c9.jpg" },
  { id: "t2", name: "Theme 2", image: "/themes/10aee9b950c1a0b2513eb59968b2b078.jpg" },
  { id: "t3", name: "Theme 3", image: "/themes/10bdcee5acece5da5ea77a89d61ee653.jpg" },
  { id: "t4", name: "Theme 4", image: "/themes/1d3c9efa19b1cf37a3ae92f032423337.jpg" },
  { id: "t5", name: "Theme 5", image: "/themes/3acc191dc9a273e58fb08dadcc190c63.jpg" },
  { id: "t6", name: "Theme 6", image: "/themes/9ae79506c718899f9c11e56dfb826a1e.jpg" },
  { id: "t7", name: "Theme 7", image: "/themes/bc01d892e9da3f9caf23d873fe7486f7.jpg" },
  { id: "t8", name: "Theme 8", image: "/themes/download (12).jpg" },
  { id: "t9", name: "Theme 9", image: "/themes/e00ae23732a78d97a061d03e7b6d3636.jpg" },
];

const THEME_STYLES = `
  .cb-theme-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: cb-fadein .2s ease;
  }
  @keyframes cb-fadein {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cb-theme-modal {
    background: #fff;
    border-radius: 28px;
    box-shadow: 0 32px 100px rgba(0,0,0,.22);
    padding: 28px 28px 24px;
    width: 520px; max-width: calc(100vw - 32px);
    animation: cb-fadein .28s ease;
  }
  .cb-theme-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 18px;
  }
  .cb-theme-card {
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 2.5px solid transparent;
    transition: border-color .18s, transform .15s, box-shadow .18s;
    position: relative;
    background: #f1f5f9;
  }
  .cb-theme-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 28px rgba(0,0,0,.18);
  }
  .cb-theme-card.cb-selected {
    border-color: #12b8cd;
    box-shadow: 0 0 0 3px rgba(18,184,205,.22), 0 6px 20px rgba(0,0,0,.12);
  }
  .cb-theme-card img {
    width: 100%; aspect-ratio: 16/9;
    object-fit: cover; display: block;
  }
  .cb-theme-card .cb-default-thumb {
    width: 100%; aspect-ratio: 16/9;
    background: linear-gradient(135deg,#f8fafc,#e2e8f0);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .cb-theme-card .cb-label {
    padding: 4px 6px;
    font-size: 10.5px; font-weight: 600; color: #374151;
    text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cb-theme-card .cb-tick {
    position: absolute; top: 5px; right: 5px;
    width: 19px; height: 19px; border-radius: 50%;
    background: #12b8cd;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .15s;
    box-shadow: 0 2px 6px rgba(18,184,205,.4);
  }
  .cb-theme-card.cb-selected .cb-tick { opacity: 1; }
  .cb-themes-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px;
    border-radius: 9px;
    border: 1.5px solid rgba(18,184,205,.28);
    background: rgba(18,184,205,.06);
    color: #0e9eb5;
    font-size: 12px; font-weight: 700;
    letter-spacing: .03em;
    cursor: pointer;
    white-space: nowrap;
    transition: all .18s ease;
  }
  .cb-themes-btn:hover {
    background: rgba(18,184,205,.14);
    border-color: rgba(18,184,205,.55);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(18,184,205,.2);
  }
`;

export default function ChatBox({ selectedDocId, selectedDocName, onViewCitation, onSwitchToRisk }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef(null);

  const [model, setModel] = useState("gpt-4o-mini");

  // ── Theme state ──
  const [activeTheme, setActiveTheme] = useState(null); // image URL or null
  const [openThemes, setOpenThemes] = useState(false);

  // Persist theme in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("forge_chat_theme");
    if (saved) setActiveTheme(saved === "__none__" ? null : saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("forge_chat_theme", activeTheme ?? "__none__");
  }, [activeTheme]);

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
        model: model, // Pass selected model
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
    <>
      <style>{THEME_STYLES}</style>
      <div
        className="flex flex-col h-full relative"
        style={{
          background: activeTheme ? `url(${activeTheme}) center/cover no-repeat` : "#fff",
        }}
      >
        {/* Frosted glass blur overlay — only when a theme is active */}
        {activeTheme && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            backdropFilter: "blur(2px)",
            background: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }} />
        )}
        {/* ── Header ── */}
        <div style={{
          height: 58,
          borderBottom: "1px solid rgba(0,0,0,.08)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px 0 62px",
          flexShrink: 0,
          background: activeTheme ? "rgba(255,255,255,0.75)" : "#fff",
          backdropFilter: activeTheme ? "blur(1px)" : "none",
          position: "relative", zIndex: 2,
          gap: 12,
        }}>
          {/* Left: title + doc name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg,#12b8cd,#3bb978)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                Forge RAG Chat
              </p>
              {selectedDocName && (
                <p style={{
                  fontSize: 11, color: "#94a3b8", margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  maxWidth: 220,
                }}>
                  {selectedDocName}
                </p>
              )}
            </div>
          </div>

          {/* Right: controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* 🎨 Themes button */}
            <button
              className="cb-themes-btn"
              onClick={() => setOpenThemes(true)}
              title="Change chat background"
            >
              🎨 Themes
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 22, background: "rgba(0,0,0,.08)" }} />

            {/* Risk Analysis button */}
            {selectedDocId && onSwitchToRisk && (
              <button
                onClick={onSwitchToRisk}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 13px",
                  background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                  color: "#065f46",
                  border: "1.5px solid #6ee7b780",
                  borderRadius: 9,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: ".02em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all .15s",
                  boxShadow: "0 1px 4px rgba(18, 184, 205,.12)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg,#d1fae5,#a7f3d0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(18, 184, 205,.25)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg,#ecfdf5,#d1fae5)";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(18, 184, 205,.12)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12b8cd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Risk Analysis
              </button>
            )}

            {/* Divider before model selector */}
            <div style={{ width: 1, height: 22, background: "rgba(0,0,0,.08)" }} />

            {/* Model selector */}
            <div style={{ position: "relative" }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  appearance: "none",
                  padding: "6px 28px 6px 10px",
                  fontSize: 12, fontWeight: 600,
                  color: "#374151",
                  background: "#f8fafc",
                  border: "1.5px solid rgba(0,0,0,.1)",
                  borderRadius: 9,
                  cursor: "pointer",
                  outline: "none",
                  transition: "border-color .15s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#12b8cd"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,.1)"; }}
              >
                <option value="meta-llama/Llama-3.3-70B-Instruct">Llama 3.3 70B (Free)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Paid)</option>
              </select>
              {/* Chevron icon */}
              <svg style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pb-40"
          style={{ position: "relative", zIndex: 1 }}
        >
          {historyLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-gray-100 border-t-[#12b8cd] rounded-full animate-spin"></div>
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
                themed={!!activeTheme}
              />
            ))
          )}
        </div>

        {/* Input Area */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={loading}
            selectedDocName={selectedDocName}
            themed={!!activeTheme}
          />
        </div>
      </div>

      {/* ── Theme Picker Modal ── */}
      {openThemes && (
        <div className="cb-theme-overlay" onClick={() => setOpenThemes(false)}>
          <div className="cb-theme-modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, fontSize: 18,
                  background: "linear-gradient(135deg,rgba(18,184,205,.12),rgba(18,184,205,.26))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>🎨</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Chat Background</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, marginTop: 2 }}>Pick a theme to personalise your chat</p>
                </div>
              </div>
              <button
                onClick={() => setOpenThemes(false)}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: "1.5px solid rgba(0,0,0,.1)",
                  background: "rgba(0,0,0,.04)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#6b7280",
                }}
              >✕</button>
            </div>

            {/* Theme grid */}
            <div className="cb-theme-grid">
              {THEMES.map(t => {
                const isSelected = t.image === null
                  ? activeTheme === null
                  : activeTheme === t.image;
                return (
                  <div
                    key={t.id}
                    className={`cb-theme-card${isSelected ? " cb-selected" : ""}`}
                    onClick={() => { setActiveTheme(t.image); setOpenThemes(false); }}
                    title={t.name}
                  >
                    {t.image
                      ? <img src={t.image} alt={t.name} />
                      : <div className="cb-default-thumb">⬜</div>
                    }
                    <div className="cb-label">{t.name}</div>
                    <div className="cb-tick">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
