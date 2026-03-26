"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, MoreVertical, Edit, Trash, Check, X } from "lucide-react";
import TaskModal from "./TaskModal";

interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  description?: string | null;
  color?: string | null;
  group?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [initialDueDate, setInitialDueDate] = useState<string>("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [currentMonth]);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos/calendar");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodoStatus = async (todoId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, isCompleted: !currentStatus } : t))
      );
      await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
    } catch (err) {
      console.error(err);
      // Revert if error
      fetchTodos();
    }
  };

  const deleteTodo = async (todoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (!confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;

    try {
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      await fetch(`/api/todos/${todoId}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h2 className="font-outfit text-xl md:text-3xl font-extrabold tracking-tight capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [
      { full: "Lun", short: "L" },
      { full: "Mar", short: "M" },
      { full: "Mer", short: "M" },
      { full: "Jeu", short: "J" },
      { full: "Ven", short: "V" },
      { full: "Sam", short: "S" },
      { full: "Dim", short: "D" },
    ];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day.full} className="text-center text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <span className="hidden md:inline">{day.full}</span>
            <span className="md:hidden">{day.short}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const rows: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];

    calendarDays.forEach((day, i) => {
      const dayTodos = todos.filter((todo) => isSameDay(new Date(todo.dueDate), day));

      days.push(
        <div
          key={day.toString()}
          onClick={() => {
            setSelectedDay(day);
          }}
          className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border border-border/40 transition-all cursor-pointer group hover:bg-muted/30 ${!isSameMonth(day, monthStart) ? "opacity-30" : ""
            } ${isSameDay(day, new Date()) ? "bg-brand/5 border-brand/20" : "bg-card/50"} ${selectedDay && isSameDay(day, selectedDay) ? "ring-2 ring-brand ring-inset" : ""
            }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-brand" : "text-muted-foreground"}`}>
              {format(day, "d")}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInitialDueDate(format(day, "yyyy-MM-dd"));
                setIsModalOpen(true);
              }}
              className="hidden md:flex opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-brand hover:text-white transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {dayTodos.map((todo) => (
              <div
                key={todo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDay(day);
                }}
                className={`text-[8px] md:text-[10px] px-1 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-md line-clamp-1 font-bold truncate transition-all ${todo.isCompleted
                  ? "bg-muted text-muted-foreground line-through opacity-60"
                  : "premium-shadow hover:scale-[1.02]"
                  }`}
                style={{
                  backgroundColor: !todo.isCompleted ? (todo.color ? `${todo.color}20` : todo.group?.color ? `${todo.group.color}20` : "var(--color-brand-20)") : undefined,
                  color: !todo.isCompleted ? (todo.color || todo.group?.color || "var(--color-brand)") : undefined,
                  borderLeft: !todo.isCompleted ? `3px solid ${todo.color || todo.group?.color || "var(--color-brand)"}` : undefined
                }}
              >
                {todo.title}
              </div>
            ))}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="rounded-xl md:rounded-3xl overflow-hidden border border-border/40 premium-shadow">{rows}</div>;
  };

  const renderDayDetail = () => {
    if (!selectedDay || !mounted) return null;

    const dayTodos = todos.filter((todo) => isSameDay(new Date(todo.dueDate), selectedDay));

    return createPortal(
      <div 
        className="fixed inset-0 z-[50] flex flex-col items-center justify-center md:justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setSelectedDay(null)}
      >
        <div 
          className="w-full max-w-md bg-white dark:bg-background rounded-[2rem] p-6 premium-shadow animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-2xl font-bold capitalize">
                {format(selectedDay, "eeee d MMMM", { locale: fr })}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                {dayTodos.length} {dayTodos.length > 1 ? "tâches prévues" : "tâche prévue"}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 -mr-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex p-1 bg-muted/30 rounded-2xl w-full mb-6 border border-border/40 shrink-0">
            <button
              onClick={() => setActiveTab("todo")}
              className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "todo"
                ? "bg-[#FEF9C3] text-[#713F12] premium-shadow"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              À faire
            </button>
            <button
              onClick={() => setActiveTab("done")}
              className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === "done"
                ? "bg-[#B2D6FF] text-[#1E3A5A] premium-shadow"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Faites
            </button>
          </div>

          <div className="space-y-3 mb-6 overflow-y-auto pr-1 -mr-1 
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-thumb]:bg-border
            [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {dayTodos.filter(t => activeTab === "todo" ? !t.isCompleted : t.isCompleted).length > 0 ? (
              dayTodos
                .filter(t => activeTab === "todo" ? !t.isCompleted : t.isCompleted)
                .map((todo) => (
                <div
                  key={todo.id}
                  onClick={(e) => toggleTodoStatus(todo.id, todo.isCompleted, e)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${todo.isCompleted
                      ? "bg-brand border-brand text-white"
                      : "border-muted-foreground/30 text-transparent group-hover:border-brand/40"
                      }`}
                    style={!todo.isCompleted && (todo.color || todo.group?.color) ? { borderColor: `${todo.color || todo.group?.color}60` } : {}}
                  >
                    <Check strokeWidth={3} className="w-3.5 h-3.5" />
                  </button>

                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: todo.color || todo.group?.color || "var(--color-brand)" }}
                  />

                  <div className={`flex-1 flex flex-col transition-all overflow-hidden ${todo.isCompleted ? "opacity-60" : ""}`}>
                    <span className={`font-medium ${todo.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {todo.title}
                    </span>
                    {todo.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {todo.description}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-background text-muted-foreground shrink-0 border border-border/40">
                    {todo.group?.name}
                  </span>

                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === todo.id ? null : todo.id);
                      }}
                      className="p-2 -mr-2 rounded-xl hover:bg-background text-muted-foreground transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openDropdownId === todo.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-popover border border-border premium-shadow overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setTaskToEdit({ ...todo, groupId: todo.group?.id });
                              setIsModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => deleteTodo(todo.id, e)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors mt-1"
                          >
                            <Trash className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground italic">
                {activeTab === "todo" ? "Aucune tâche à faire" : "Aucune tâche terminée"}
              </div>
            )}
          </div>

          <div className="shrink-0 pt-2 border-t border-border/40 pb-2">
            <button
              onClick={() => {
                setInitialDueDate(format(selectedDay, "yyyy-MM-dd"));
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-brand text-white font-bold premium-shadow hover:scale-[1.01] transition-all"
            >
              <Plus className="w-5 h-5" />
              Ajouter une tâche
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="animate-in">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderDayDetail()}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
          setInitialDueDate("");
        }}
        onSuccess={fetchTodos}
        initialDueDate={initialDueDate}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
