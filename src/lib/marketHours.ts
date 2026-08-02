/**
 * Indian equity market hours: 09:15–15:30 IST, Monday–Friday.
 * Used to auto-stop live price polling outside trading windows.
 */
export function getISTParts(date = new Date()) {
  // IST is UTC+5:30 with no DST.
  const istMs = date.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  return {
    day: ist.getUTCDay(), // 0 = Sunday
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
    date: ist,
  };
}

export function isMarketOpen(date = new Date()): boolean {
  const { day, hours, minutes } = getISTParts(date);
  if (day === 0 || day === 6) return false;
  const mins = hours * 60 + minutes;
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}

export function formatISTTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
}
