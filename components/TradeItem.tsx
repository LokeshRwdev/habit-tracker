import { Trade, TradeOutcome, TradeUpdates } from "@/lib/queries";
import { FormEvent, useState } from "react";

type TradeItemProps = {
  trade: Trade;
  onUpdate: (id: string, updates: TradeUpdates) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function TradeItem({
  trade,
  onUpdate,
  onDelete,
}: TradeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(Boolean(trade.note));
  const [symbol, setSymbol] = useState(trade.symbol ?? "");
  const [entry, setEntry] = useState(trade.entry);
  const [exit, setExit] = useState(trade.exit);
  const [outcome, setOutcome] = useState<TradeOutcome>(trade.outcome);
  const [note, setNote] = useState(trade.note ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updated = await onUpdate(trade.id, {
      symbol: symbol.trim() || null,
      entry: entry.trim(),
      exit: exit.trim(),
      outcome,
      note: note.trim() || null,
    });

    if (updated) {
      setIsEditing(false);
    }
  }

  const outcomeConfig: Record<
    TradeOutcome,
    { label: string; bg: string; text: string; border: string; icon: string }
  > = {
    TARGET_HIT: {
      label: "Target Hit",
      bg: "bg-emerald-500",
      text: "text-white",
      border: "border-emerald-600",
      icon: "🎯",
    },
    SL_HIT: {
      label: "SL Hit",
      bg: "bg-rose-500",
      text: "text-white",
      border: "border-rose-600",
      icon: "🛑",
    },
    BREAK_EVEN: {
      label: "Break Even",
      bg: "bg-amber-500",
      text: "text-white",
      border: "border-amber-600",
      icon: "⚖️",
    },
  };

  const badge = outcomeConfig[trade.outcome] || outcomeConfig.TARGET_HIT;

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-indigo-200 bg-white/95 p-3 shadow-sm"
      >
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500">
              Symbol (Opt)
            </label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="h-9 w-full rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 text-xs font-medium outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="e.g. NIFTY"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500">
              1. Entry *
            </label>
            <input
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="h-9 w-full rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 text-xs font-medium outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="Entry price"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500">
              2. Exit *
            </label>
            <input
              value={exit}
              onChange={(e) => setExit(e.target.value)}
              className="h-9 w-full rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 text-xs font-medium outline-none focus:border-indigo-400 focus:bg-white"
              placeholder="Exit price"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500">
            3. Outcome *
          </label>
          <div className="mt-1 grid grid-cols-4 gap-1.5">
            {(["TARGET_HIT", "SL_HIT", "BREAK_EVEN", "PENDING"] as TradeOutcome[]).map(
              (option) => {
                const optConfig = outcomeConfig[option];
                const selected = outcome === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOutcome(option)}
                    className={`rounded-lg py-1.5 text-center text-[11px] font-bold transition ${selected
                      ? `${optConfig.bg} ${optConfig.text} shadow-sm`
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    {optConfig.icon} {optConfig.label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500">
            Note / Strategy (Opt)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 min-h-16 w-full resize-none rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 focus:bg-white"
            placeholder="Trade rationale or post-analysis..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setSymbol(trade.symbol ?? "");
              setEntry(trade.entry);
              setExit(trade.exit);
              setOutcome(trade.outcome);
              setNote(trade.note ?? "");
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  }

  return (
    <li className="group rounded-xl border border-indigo-200/80 bg-white/95 p-3.5 shadow-sm shadow-indigo-200/40 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {trade.symbol ? (
              <span className="rounded-md bg-indigo-100/80 px-2 py-0.5 text-xs font-bold text-indigo-900">
                {trade.symbol}
              </span>
            ) : null}
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${badge.bg} ${badge.text} shadow-xs`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-700 sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">1. Entry:</span>
              <span className="font-bold text-slate-900">{trade.entry}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">2. Exit:</span>
              <span className="font-bold text-slate-900">{trade.exit}</span>
            </div>
          </div>

          {trade.note && isExpanded ? (
            <p className="mt-2.5 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2 text-xs leading-5 text-slate-600">
              {trade.note}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {trade.note ? (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
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
            onClick={() => onDelete(trade.id)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
