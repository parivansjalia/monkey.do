import { ImagePlus } from "lucide-react";

interface EmptyStateProps {
  onUploadClick: () => void;
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce-gentle select-none">
          🙈
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black mb-2 sm:mb-3 text-foreground">
          MonkeyDo
        </h1>
        <p className="text-muted-foreground mb-8 font-body leading-relaxed">
          Upload an image and start chatting! I promise I'll only peek through
          my fingers... 🙈
        </p>

        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-2xl font-display font-bold text-base sm:text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <ImagePlus className="w-6 h-6" />
          Upload an Image
        </button>

        <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-6 justify-center text-muted-foreground text-xs sm:text-sm">
          <span>🙈 Image chat</span>
          <span>🙊 Smart replies</span>
          <span>🙉 Always listening</span>
        </div>
      </div>
    </div>
  );
}
