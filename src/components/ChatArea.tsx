import { useState, useCallback, useRef } from "react";
import { useChatContext } from "../contexts/ChatContext";
import { useLLMClient } from "../hooks/useLLMClient";
import { useStreamChat } from "../hooks/useStreamChat";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SettingsModal } from "./SettingsModal";
import type { Settings, Message } from "../types/chat";

export function ChatArea() {
  const { activeConversation, addMessages } = useChatContext();
  const [settings, setSettings] = useLocalStorage<Settings>("hello-llm-settings", {
    apiKey: "",
    baseUrl: "",
    model: "",
  });
  const [showSettings, setShowSettings] = useState(false);

  const { client, config, isConfigured } = useLLMClient(settings);
  const { sendMessage, isStreaming, error } = useStreamChat({
    client,
    config,
    isConfigured,
  });

  const streamMessageRef = useRef<Message | null>(null);
  const [streamingContent, setStreamingContent] = useState("");

  const handleSend = useCallback(
    async (content: string) => {
      if (!isConfigured) {
        setShowSettings(true);
        return;
      }

      if (!activeConversation) return;

      try {
        const result = await sendMessage(content);
        if (result.length > 0) {
          addMessages(activeConversation.id, result);
        }
      } catch (err) {
        console.error("发送消息失败:", err);
      }
    },
    [activeConversation, isConfigured, sendMessage, addMessages]
  );

  const messages = activeConversation?.messages ?? [];

  const modelName = settings.model || "未配置模型";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#343541]">
      {/* 顶部模型名称 */}
      <div className="flex items-center justify-center py-3 border-b border-[#E5E5E5] dark:border-white/10">
        <span className="text-sm text-[#8E8EA0]">
          模型: {modelName}
        </span>
      </div>

      {/* 消息列表 */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 输入框 */}
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
      />

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
