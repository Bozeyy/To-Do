"use client";

import React, { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import TaskModal from "./TaskModal";

interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  group?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [initialDueDate, setInitialDueDate] = useState<string>("");

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

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-outfit text-3xl font-extrabold tracking-tight capitalize">
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
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {day}
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
            setInitialDueDate(format(day, "yyyy-MM-dd"));
            setIsModalOpen(true);
          }}
          className={`min-h-[120px] p-2 border border-border/40 transition-all cursor-pointer group hover:bg-muted/30 ${
            !isSameMonth(day, monthStart) ? "opacity-30" : ""
          } ${isSameDay(day, new Date()) ? "bg-brand/5 border-brand/20" : "bg-card/50"}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? "text-brand" : "text-muted-foreground"}`}>
              {format(day, "d")}
            </span>
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-brand hover:text-white transition-all">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {dayTodos.map((todo) => (
              <div
                key={todo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToEdit({
                    ...todo,
                    groupId: todo.group?.id
                  });
                  setIsModalOpen(true);
                }}
                className={`text-[10px] px-2 py-1 rounded-md line-clamp-1 font-bold truncate transition-all ${
                  todo.isCompleted 
                    ? "bg-muted text-muted-foreground line-through opacity-60" 
                    : "premium-shadow hover:scale-[1.02]"
                }`}
                style={{ 
                  backgroundColor: !todo.isCompleted ? (todo.group?.color ? `${todo.group.color}20` : "var(--color-brand-20)") : undefined,
                  color: !todo.isCompleted ? (todo.group?.color || "var(--color-brand)") : undefined,
                  borderLeft: !todo.isCompleted ? `3px solid ${todo.group?.color || "var(--color-brand)"}` : undefined
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

    return <div className="rounded-3xl overflow-hidden border border-border/40 premium-shadow">{rows}</div>;
  };

  return (
    <div className="animate-in">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

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
