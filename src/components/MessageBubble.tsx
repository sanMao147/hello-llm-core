import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types/chat";
import { CodeBlock } from "./CodeBlock";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble = function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 px-4 py-6 ${
        isUser
          ? "bg-white dark:bg-[#343541]"
          : "bg-[#F7F7F8] dark:bg-[#444654]"
      }`}
    >
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center ${
          isUser
            ? "bg-[#10A37F] text-white"
            : "bg-[#10A37F] text-white"
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* 消息内容 */}
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="text-sm font-semibold mb-1 text-[#343541] dark:text-[#ECECF1]">
          {isUser ? "You" : "Assistant"}
        </div>

        {isUser ? (
          <div className="text-[#343541] dark:text-[#ECECF1] text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        ) : (
          <div className="markdown-body text-[#343541] dark:text-[#ECECF1] text-sm leading-relaxed">
            {message.content ? (
              <div className={isStreaming ? "cursor-blink" : ""}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeStr = String(children).replace(/\n$/, "");

                      if (match) {
                        return (
                          <CodeBlock
                            language={match[1]}
                            value={codeStr}
                          />
                        );
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre({ children }) {
                      return <>{children}</>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <span className="text-[#8E8EA0] italic">思考中...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
