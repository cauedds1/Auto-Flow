import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface PhotoViewerProps {
  images: Array<{ id: string; imageUrl: string }>;
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoViewer({ images, initialIndex, open, onOpenChange }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  if (!images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <span className="text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsZoomed(!isZoomed)}
            data-testid="button-zoom-toggle"
          >
            {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-viewer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-40 text-white hover:bg-white/20 h-12 w-12"
              onClick={goToPrevious}
              data-testid="button-previous-photo"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          <div 
            className={`flex items-center justify-center w-full h-full p-8 ${
              isZoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={currentImage.imageUrl}
              alt={`Foto ${currentIndex + 1}`}
              className={`transition-all duration-300 ${
                isZoomed 
                  ? "max-w-none max-h-none w-auto h-auto" 
                  : "max-w-full max-h-full object-contain"
              }`}
              style={isZoomed ? { transform: "scale(1.5)", transformOrigin: "center" } : undefined}
              data-testid={`img-viewer-photo-${currentIndex}`}
            />
          </div>

          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-40 text-white hover:bg-white/20 h-12 w-12"
              onClick={goToNext}
              data-testid="button-next-photo"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2 p-4 bg-black/80 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsZoomed(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                  idx === currentIndex 
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-black" 
                    : "opacity-60 hover:opacity-100"
                }`}
                data-testid={`button-thumbnail-${idx}`}
              >
                <img
                  src={img.imageUrl}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
