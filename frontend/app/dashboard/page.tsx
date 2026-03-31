"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  color: string | null;
  _count?: {
    todos: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#3b82f6");

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        if (data.groups) {
          setGroups(data.groups);
          setTotalTasks(data.totalTasks || 0);
        } else {
          setGroups(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, color: newGroupColor }),
      });

      if (res.ok) {
        setNewGroupName("");
        setIsModalOpen(false);
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dashboard-container px-6 py-12 max-w-7xl mx-auto">
      <div className="section-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="font-outfit text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Mes Groupes
            {totalTasks > 0 && (
              <span className="bg-red-500 text-white text-lg min-w-[2.5rem] h-10 flex items-center justify-center rounded-full font-bold premium-shadow px-2">
                {totalTasks}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Organisez vos tâches par catégories.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 px-6 rounded-xl bg-brand text-brand-foreground font-bold premium-shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau Groupe
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-3xl bg-card/40">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Aucun groupe trouvé</h3>
          <p className="text-muted-foreground text-center mt-2 max-w-xs">
            Créez votre premier groupe pour commencer à organiser vos tâches.
          </p>
        </div>
      ) : (
        <div className="group-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Special "All" Group */}
          <Link
            href="/dashboard/groups/all"
            className="group-card group relative p-6 rounded-3xl bg-card border border-border/50 premium-shadow hover:border-brand/40 transition-all animate-in block"
          >
            <div
              className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-brand/20 text-brand"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-1 truncate">Tous</h3>
            <p className="text-sm text-muted-foreground">Toutes les tâches</p>
            {totalTasks > 0 ? (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold premium-shadow">
                {totalTasks}
              </div>
            ) : (
              <div
                className="absolute top-4 right-4 w-3 h-3 rounded-full bg-brand"
              />
            )}
          </Link>

          {groups.map((group) => (
            <Link
              href={`/dashboard/groups/${group.id}`}
              key={group.id}
              className="group-card group relative p-6 rounded-3xl bg-card border border-border/50 premium-shadow hover:border-brand/40 transition-all animate-in block"
            >

              <div
                className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${group.color}20`, color: group.color || '#3b82f6' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1 truncate">{group.name}</h3>
              <p className="text-sm text-muted-foreground">Voir les tâches</p>
              {group._count && group._count.todos > 0 ? (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold premium-shadow">
                  {group._count.todos}
                </div>
              ) : (
                <div
                  className="absolute top-4 right-4 w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color || '#3b82f6' }}
                />
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-container w-full max-w-md bg-white dark:bg-background p-8 rounded-3xl premium-shadow border border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-outfit text-2xl font-bold mb-6">Nouveau Groupe</h2>
            <form onSubmit={createGroup} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Nom du groupe</label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Travail, Maison..."
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1 text-center block">Couleur</label>
                <div className="flex justify-center gap-3">
                  {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewGroupColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${newGroupColor === color ? "ring-2 ring-foreground ring-offset-2 scale-110" : ""
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-border font-bold hover:bg-accent transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-[#C1E1C1] text-[#1E3A1A] hover:bg-[#A8D1A8] font-bold premium-shadow transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
