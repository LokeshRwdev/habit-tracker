import HabitItem from "@/components/HabitItem";
import { Habit } from "@/lib/queries";

type HabitListProps = {
  habits: Habit[];
  completedByHabit: Record<string, boolean>;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onRename: (habitId: string, name: string) => boolean | Promise<boolean>;
};

export default function HabitList({
  habits,
  completedByHabit,
  onToggle,
  onDelete,
  onRename,
}: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-300 bg-white/70 p-8 text-center">
        <p className="text-sm font-medium text-amber-700">
          Add your first habit to start tracking today.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          completed={Boolean(completedByHabit[habit.id])}
          onToggle={() => onToggle(habit.id)}
          onDelete={() => onDelete(habit.id)}
          onRename={(name) => onRename(habit.id, name)}
        />
      ))}
    </ul>
  );
}
