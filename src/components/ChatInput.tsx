import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  // 发送消息后自动聚焦
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white dark:bg-[#343541] border-t border-[#E5E5E5] dark:border-white/10 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-[#FFFFFF] dark:bg-[#40414F] rounded-xl border border-[#E5E5E5] dark:border-white/10 shadow-sm focus-within:border-[#10A37F]/50 dark:focus-within:border-[#10A37F]/50 transition-colors px-4 py-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发送消息..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[#343541] dark:text-[#ECECF1] placeholder-[#8E8EA0] max-h-[200px] leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
              disabled || !input.trim()
                ? "text-[#8E8EA0] cursor-not-allowed opacity-40"
                : "text-[#10A37F] hover:bg-[#10A37F]/10 cursor-pointer"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-center text-[#8E8EA0] mt-2">
          此项目仅供学习使用。API Key 存储在浏览器本地。
        </p>
      </div>
    </div>
  );
}
