import { X } from "lucide-react";
import { useEffect } from "react";

interface VideoLightboxProps {
  src: string;
  onClose: () => void;
}

export function VideoLightbox({ src, onClose }: VideoLightboxProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in-up"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-background/20 text-white hover:bg-background/40 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      <video
        src={src}
        controls
        autoPlay
        className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
