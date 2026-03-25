"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TaskModal from "@/components/TaskModal";


interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
}

interface Group {
  id: string;
  name: string;
  color: string | null;
}

export default function GroupPage({ params: paramsPromise }: { params: Promise<{ groupId: string }> }) {
  const params = use(paramsPromise);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Todo | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, params.groupId]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const sortedAndFilteredTodos = [...todos]
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .filter((t) => (activeTab === "todo" ? !t.isCompleted : t.isCompleted));

  const fetchData = async () => {
    try {
      const [todosRes, groupsRes] = await Promise.all([
        fetch(`/api/groups/${params.groupId}/todos`),
        fetch("/api/groups"),
      ]);

      if (todosRes.ok && groupsRes.ok) {
        const todosData = await todosRes.json();
        const groupsData = await groupsRes.json();
        setTodos(todosData);
        setGroup(groupsData.find((g: Group) => g.id === params.groupId) || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (res.ok) {
        setTodos(todos.map((t) => (t.id === todoId ? { ...t, isCompleted: !isCompleted } : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const res = await fetch(`/api/todos/${todoId}`, { method: "DELETE" });
      if (res.ok) {
        setTodos(todos.filter((t) => t.id !== todoId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (todo: Todo) => {
    setTaskToEdit(todo);
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full glass border-b border-border/40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Retour Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg premium-shadow" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color || "#3b82f6" }} />
              <span className="font-bold">{group.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-outfit text-4xl font-extrabold tracking-tight">
              {group.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              {todos.length} {todos.length <= 1 ? "tâche" : "tâches"} dans ce groupe.
            </p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="h-12 px-6 rounded-xl bg-foreground text-background font-bold premium-shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle Tâche
          </button>
        </div>

        {/* Filters Switch */}
        <div className="flex p-1 bg-muted/30 rounded-2xl w-fit mb-8 border border-border/40">
          <button
            onClick={() => setActiveTab("todo")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "todo"
                ? "bg-card text-foreground premium-shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            À faire
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "done"
                ? "bg-card text-foreground premium-shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Faites
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {sortedAndFilteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-3xl bg-card/40">
              <p className="text-muted-foreground text-center">
                {activeTab === "todo" 
                  ? "Aucune tâche à faire ici. Bravo ! 🎊" 
                  : "Aucune tâche terminée pour le moment."}
              </p>
            </div>
          ) : (
            sortedAndFilteredTodos.map((todo) => (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 premium-shadow hover:border-brand/40 transition-all cursor-pointer animate-in"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                      todo.isCompleted
                        ? "bg-brand border-brand text-white"
                        : "border-border"
                    }`}
                  >
                    {todo.isCompleted && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-lg font-medium transition-all ${todo.isCompleted ? "text-muted-foreground line-through" : ""}`}>
                      {todo.title}
                    </span>
                    {todo.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${
                        new Date(todo.dueDate) < new Date() && !todo.isCompleted 
                          ? "text-red-500 font-bold" 
                          : "text-muted-foreground"
                      }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Échéance: {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === todo.id ? null : todo.id);
                    }}
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  {openMenuId === todo.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(todo);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTodo(todo.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchData}
        initialGroupId={params.groupId}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

