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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-sm shadow-amber-200/60"
    >
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="habit-name">
          Habit name
        </label>
        <input
          id="habit-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-amber-500 focus:border-orange-400 focus:bg-white"
          placeholder="Add a habit"
          required
        />

        <button
          type="submit"
          className="h-12 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
        >
          Add
        </button>
      </div>

      {error ? <p className="mt-2 px-1 text-xs text-red-500">{error}</p> : null}
    </form>
  );
}
