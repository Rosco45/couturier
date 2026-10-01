"use client";

import React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { QuickActionButton } from "./QuickActionButton";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="flex-1 pb-24 md:pb-12 max-w-5xl w-full mx-auto px-3.5 py-4 md:px-6">
        {children}
      </main>
      <QuickActionButton />
      <BottomNav />
    </div>
  );
}
