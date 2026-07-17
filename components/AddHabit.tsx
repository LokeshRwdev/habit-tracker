import { FormEvent, useState } from "react";

type AddHabitProps = {
  onAdd: (name: string) => boolean | Promise<boolean>;
};

export default function AddHabit({ onAdd }: AddHabitProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const added = await onAdd(name);
    if (!added) {
      setError("That habit already exists.");
      return;
    }
    setName("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-[#d0d3da] bg-[#f8f9fa] p-2.5">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="habit-name">Habit name</label>
        <input
          id="habit-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          className="min-w-0 flex-1 rounded-lg border border-[#e4e6ea] bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400"
          placeholder="Add a habit"
          required
        />
        <button
          type="submit"
          className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Add
        </button>
      </div>
      {error ? <p className="mt-1.5 px-1 text-xs text-red-500">{error}</p> : null}
    </form>
  );
}
