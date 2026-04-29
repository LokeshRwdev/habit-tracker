import TaskItem from "@/components/TaskItem";
import { Task } from "@/lib/queries";
import { FormEvent, useState } from "react";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  onAdd: (task: { title: string; note?: string | null }) => Promise<boolean>;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Task, "title" | "note" | "completed">>,
  ) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function TaskList({
  tasks,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: TaskListProps) {
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="task-title">
            Task title
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-xl border border-sky-200 bg-white/90 px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-sky-500 focus:border-sky-400 focus:bg-white"
            placeholder="Add a task"
            required
          />
          <button
            type="button"
            onClick={() => setShowNote((current) => !current)}
            className="h-12 rounded-xl border border-violet-200 bg-violet-50 px-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            Note
          </button>
          <button
            type="submit"
            className="h-12 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        {showNote ? (
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-20 w-full resize-none rounded-xl border border-violet-200 bg-white/90 px-4 py-3 text-sm outline-none transition placeholder:text-violet-400 focus:border-violet-400 focus:bg-white"
            placeholder="Optional note"
            aria-label="Task note"
          />
        ) : null}
      </form>

      {loading ? (
        <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium text-sky-700">
          Loading tasks...
        </p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-sky-300 bg-white/70 p-6 text-center text-sm font-medium text-sky-700">
          No tasks for this date.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
