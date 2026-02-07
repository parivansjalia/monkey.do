import { useState, useCallback } from "react";
import {
  sendChatMessage,
  getPostVideoResponse,
  continueConversation,
  type ChatMessage as ApiChatMessage,
} from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  image?: string;
  video?: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Convert chat messages to API format
  const toApiHistory = (messages: ChatMessage[]): ApiChatMessage[] =>
    messages.map((m) => ({ role: m.role, content: m.content }));

  const createChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat 🙈",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, []);

  const sendMessage = useCallback(
    async (content: string, image?: string) => {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = createChat();
      }

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        image,
        timestamp: new Date(),
      };

      // Add user message immediately
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;
          const updated = {
            ...chat,
            messages: [...chat.messages, userMessage],
          };
          if (chat.messages.length === 0) {
            updated.title = content.slice(0, 30) || "Image Chat 🙈";
          }
          return updated;
        })
      );

      setIsLoading(true);

      try {
        // Get current conversation history
        const currentChat = chats.find((c) => c.id === chatId);
        const history = currentChat ? toApiHistory(currentChat.messages) : [];

        // Call API
        const response = await sendChatMessage(content, image, history, chatId);

        const aiMessage: ChatMessage = {
          id: generateId(),
          role: "ai",
          content: response.response,
          timestamp: new Date(),
        };

        // Add AI response
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== chatId) return chat;
            return {
              ...chat,
              messages: [...chat.messages, aiMessage],
            };
          })
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        // Add error message
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: "ai",
          content: "🙈 Oops! I got shy and couldn't respond. Try again?",
          timestamp: new Date(),
        };
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== chatId) return chat;
            return {
              ...chat,
              messages: [...chat.messages, errorMessage],
            };
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId, chats, createChat]
  );

  // Handle video completion - call after Fal generates video
  const handleVideoComplete = useCallback(
    async (videoUrl: string, originalPrompt: string) => {
      if (!activeChatId) return;

      setIsLoading(true);

      try {
        const currentChat = chats.find((c) => c.id === activeChatId);
        const history = currentChat ? toApiHistory(currentChat.messages) : [];

        const response = await getPostVideoResponse(
          videoUrl,
          originalPrompt,
          history
        );

        const aiMessage: ChatMessage = {
          id: generateId(),
          role: "ai",
          content: response.response,
          video: videoUrl,
          suggestions: response.suggestions,
          timestamp: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== activeChatId) return chat;
            return {
              ...chat,
              messages: [...chat.messages, aiMessage],
            };
          })
        );
      } catch (error) {
        console.error("Failed to handle video completion:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId, chats]
  );

  // Use a suggestion as the next message
  const useSuggestion = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion);
    },
    [sendMessage]
  );

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId(null);
      }
    },
    [activeChatId]
  );

  return {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    setActiveChatId,
    createChat,
    sendMessage,
    handleVideoComplete,
    useSuggestion,
    deleteChat,
  };
}
