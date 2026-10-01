"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Scissors, ShieldCheck, User } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const workshop = dataStore.getWorkshop();
  const profile = dataStore.getCurrentProfile();

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border pt-safe">
        <div className="flex items-center justify-between h-14 px-4 max-w-5xl mx-auto">
          {/* Logo & Atelier Name */}
          <Link href="/" className="flex items-center space-x-2.5 min-h-[44px]">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Scissors className="h-4.5 w-4.5 rotate-[-45deg]" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight line-clamp-1">
                {workshop.name}
              </h1>
              <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-primary">FCFA</span>
                <span>•</span>
                <span className="capitalize">{profile.role}</span>
              </div>
            </div>
          </Link>

          {/* Quick Actions (Recherche + Profil) */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
              aria-label="Recherche rapide"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/more"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
              aria-label="Profil et paramètres"
            >
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs border border-border">
                {profile.full_name.charAt(0)}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
