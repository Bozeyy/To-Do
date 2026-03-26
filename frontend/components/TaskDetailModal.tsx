"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, CheckCircle2 } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  color?: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  group?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
}

export default function TaskDetailModal({ isOpen, onClose, todo }: TaskDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !todo) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-background p-8 rounded-[2rem] premium-shadow border border-border/40 animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Task Color */}
        {todo.color && (
          <div 
            className="absolute top-0 left-0 right-0 h-4"
            style={{ backgroundColor: todo.color }}
          />
        )}
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`mt-${todo.color ? '6' : '0'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${todo.isCompleted ? 'bg-brand border-brand text-white' : 'border-border text-transparent'}`}>
              <CheckCircle2 strokeWidth={3} className="w-5 h-5" />
            </div>
            {todo.group && (
              <span 
                className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-border/40"
                style={{ backgroundColor: `${todo.group.color || '#3b82f6'}20`, color: todo.group.color || '#3b82f6' }}
              >
                {todo.group.name}
              </span>
            )}
            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-border/40 ${todo.isCompleted ? 'bg-brand/20 text-brand' : 'bg-muted text-muted-foreground'}`}>
              {todo.isCompleted ? "Terminée" : "À faire"}
            </span>
          </div>
          
          <h2 className={`font-outfit text-3xl font-extrabold tracking-tight mb-2 ${todo.isCompleted ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
            {todo.title}
          </h2>
          
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground font-medium">
            <Calendar className="w-4 h-4" />
            {todo.dueDate 
              ? new Date(todo.dueDate).toLocaleDateString() 
              : "Aucune date d'échéance"}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">Description</h3>
            {todo.description ? (
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/40 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {todo.description}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground/60">Aucune description fournie pour cette tâche.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>,
    document.body
  );
}
