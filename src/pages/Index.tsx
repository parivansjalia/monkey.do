import { useState, useRef } from "react";
import { Menu } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInput } from "@/components/ChatInput";
import { MessageList } from "@/components/MessageList";
import { EmptyState } from "@/components/EmptyState";

const Index = () => {
  const {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    sendMessage,
    deleteChat,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileFromEmpty = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = ev.target?.result as string;
      sendMessage("", img);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={() => {
          createChat();
        }}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🙈</span>
            <h2 className="font-display font-bold text-foreground">
              {activeChat?.title || "SeeNoEvil"}
            </h2>
          </div>
        </header>

        {/* Chat area */}
        {activeChat && activeChat.messages.length > 0 ? (
          <>
            <MessageList messages={activeChat.messages} />
            <ChatInput onSend={sendMessage} />
          </>
        ) : (
          <>
            <EmptyState onUploadClick={handleUploadClick} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileFromEmpty}
            />
            <ChatInput onSend={sendMessage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
