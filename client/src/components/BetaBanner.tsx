import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isClosed = localStorage.getItem("beta-banner-closed");
    setIsVisible(!isClosed);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("beta-banner-closed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-lg p-3 pr-10 max-w-xs shadow-lg">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleClose}
        className="absolute top-1 right-1 h-7 w-7 hover:bg-amber-200 dark:hover:bg-amber-800"
        data-testid="button-close-beta-banner"
      >
        <X className="w-4 h-4 text-amber-900 dark:text-amber-100" />
      </Button>
      <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
        Sistema em Beta: Bugs podem acontecer. Reporte-os em seu perfil!
      </p>
    </div>
  );
}
