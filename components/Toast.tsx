"use client";
import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Props {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white text-sm rounded-xl shadow-2xl animate-slide-up max-w-xs">
      <CheckCircle2 size={16} className="text-green-400 shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification" className="text-slate-400 hover:text-white transition-colors ml-1">
        <X size={14} />
      </button>
    </div>
  );
}
