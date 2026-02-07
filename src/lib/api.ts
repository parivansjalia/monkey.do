const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
}

export interface PostVideoResponse {
  response: string;
  suggestions: string[];
  videoUrl?: string;
}

export interface FullPipelineResponse {
  conversationId: string;
  originalPrompt: string;
  searchObjective: string;
  videoPrompt: string;
  videoUrl: string;
  hasImage: boolean;
}

// Send initial message and get AI response
export async function sendChatMessage(
  message: string,
  image?: string,
  conversationHistory: ChatMessage[] = [],
  conversationId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      image,
      conversationHistory,
      conversationId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

// Get response after video generation with follow-up suggestions
export async function getPostVideoResponse(
  videoUrl: string,
  originalPrompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<PostVideoResponse> {
  const res = await fetch(`${API_URL}/api/chat/post-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoUrl,
      originalPrompt,
      conversationHistory,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get post-video response");
  }

  return res.json();
}

// Continue conversation with full context
export async function continueConversation(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat/continue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversationHistory,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to continue conversation");
  }

  return res.json();
}

// Full pipeline: search → summarize → generate video
export async function runFullPipeline(
  prompt: string,
  image?: string
): Promise<FullPipelineResponse> {
  const res = await fetch(`${API_URL}/api/full-pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to run pipeline");
  }

  return res.json();
}
