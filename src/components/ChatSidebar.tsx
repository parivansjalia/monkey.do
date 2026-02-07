import { Plus, Trash2, MessageCircle, X } from "lucide-react";
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
  onToggle,
}: ChatSidebarProps) {
  const handleSelect = (id: string) => {
    onSelectChat(id);
    // Auto-close on mobile
    if (window.innerWidth < 768) onToggle();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 h-full
          bg-sidebar text-sidebar-foreground
          transition-transform duration-300 ease-in-out
          flex flex-col border-r border-sidebar-border
          w-72
          ${isOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full"}
          ${!isOpen && "md:w-0 md:border-r-0"}
        `}
      >
        <div className="p-4 flex-shrink-0 flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors font-display font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
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
              onClick={() => handleSelect(chat.id)}
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
    </>
  );
}
