"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-[100] flex flex-col space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4",
              t.type === "success" &&
                "bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-950/95 dark:text-emerald-100",
              t.type === "error" &&
                "bg-red-50/95 border-red-200 text-red-900 dark:bg-red-950/95 dark:text-red-100",
              t.type === "info" &&
                "bg-blue-50/95 border-blue-200 text-blue-900 dark:bg-blue-950/95 dark:text-blue-100"
            )}
          >
            <div className="flex items-center space-x-2.5">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
              {t.type === "info" && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
              <span className="text-sm font-medium">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-full hover:bg-black/5 min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              <X className="h-4 w-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
