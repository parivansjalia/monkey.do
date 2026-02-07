import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, ImagePlus, Send, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSend = () => {
    if (disabled) return;
    if (!message.trim() && !preview) return;
    onSend(message.trim(), preview || undefined);
    setMessage("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Open camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("Failed to access camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  // Attach stream to video element when camera opens
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  // Close camera and stop stream
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setPreview(dataUrl);
    }
    closeCamera();
  };

  return (
    <>
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 flex justify-center gap-4 bg-black/80">
            <button
              onClick={closeCamera}
              className="p-4 rounded-full bg-red-500 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={capturePhoto}
              className="p-4 rounded-full bg-white text-black"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

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

          <button
            onClick={openCamera}
            className="flex-shrink-0 p-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Open camera"
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
            disabled={disabled || (!message.trim() && !preview)}
            className="flex-shrink-0 p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
