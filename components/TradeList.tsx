import TradeItem from "@/components/TradeItem";
import { NewTrade, Trade, TradeOutcome, TradeUpdates } from "@/lib/queries";
import { FormEvent, useState } from "react";

type TradeListProps = {
  trades: Trade[];
  loading: boolean;
  onAdd: (trade: Omit<NewTrade, "date">) => Promise<boolean>;
  onUpdate: (id: string, updates: TradeUpdates) => Promise<boolean>;
  onDelete: (id: string) => void;
};

export default function TradeList({
  trades,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: TradeListProps) {
  const [symbol, setSymbol] = useState("");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [outcome, setOutcome] = useState<TradeOutcome>("TARGET_HIT");
  const [note, setNote] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const added = await onAdd({
      symbol: symbol.trim() || null,
      entry: entry.trim(),
      exit: exit.trim(),
      outcome,
      note: note.trim() || null,
    });

    if (added) {
      setSymbol("");
      setEntry("");
      setExit("");
      setOutcome("TARGET_HIT");
      setNote("");
      setShowOptional(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-indigo-200/80 bg-white/90 p-3 shadow-sm shadow-indigo-200/30"
      >
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Log Daily Trade
          </p>
          <button
            type="button"
            onClick={() => setShowOptional((current) => !current)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {showOptional ? "- Hide Symbol & Note" : "+ Symbol & Note"}
          </button>
        </div>

        {showOptional ? (
          <div className="mb-2.5">
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Symbol / Instrument (Optional)
            </label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="h-10 w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 text-xs font-medium text-slate-950 outline-none transition placeholder:text-indigo-400 focus:border-indigo-400 focus:bg-white"
              placeholder="e.g. NIFTY 50, BTC/USDT, AAPL"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              1. Entry Price / Level *
            </label>
            <input
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="h-10 w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 text-xs font-medium text-slate-950 outline-none transition placeholder:text-indigo-400 focus:border-indigo-400 focus:bg-white"
              placeholder="e.g. 24,550.00"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              2. Exit Price / Level *
            </label>
            <input
              value={exit}
              onChange={(e) => setExit(e.target.value)}
              className="h-10 w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 text-xs font-medium text-slate-950 outline-none transition placeholder:text-indigo-400 focus:border-indigo-400 focus:bg-white"
              placeholder="e.g. 24,680.00"
              required
            />
          </div>
        </div>

        <div className="mt-2.5">
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            3. Outcome *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "TARGET_HIT", label: "🎯 Target Hit", bg: "bg-emerald-500", border: "border-emerald-600 text-emerald-950" },
              { id: "SL_HIT", label: "🛑 SL Hit", bg: "bg-rose-500", border: "border-rose-600 text-rose-950" },
              { id: "BREAK_EVEN", label: "⚖️ Break Even", bg: "bg-amber-500", border: "border-amber-600 text-amber-950" },
            ].map((option) => {
              const selected = outcome === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setOutcome(option.id as TradeOutcome)}
                  className={`flex h-10 items-center justify-center rounded-xl border px-2 text-xs font-bold transition ${selected
                      ? `${option.bg} border-transparent text-white shadow-md`
                      : "border-indigo-200/80 bg-white text-slate-700 hover:bg-indigo-50/60"
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {showOptional ? (
          <div className="mt-2.5">
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Strategy Notes & Rationale (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-16 w-full resize-none rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 py-2 text-xs outline-none transition placeholder:text-indigo-400 focus:border-indigo-400 focus:bg-white"
              placeholder="Why did you enter/exit this trade? Setup checklist..."
            />
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-3.5 h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
        >
          Add Trade Entry
        </button>
      </form>

      {loading ? (
        <p className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-700">
          Syncing journal entries...
        </p>
      ) : trades.length === 0 ? (
        <p className="rounded-xl border border-dashed border-indigo-300 bg-white/70 p-6 text-center text-sm font-medium text-indigo-700">
          No trades logged for this date. Enter your trade details above!
        </p>
      ) : (
        <ul className="space-y-3">
          {trades.map((trade) => (
            <TradeItem
              key={trade.id}
              trade={trade}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
