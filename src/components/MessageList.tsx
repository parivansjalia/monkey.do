import type { ChatMessage } from "@/hooks/use-chat";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { VideoLightbox } from "./VideoLightbox";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in-up ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "ai" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-lg">
                🙈
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-chat-user text-foreground rounded-br-md"
                  : "bg-chat-ai text-foreground rounded-bl-md"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded"
                  className="max-h-60 rounded-lg mb-2 object-cover"
                />
              )}
              {msg.video && (
                <div
                  className="relative max-h-60 rounded-lg mb-2 overflow-hidden cursor-pointer group"
                  onClick={() => setExpandedVideo(msg.video!)}
                >
                  <video
                    src={msg.video}
                    className="max-h-60 rounded-lg object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center">
                      <Play className="w-6 h-6 text-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
              )}
              {msg.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-display">
                U
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {expandedVideo && (
        <VideoLightbox
          src={expandedVideo}
          onClose={() => setExpandedVideo(null)}
        />
      )}
    </div>
  );
}
