// TradeOutcome is defined here to avoid a circular import with queries.ts
export type TradeOutcome = "TARGET_HIT" | "SL_HIT" | "BREAK_EVEN";

export function parseTradeQuantity(trade: {
  quantity?: number | null;
  note?: string | null;
}): number {
  if (typeof trade.quantity === "number" && !isNaN(trade.quantity) && trade.quantity > 0) {
    return trade.quantity;
  }
  if (!trade.note) return 1;
  const match = trade.note.match(/\[QTY:\s*(\d+(?:\.\d+)?)\s*\]/i);
  if (match && match[1]) {
    const parsed = parseFloat(match[1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 1;
}

export function cleanTradeNote(note?: string | null): string {
  if (!note) return "";
  return note.replace(/\[QTY:\s*\d+(?:\.\d+)?\s*\]\s*/i, "").trim();
}

export function encodeTradeNoteWithQty(note: string | null | undefined, qty: number): string | null {
  const clean = cleanTradeNote(note);
  if (qty <= 1 && !clean) return null;
  if (qty <= 1) return clean || null;
  return `[QTY:${qty}] ${clean}`.trim();
}

export function calculateTradeMetrics(trade: {
  entry: string;
  exit: string;
  outcome: string;
  quantity?: number | null;
  note?: string | null;
}) {
  const qty = parseTradeQuantity(trade);
  const entryNum = parseFloat((trade.entry || "").replace(/[^0-9.-]+/g, "")) || 0;
  const exitNum = parseFloat((trade.exit || "").replace(/[^0-9.-]+/g, "")) || 0;

  let points = Math.abs(exitNum - entryNum);
  if (points === 0 && exitNum !== 0 && entryNum === 0) {
    points = Math.abs(exitNum);
  }

  if (trade.outcome === "SL_HIT") {
    points = -points;
  } else if (trade.outcome === "BREAK_EVEN" || trade.outcome === "PENDING") {
    points = 0;
  }

  // Round points to 2 decimal places
  points = Math.round(points * 100) / 100;
  const pnl = Math.round(points * qty * 100) / 100;

  return { qty, points, pnl };
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === 0) return "₹0.00";
  const abs = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount > 0 ? `+₹${abs}` : `-₹${abs}`;
}

export function formatPoints(points: number): string {
  if (isNaN(points) || points === 0) return "0 pts";
  const abs = Math.abs(points).toFixed(2).replace(/\.00$/, "");
  return points > 0 ? `+${abs} pts` : `-${abs} pts`;
}
