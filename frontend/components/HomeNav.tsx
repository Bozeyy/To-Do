"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutGrid, Calendar as CalendarIcon, LogOut } from "lucide-react";

export default function HomeNav() {
  return (
    <nav className="flex items-center gap-4 sm:gap-8">
      <Link 
        href="/dashboard" 
        className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-brand transition-colors"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Mes Groupes</span>
      </Link>
      
      <Link 
        href="/dashboard/calendar" 
        className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-brand transition-colors"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Calendrier</span>
      </Link>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-2 text-sm font-bold text-destructive hover:opacity-80 transition-all border border-destructive/20 px-3 py-1.5 rounded-xl bg-destructive/5"
      >
        <LogOut className="w-4 h-4" />
        <span>Déconnexion</span>
      </button>
    </nav>
  );
}
