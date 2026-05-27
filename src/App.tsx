import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ChatProvider, useChatContext } from "./contexts/ChatContext";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { SettingsModal } from "./components/SettingsModal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Settings } from "./types/chat";

function AppLayout() {
  const [showSettings, setShowSettings] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 关闭移动端侧边栏的点击外部处理
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenSettings = () => setShowSettings(true);

  return (
    <div className="flex h-full bg-white dark:bg-[#343541]">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block h-full">
        <Sidebar onOpenSettings={handleOpenSettings} />
      </div>

      {/* 移动端侧边栏浮层 */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              onOpenSettings={() => {
                handleOpenSettings();
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 主区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 移动端汉堡菜单 */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden absolute top-3 left-3 z-30 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Menu size={20} className="text-[#8E8EA0]" />
        </button>

        <ChatArea />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppLayout />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
