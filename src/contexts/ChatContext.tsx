import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  ChatState,
  ChatAction,
  Conversation,
  Message,
} from "../types/chat";
import {
  loadConversations,
  saveConversations,
  loadActiveId,
  saveActiveId,
  generateId,
} from "../utils/storage";

const initialState: ChatState = {
  conversations: loadConversations(),
  activeId: loadActiveId(),
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "CREATE_CONVERSATION": {
      const newConv: Conversation = {
        id: generateId(),
        title: "新对话",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        conversations: [newConv, ...state.conversations],
        activeId: newConv.id,
      };
    }
    case "DELETE_CONVERSATION": {
      const filtered = state.conversations.filter(
        (c) => c.id !== action.id
      );
      const newActiveId =
        state.activeId === action.id
          ? filtered.length > 0
            ? filtered[0].id
            : null
          : state.activeId;
      return {
        conversations: filtered,
        activeId: newActiveId,
      };
    }
    case "SET_ACTIVE": {
      return { ...state, activeId: action.id };
    }
    case "ADD_MESSAGE": {
      return {
        ...state,
        conversations: state.conversations.map((c) => {
          if (c.id !== action.conversationId) return c;
          const existingIds = new Set(c.messages.map((m) => m.id));
          const newMessages = existingIds.has(action.message.id)
            ? c.messages
            : [...c.messages, action.message];
          return {
            ...c,
            messages: newMessages,
            title:
              c.title === "新对话" && action.message.role === "user"
                ? action.message.content.slice(0, 30)
                : c.title,
            updatedAt: Date.now(),
          };
        }),
      };
    }
    case "UPDATE_MESSAGE": {
      return {
        ...state,
        conversations: state.conversations.map((c) => {
          if (c.id !== action.conversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === action.messageId
                ? { ...m, content: action.content }
                : m
            ),
            updatedAt: Date.now(),
          };
        }),
      };
    }
    case "SET_MESSAGES": {
      return {
        ...state,
        conversations: state.conversations.map((c) => {
          if (c.id !== action.conversationId) return c;
          return {
            ...c,
            messages: action.messages,
            updatedAt: Date.now(),
          };
        }),
      };
    }
    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  dispatch: Dispatch<ChatAction>;
  activeConversation: Conversation | null;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
  setActive: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  addMessages: (conversationId: string, messages: Message[]) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    content: string
  ) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // 持久化 conversations
  useEffect(() => {
    saveConversations(state.conversations);
  }, [state.conversations]);

  // 持久化 activeId
  useEffect(() => {
    saveActiveId(state.activeId);
  }, [state.activeId]);

  const activeConversation =
    state.conversations.find((c) => c.id === state.activeId) ?? null;

  const createConversation = useCallback(() => {
    dispatch({ type: "CREATE_CONVERSATION" });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: "DELETE_CONVERSATION", id });
  }, []);

  const setActive = useCallback((id: string) => {
    dispatch({ type: "SET_ACTIVE", id });
  }, []);

  const addMessage = useCallback(
    (conversationId: string, message: Message) => {
      dispatch({ type: "ADD_MESSAGE", conversationId, message });
    },
    []
  );

  const addMessages = useCallback(
    (conversationId: string, messages: Message[]) => {
      // 逐条 add 避免重复
      for (const msg of messages) {
        dispatch({ type: "ADD_MESSAGE", conversationId, message: msg });
      }
    },
    []
  );

  const updateMessage = useCallback(
    (conversationId: string, messageId: string, content: string) => {
      dispatch({
        type: "UPDATE_MESSAGE",
        conversationId,
        messageId,
        content,
      });
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        activeConversation,
        createConversation,
        deleteConversation,
        setActive,
        addMessage,
        addMessages,
        updateMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
