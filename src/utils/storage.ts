import type { Conversation, Settings } from "../types/chat";

const STORAGE_KEYS = {
  conversations: "hello-llm-conversations",
  settings: "hello-llm-settings",
  theme: "hello-llm-theme",
  activeId: "hello-llm-active-id",
} as const;

export function loadConversations(): Conversation[] {
  const raw = localStorage.getItem(STORAGE_KEYS.conversations);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as Conversation[];
  // 按更新时间降序
  return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
}

export function loadSettings(): Settings {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) {
    return { apiKey: "", baseUrl: "", model: "" };
  }
  return JSON.parse(raw) as Settings;
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function loadTheme(): "dark" | "light" {
  const raw = localStorage.getItem(STORAGE_KEYS.theme);
  if (raw === "light") return "light";
  return "dark";
}

export function saveTheme(theme: "dark" | "light"): void {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function loadActiveId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.activeId);
}

export function saveActiveId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.activeId, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.activeId);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
