import { useEffect, useRef } from "react";
import type { Message } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 mb-6 rounded-full bg-[#10A37F]/10 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#10A37F]"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#343541] dark:text-[#ECECF1] mb-2">
            Hello LLM Core
          </h1>
          <p className="text-sm text-[#8E8EA0] max-w-md">
            基于 OpenAI 接口的大语言模型客户端。
            请在左侧新建对话，并在设置中配置 API 参数后开始聊天。
          </p>
        </div>
      ) : (
        <div>
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={
                isStreaming &&
                msg.role === "assistant" &&
                idx === messages.length - 1
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
