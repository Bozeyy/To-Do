"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Calendar as CalendarIcon, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: "Mes Groupes", href: "/dashboard", icon: LayoutGrid },
    { name: "Calendrier", href: "/dashboard/calendar", icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-border/40 px-6 py-8 bg-white">
        <div className="flex items-center gap-3 mb-12">
          <img src="/icon.png" alt="Logo" className="w-9 h-9 rounded-xl premium-shadow" />
          <span className="font-outfit text-xl font-bold tracking-tight">To-Do</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${isActive
                  ? "bg-brand text-brand-foreground premium-shadow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border/40">
          <div className="px-4 py-3 rounded-2xl bg-muted/30 mb-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Session</p>
            <p className="text-sm font-medium truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden sticky top-0 z-50 bg-white dark:bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-bold">To-Do</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white dark:bg-background px-6 py-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="font-bold">To-Do</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all ${isActive
                    ? "bg-brand text-brand-foreground premium-shadow"
                    : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="w-6 h-6" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-border/40">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut className="w-6 h-6" />
                Déconnexion
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
