import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import type { Settings } from "../types/chat";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKey(settings.apiKey);
    setBaseUrl(settings.baseUrl);
    setModel(settings.model);
  }, [settings, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ apiKey, baseUrl, model });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-[#212121] rounded-2xl shadow-2xl border border-[#E5E5E5] dark:border-white/10 animate-in zoom-in-95 duration-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-white/10">
          <h2 className="text-lg font-semibold text-[#343541] dark:text-[#ECECF1]">
            API 设置
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-[#8E8EA0]" />
          </button>
        </div>

        {/* 表单 */}
        <div className="px-6 py-5 space-y-5">
          {/* 安全提示 */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              ⚠️ 演示模式：API Key 将存储在浏览器本地。
              请勿在公共设备上使用。
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-[#343541] dark:text-[#ECECF1] mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full pr-10 px-3 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-white/20 bg-white dark:bg-[#343541] text-[#343541] dark:text-[#ECECF1] text-sm outline-none focus:border-[#10A37F] dark:focus:border-[#10A37F] transition-colors"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8EA0] hover:text-[#343541] dark:hover:text-[#ECECF1] transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-[#343541] dark:text-[#ECECF1] mb-1.5">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-white/20 bg-white dark:bg-[#343541] text-[#343541] dark:text-[#ECECF1] text-sm outline-none focus:border-[#10A37F] dark:focus:border-[#10A37F] transition-colors"
            />
          </div>

          {/* Model ID */}
          <div>
            <label className="block text-sm font-medium text-[#343541] dark:text-[#ECECF1] mb-1.5">
              Model ID
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o / deepseek-chat"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-white/20 bg-white dark:bg-[#343541] text-[#343541] dark:text-[#ECECF1] text-sm outline-none focus:border-[#10A37F] dark:focus:border-[#10A37F] transition-colors"
            />
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E5E5] dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[#8E8EA0] hover:text-[#343541] dark:hover:text-[#ECECF1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#10A37F] hover:bg-[#0D8C6D] text-white text-sm font-medium transition-colors shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
