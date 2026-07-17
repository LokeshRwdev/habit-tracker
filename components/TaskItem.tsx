import { Task } from "@/lib/queries";
import { FormEvent, useState } from "react";

type TaskItemProps = {
  task: Task;
  onUpdate: (id: string, updates: Partial<Pick<Task, "title" | "note" | "completed">>) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(Boolean(task.note));
  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState(task.note ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updated = await onUpdate(task.id, { title, note });
    if (updated) setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#e4e6ea] bg-white p-3 shadow-xs"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] px-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
          aria-label="Task title"
          required
          autoFocus
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 min-h-16 w-full resize-none rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
          aria-label="Task note"
          placeholder="Note (optional)"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => { setIsEditing(false); setTitle(task.title); setNote(task.note ?? ""); }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-[#f8f9fa]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <li className="group rounded-xl border border-[#e4e6ea] bg-white px-3 py-2.5 shadow-xs transition-all duration-150 hover:border-slate-300 hover:shadow-sm hover:-translate-y-px">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
            task.completed
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-[#d0d3da] bg-white text-transparent hover:border-indigo-400"
          }`}
          aria-pressed={task.completed}
          aria-label={`Mark ${task.title} as ${task.completed ? "not done" : "done"}`}
        >
          <span className="text-[10px] font-bold">✓</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className={`break-words text-sm font-semibold ${task.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
            {task.title}
          </p>
          {task.note && isExpanded ? (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">
              {task.note}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {task.note ? (
            <button
              type="button"
              onClick={() => setIsExpanded((c) => !c)}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-[#f8f9fa] hover:text-slate-700"
            >
              {isExpanded ? "Hide" : "Note"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-[#f8f9fa] hover:text-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
