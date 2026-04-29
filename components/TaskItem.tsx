import { Task } from "@/lib/queries";
import { FormEvent, useState } from "react";

type TaskItemProps = {
  task: Task;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Task, "title" | "note" | "completed">>,
  ) => Promise<boolean>;
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

    if (updated) {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-sky-200 bg-white/90 p-3"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-10 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white"
          aria-label="Task title"
          required
          autoFocus
        />
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 min-h-20 w-full resize-none rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:bg-white"
          aria-label="Task note"
          placeholder="Note"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setTitle(task.title);
              setNote(task.note ?? "");
            }}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-sky-50 hover:text-sky-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600"
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <li className="group rounded-xl border border-sky-200 bg-white/90 p-3 shadow-sm shadow-sky-200/50 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${
            task.completed
              ? "border-sky-500 bg-sky-500 text-white"
              : "border-sky-300 bg-sky-50 text-transparent hover:border-sky-500"
          }`}
          aria-pressed={task.completed}
          aria-label={`Mark ${task.title} as ${
            task.completed ? "not done" : "done"
          }`}
        >
          <span className="text-xs font-bold">✓</span>
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`break-words text-sm font-semibold ${
              task.completed ? "text-sky-500 line-through" : "text-slate-950"
            }`}
          >
            {task.title}
          </p>
          {task.note && isExpanded ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
              {task.note}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          {task.note ? (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 hover:text-violet-800"
            >
              {isExpanded ? "Hide" : "Note"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
