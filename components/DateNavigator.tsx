import { formatShortDate, shiftDateKey, toDateKey } from "@/lib/date";

type DateNavigatorProps = {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
};

export default function DateNavigator({ selectedDate, onSelectDate }: DateNavigatorProps) {
  const today = toDateKey(new Date());
  const isToday = selectedDate === today;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#e4e6ea] bg-white px-2 py-2 shadow-xs">
      <button
        type="button"
        onClick={() => onSelectDate(shiftDateKey(selectedDate, -1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
        aria-label="Previous day"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={() => onSelectDate(today)}
        className="min-w-0 flex-1 rounded-lg px-3 py-1.5 text-center transition hover:bg-[#f8f9fa] focus:outline-none"
      >
        <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-500">
          {isToday ? "Today" : "Viewing"}
        </span>
        <span className="block truncate text-sm font-semibold text-slate-900">
          {formatShortDate(selectedDate)}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectDate(shiftDateKey(selectedDate, 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e6ea] bg-[#f8f9fa] text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}
