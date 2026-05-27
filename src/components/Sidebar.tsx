import { useState } from "react";
import { Plus, Trash2, MessageSquare, Sun, Moon, Settings } from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import { useThemeContext } from "../contexts/ThemeContext";

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    state,
    createConversation,
    deleteConversation,
    setActive,
    activeConversation,
  } = useChatContext();
  const { theme, toggleTheme } = useThemeContext();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      deleteConversation(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#171717] text-[#ECECF1] w-64 flex-shrink-0">
      {/* 新建对话按钮 */}
      <div className="p-3">
        <button
          onClick={createConversation}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors duration-200 text-sm"
        >
          <Plus size={16} />
          <span>新建对话</span>
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {state.conversations.length === 0 ? (
          <div className="text-center text-[#8E8EA0] text-sm mt-8 px-4">
            暂无对话记录
          </div>
        ) : (
          <div className="space-y-0.5">
            {state.conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActive(conv.id)}
                className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-150 text-sm ${
                  activeConversation?.id === conv.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <MessageSquare
                  size={16}
                  className="flex-shrink-0 text-[#8E8EA0]"
                />
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className={`flex-shrink-0 p-1 rounded transition-all duration-150 ${
                    deleteConfirmId === conv.id
                      ? "text-red-400 bg-red-400/10 opacity-100"
                      : "text-[#8E8EA0] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10"
                  }`}
                  title={
                    deleteConfirmId === conv.id ? "确认删除" : "删除对话"
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm text-[#ECECF1]"
        >
          <Settings size={16} className="text-[#8E8EA0]" />
          <span>设置</span>
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm text-[#ECECF1]"
        >
          {theme === "dark" ? (
            <>
              <Sun size={16} className="text-[#8E8EA0]" />
              <span>亮色模式</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-[#8E8EA0]" />
              <span>暗色模式</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
