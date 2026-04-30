export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function shiftDateKey(dateKey: string, days: number) {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

export function formatDisplayDate(dateKey: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(fromDateKey(dateKey));
}

export function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(fromDateKey(dateKey));
}

export function startOfWeekKey(dateKey: string) {
  const date = fromDateKey(dateKey);
  const day = date.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysFromMonday);

  return toDateKey(date);
}

export function startOfMonthKey(dateKey: string) {
  const date = fromDateKey(dateKey);

  return toDateKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function startOfYearKey(dateKey: string) {
  const date = fromDateKey(dateKey);

  return toDateKey(new Date(date.getFullYear(), 0, 1));
}

export function daysBetweenInclusive(startDateKey: string, endDateKey: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const startDate = fromDateKey(startDateKey);
  const endDate = fromDateKey(endDateKey);

  return (
    Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) +
    1
  );
}
