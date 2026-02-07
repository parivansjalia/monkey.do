import { useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  image?: string;
  video?: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const monkeyResponses = [
  "🙈 Ooh, interesting image! Let me take a peek through my fingers...",
  "🙈 *peeks through fingers* That's quite something!",
  "🙈 I'm too shy to look directly, but from what I can see...",
  "🙈 Oh my! Let me cover my eyes and think about this one...",
  "🙈 *slowly spreads fingers apart* Wow, tell me more!",
  "🙈 See no evil, but I sense something good here!",
];

const sampleVideos = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
];

const getRandomResponse = () =>
  monkeyResponses[Math.floor(Math.random() * monkeyResponses.length)];

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const createChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat 🙈",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  };

  const sendMessage = (content: string, image?: string) => {
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

    const includeVideo = Math.random() > 0.5;
    const aiMessage: ChatMessage = {
      id: generateId(),
      role: "ai",
      content: getRandomResponse(),
      video: includeVideo
        ? sampleVideos[Math.floor(Math.random() * sampleVideos.length)]
        : undefined,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        const updated = {
          ...chat,
          messages: [...chat.messages, userMessage, aiMessage],
        };
        if (chat.messages.length === 0) {
          updated.title =
            content.slice(0, 30) || "Image Chat 🙈";
        }
        return updated;
      })
    );
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    sendMessage,
    deleteChat,
  };
}
