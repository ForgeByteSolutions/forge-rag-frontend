"use client";

import { useState } from "react";
import { Syne, DM_Sans } from "next/font/google";
import ChatInput from "@/components/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ThemePickerModal from "@/components/chat/ThemePickerModal";
import EvaluationSidePanel from "@/components/evaluation/EvaluationSidePanel";
import { useChat } from "@/hooks/useChat";
import { useChatTheme } from "@/hooks/useChatTheme";
import "@/styles/chatThemes.css";
import "@/styles/workspace.css";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", variable: "--font-dm" });

export default function ChatBox({ selectedDocId, selectedDocName, onViewCitation, onSwitchToRisk, isCitationActive }) {
  const [model, setModel] = useState("meta-llama/Llama-3.3-70B-Instruct");
  const [openThemes, setOpenThemes] = useState(false);
  const [evalPanelOpen, setEvalPanelOpen] = useState(false);

  // — Chat engine —
  const { messages, loading, historyLoading, sendMessage, scrollRef, handleFeedback, handleRunEval } = useChat(selectedDocId, model);

  // — Theme system —
  const { activeTheme, setActiveTheme } = useChatTheme();

  return (
    <div className={`${syne.variable} ${dmSans.variable} wsp-dm flex flex-col h-full relative overflow-hidden bg-[#f7f8fa]`}>
      <div
        className="flex flex-col h-full relative"
        style={{
          background: activeTheme ? `url(${activeTheme}) center/cover no-repeat` : "#fff",
        }}
      >
        {/* Frosted glass overlay when a theme is active */}
        {activeTheme && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            backdropFilter: "blur(2px)",
            background: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }} />
        )}

        {/* Header */}
        <ChatHeader
          selectedDocId={selectedDocId}
          selectedDocName={selectedDocName}
          isCitationActive={isCitationActive}
          model={model}
          setModel={setModel}
          activeTheme={activeTheme}
          onOpenThemes={() => setOpenThemes(true)}
          onSwitchToRisk={onSwitchToRisk}
          onOpenEval={() => setEvalPanelOpen(true)}
        />

        {/* Messages */}
        <ChatMessages
          messages={messages}
          historyLoading={historyLoading}
          onViewCitation={onViewCitation}
          activeTheme={activeTheme}
          scrollRef={scrollRef}
          onFeedback={handleFeedback}
          onRunEval={handleRunEval}
        />

        {/* Input */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <ChatInput
            onSendMessage={sendMessage}
            loading={loading}
            selectedDocName={selectedDocName}
            themed={!!activeTheme}
          />
        </div>
      </div>

      {/* Theme Picker Modal */}
      <ThemePickerModal
        open={openThemes}
        onClose={() => setOpenThemes(false)}
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
      />

      {/* Evaluation Side Panel */}
      <EvaluationSidePanel
        open={evalPanelOpen}
        onClose={() => setEvalPanelOpen(false)}
        docId={selectedDocId}
      />
    </div>
  );
}
