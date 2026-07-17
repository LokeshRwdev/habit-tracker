import TaskItem from "@/components/TaskItem";
import { Task } from "@/lib/queries";
import { FormEvent, useState } from "react";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  onAdd: (task: { title: string; note?: string | null }) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<Pick<Task, "title" | "note" | "completed">>) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function TaskList({ tasks, loading, onAdd, onUpdate, onDelete }: TaskListProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const added = await onAdd({ title, note });
    if (added) {
      setTitle("");
      setNote("");
      setShowNote(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
            placeholder="Add a task"
            required
          />
          <button
            type="button"
            onClick={() => setShowNote((c) => !c)}
            className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${
              showNote
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-[#e4e6ea] bg-[#f8f9fa] text-slate-500 hover:bg-white"
            }`}
          >
            Note
          </button>
          <button
            type="submit"
            className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        {showNote ? (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-16 w-full resize-none rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
            placeholder="Optional note..."
            aria-label="Task note"
          />
        ) : null}
      </form>

      {loading ? (
        <p className="rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] p-4 text-center text-xs font-medium text-slate-400">
          Loading tasks...
        </p>
      ) : tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#d0d3da] p-6 text-center text-xs font-medium text-slate-400">
          No tasks for this date.
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
