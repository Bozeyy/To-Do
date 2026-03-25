"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
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
  const [newTodoTitle, setNewTodoTitle] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, params.groupId]);

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

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const res = await fetch(`/api/groups/${params.groupId}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodoTitle }),
      });

      if (res.ok) {
        setNewTodoTitle("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color || "#3b82f6" }} />
            <span className="font-bold">{group.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-outfit text-4xl font-extrabold tracking-tight">
            {group.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {todos.length} {todos.length <= 1 ? "tâche" : "tâches"} dans ce groupe.
          </p>
        </div>

        {/* Create Todo Form */}
        <form onSubmit={createTodo} className="mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              required
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Ajouter une nouvelle tâche..."
              className="flex-1 h-14 px-5 rounded-2xl bg-card border border-border focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all premium-shadow"
            />
            <button
              type="submit"
              className="h-14 px-8 rounded-2xl bg-foreground text-background font-bold premium-shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Ajouter
            </button>
          </div>
        </form>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-3xl bg-card/40">
              <p className="text-muted-foreground text-center">
                Aucune tâche ici. Commencez par en ajouter une !
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 premium-shadow hover:border-brand/40 transition-all animate-in"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                      todo.isCompleted
                        ? "bg-brand border-brand text-white"
                        : "border-border hover:border-brand"
                    }`}
                  >
                    {todo.isCompleted && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-lg font-medium transition-all ${todo.isCompleted ? "text-muted-foreground line-through" : ""}`}>
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
