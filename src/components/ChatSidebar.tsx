import { Plus, Trash2, MessageCircle } from "lucide-react";
import type { Chat } from "@/hooks/use-chat";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
}: ChatSidebarProps) {
  return (
    <aside
      className={`${
        isOpen ? "w-72" : "w-0"
      } flex-shrink-0 bg-sidebar text-sidebar-foreground transition-all duration-300 overflow-hidden flex flex-col h-full border-r border-sidebar-border`}
    >
      <div className="p-4 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors font-display font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        {chats.length === 0 && (
          <p className="text-center text-sidebar-muted text-sm mt-8 px-4">
            No chats yet 🙈
            <br />
            Start by uploading an image!
          </p>
        )}

        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-colors ${
              activeChatId === chat.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0 opacity-60" />
            <span className="flex-1 text-sm truncate">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-sidebar-muted">
          <span className="text-2xl">🙈</span>
          <span className="font-display font-bold">MonkeyDo</span>
        </div>
      </div>
    </aside>
  );
}
