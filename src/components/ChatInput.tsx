import { useRef, useState, useCallback } from "react";
import { Camera, ImagePlus, Send, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSend = () => {
    if (!message.trim() && !preview) return;
    onSend(message.trim(), preview || undefined);
    setMessage("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {preview && (
        <div className="mb-3 relative inline-block animate-fade-in-up">
          <img
            src={preview}
            alt="Upload preview"
            className="h-24 w-24 object-cover rounded-lg border-2 border-accent shadow-md"
          />
          <button
            onClick={() => {
              setPreview(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFile}
        />

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        <button
          onClick={() => cameraRef.current?.click()}
          className="flex-shrink-0 p-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Take photo"
        >
          <Camera className="w-5 h-5" />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 p-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Upload image"
        >
          <ImagePlus className="w-5 h-5" />
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or upload an image..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() && !preview}
          className="flex-shrink-0 p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
