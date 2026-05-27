export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
}

export type ChatAction =
  | { type: "CREATE_CONVERSATION" }
  | { type: "DELETE_CONVERSATION"; id: string }
  | { type: "SET_ACTIVE"; id: string }
  | { type: "ADD_MESSAGE"; conversationId: string; message: Message }
  | { type: "UPDATE_MESSAGE"; conversationId: string; messageId: string; content: string }
  | { type: "SET_MESSAGES"; conversationId: string; messages: Message[] };

export interface LLMClient {
  client: import("openai").OpenAI | null;
  config: Settings;
  isConfigured: boolean;
}

export interface UseStreamChatReturn {
  sendMessage: (userContent: string, temperature?: number) => Promise<void>;
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}
