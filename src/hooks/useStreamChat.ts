import { useState, useRef, useCallback } from "react";
import type OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { Message, Settings } from "../types/chat";
import { generateId } from "../utils/storage";

interface UseStreamChatOptions {
  client: OpenAI | null;
  config: Settings;
  isConfigured: boolean;
}

interface UseStreamChatReturn {
  sendMessage: (userContent: string, temperature?: number) => Promise<Message[]>;
  isStreaming: boolean;
  error: string | null;
}

/**
 * useStreamChat — 对标原 HelloAgentsLLM.think() 方法
 *
 * 原 CLI 代码：
 *   async think(messages, temperature) → 流式调用 → 逐 chunk 打印 → 返回完整文本
 *
 * Hook 实现：
 *   - sendMessage(userContent) → 构建消息列表 → 发起流式调用 → 逐 chunk 追加
 *   - 返回完整的 Message[] 供外部状态管理
 *   - requestAnimationFrame 节流更新
 */
export function useStreamChat({
  client,
  config,
  isConfigured,
}: UseStreamChatOptions): UseStreamChatReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userContent: string, temperature = 0): Promise<Message[]> => {
      if (!client || !isConfigured) {
        setError("请先在设置中配置 API Key、Base URL 和 Model ID");
        return [];
      }

      if (!userContent.trim()) return [];

      setError(null);
      setIsStreaming(true);

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: userContent,
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const messages: ChatCompletionMessageParam[] = [
        userMessage,
        { role: "assistant", content: "" },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      const collected: string[] = [];

      const stream = await client.chat.completions.create(
        {
          model: config.model,
          messages: [
            { role: "system", content: "你是一个有帮助的AI助手。" },
            ...messages.filter((m) => m.content || m.role === "system"),
          ] as ChatCompletionMessageParam[],
          temperature,
          stream: true,
        },
        { signal: controller.signal }
      );

      const assistantWithContent: Message = {
        ...assistantMessage,
        content: "",
      };

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (content) {
          collected.push(content);
          assistantWithContent.content = collected.join("");
        }
      }

      setIsStreaming(false);
      abortRef.current = null;

      return [
        userMessage,
        {
          ...assistantWithContent,
          timestamp: Date.now(),
        },
      ];
    },
    [client, config.model, isConfigured]
  );

  return {
    sendMessage,
    isStreaming,
    error,
  };
}
