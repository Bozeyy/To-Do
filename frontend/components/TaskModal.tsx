"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Group {
  id: string;
  name: string;
  color: string | null;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialGroupId?: string;
  initialDueDate?: string;
  taskToEdit?: { id: string; title: string; dueDate: string | null; groupId?: string; description?: string | null; color?: string | null } | null;
}

export default function TaskModal({ isOpen, onClose, onSuccess, initialGroupId, initialDueDate, taskToEdit }: TaskModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [groupId, setGroupId] = useState(initialGroupId || "");
  const [dueDate, setDueDate] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      setGroupId(taskToEdit?.groupId || initialGroupId || "");
      setTitle(taskToEdit?.title || "");
      setDescription(taskToEdit?.description || "");
      setColor(taskToEdit?.color || "");
      
      if (taskToEdit) {
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split("T")[0] : "");
      } else if (initialDueDate) {
        setDueDate(initialDueDate);
      } else {
        setDueDate("");
      }
      
      setError(null);
    }
  }, [isOpen, initialGroupId, initialDueDate, taskToEdit]);


  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        const groupsArray = data.groups || data;
        setGroups(groupsArray);
        if (!initialGroupId && !taskToEdit && groupsArray.length > 0) {
          setGroupId(groupsArray[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !groupId) return;

    setLoading(true);
    setError(null);
    try {
      const url = taskToEdit 
        ? `/api/todos/${taskToEdit.id}` 
        : `/api/groups/${groupId}/todos`;
      
      const method = taskToEdit ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description: description || null,
          color: color || null,
          dueDate: dueDate || null,
          ...(taskToEdit && { groupId }) // Support moving task to another group if needed
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        setError(errorData.message || errorData.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="modal-overlay fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="modal-container w-full max-w-md bg-white dark:bg-background p-8 rounded-3xl premium-shadow border border-border/40 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-outfit text-2xl font-bold mb-6 text-foreground">
          {taskToEdit ? "Modifier la Tâche" : "Nouvelle Tâche"}
        </h2>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container space-y-6">

          <div className="form-field space-y-2">
            <label className="text-sm font-semibold ml-1 text-foreground">Titre de la tâche</label>
            <input
              autoFocus
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Acheter du pain..."
              className="input-field w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-foreground"
            />
          </div>

          <div className="form-field space-y-2">
            <label className="text-sm font-semibold ml-1 text-foreground">Groupe</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="input-field w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all appearance-none disabled:opacity-50 text-foreground"
              disabled={!!initialGroupId && !taskToEdit} // Disable if adding to specific group, but allow if editing
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field space-y-2">
            <label className="text-sm font-semibold ml-1 text-foreground">Date d'échéance (optionnel)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-foreground"
            />
          </div>

          <div className="form-field space-y-2">
            <label className="text-sm font-semibold ml-1 text-foreground">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails supplémentaires..."
              className="input-field w-full min-h-[80px] p-4 rounded-xl bg-background border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-foreground resize-y"
            />
          </div>

          <div className="form-field space-y-2">
            <label className="text-sm font-semibold ml-1 text-foreground">Couleur (optionnelle)</label>
            <div className="flex gap-2 flex-wrap">
              {['#cbd5e1', '#fecaca', '#fde047', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fbcfe8'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c === color ? "" : c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-brand scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  title={`Couleur ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-border font-bold hover:bg-accent transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-[#C1E1C1] text-[#1E3A1A] hover:bg-[#A8D1A8] font-bold premium-shadow disabled:opacity-50 transition-colors"
            >
              {loading ? (taskToEdit ? "Mise à jour..." : "Création...") : (taskToEdit ? "Enregistrer" : "Créer")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
