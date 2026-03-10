"use client";

import { useState } from "react";
import ChatInput from "@/components/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ThemePickerModal from "@/components/chat/ThemePickerModal";
import { useChat } from "@/hooks/useChat";
import { useChatTheme } from "@/hooks/useChatTheme";
import "@/styles/chatThemes.css";

export default function ChatBox({ selectedDocId, selectedDocName, onViewCitation, onSwitchToRisk, isCitationActive }) {
  const [model, setModel] = useState("meta-llama/Llama-3.3-70B-Instruct");
  const [openThemes, setOpenThemes] = useState(false);

  // — Chat engine —
  const { messages, loading, historyLoading, sendMessage, scrollRef } = useChat(selectedDocId, model);

  // — Theme system —
  const { activeTheme, setActiveTheme } = useChatTheme();

  return (
    <>
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
        />

        {/* Messages */}
        <ChatMessages
          messages={messages}
          historyLoading={historyLoading}
          onViewCitation={onViewCitation}
          activeTheme={activeTheme}
          scrollRef={scrollRef}
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
    </>
  );
}
