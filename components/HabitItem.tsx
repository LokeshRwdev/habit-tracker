import { Habit } from "@/lib/queries";
import { FormEvent, useState } from "react";

type HabitItemProps = {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (name: string) => boolean | Promise<boolean>;
};

export default function HabitItem({
  habit,
  completed,
  onToggle,
  onDelete,
  onRename,
}: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const renamed = await onRename(name);
    if (!renamed) {
      setError("Name already exists.");
      return;
    }
    setError("");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#e4e6ea] bg-white p-2.5 shadow-xs"
      >
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="min-w-0 flex-1 rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
            aria-label="Habit name"
            autoFocus
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => { setIsEditing(false); setName(habit.name); setError(""); }}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-[#f8f9fa]"
          >
            Cancel
          </button>
        </div>
        {error ? <p className="mt-1.5 px-1 text-xs text-red-500">{error}</p> : null}
      </form>
    );
  }

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-[#e4e6ea] bg-white px-3 py-2.5 shadow-xs transition-all duration-150 hover:border-slate-300 hover:shadow-sm hover:-translate-y-px">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
          completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-[#d0d3da] bg-white text-transparent hover:border-indigo-400"
        }`}
        aria-pressed={completed}
        aria-label={`Mark ${habit.name} as ${completed ? "not done" : "done"}`}
      >
        <span className="text-xs font-bold">✓</span>
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {habit.name}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-slate-400">
          {completed ? "Completed" : "Pending"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-[#f8f9fa] hover:text-slate-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
