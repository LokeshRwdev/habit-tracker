import { formatShortDate, shiftDateKey, toDateKey } from "@/lib/date";

type DateNavigatorProps = {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
};

export default function DateNavigator({
  selectedDate,
  onSelectDate,
}: DateNavigatorProps) {
  const today = toDateKey(new Date());
  const isToday = selectedDate === today;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/85 p-2 shadow-lg shadow-sky-200/40 backdrop-blur">
      <button
        type="button"
        onClick={() => onSelectDate(shiftDateKey(selectedDate, -1))}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-lg font-semibold text-orange-700 transition hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
        aria-label="Previous day"
      >
        &lt;
      </button>

      <button
        type="button"
        onClick={() => onSelectDate(today)}
        className="min-w-0 flex-1 rounded-xl px-3 py-2 text-center transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <span className="block text-xs font-semibold uppercase tracking-wide text-sky-600">
          {isToday ? "Today" : "Viewing"}
        </span>
        <span className="block truncate text-sm font-semibold text-slate-950">
          {formatShortDate(selectedDate)}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectDate(shiftDateKey(selectedDate, 1))}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg font-semibold text-indigo-700 transition hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        aria-label="Next day"
      >
        &gt;
      </button>
    </div>
  );
}
