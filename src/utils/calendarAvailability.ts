import type { BusyPeriod } from '../services/calendarApi';

export type AvailableWindow = {
  end: Date;
  start: Date;
};

function overlaps(start: Date, end: Date, busyPeriod: BusyPeriod) {
  const busyStart = new Date(busyPeriod.start);
  const busyEnd = new Date(busyPeriod.end);
  return start < busyEnd && end > busyStart;
}

export function findAvailableWindow(
  dayId: string,
  durationMinutes: number,
  busyPeriods: BusyPeriod[],
): AvailableWindow | null {
  const dayStart = new Date(`${dayId}T08:00:00`);
  const dayEnd = new Date(`${dayId}T20:00:00`);
  const preferredStart = new Date(`${dayId}T12:00:00`);
  const candidates: Date[] = [];

  for (let cursor = new Date(dayStart); cursor < dayEnd; cursor = new Date(cursor.getTime() + 30 * 60_000)) {
    candidates.push(cursor);
  }

  candidates.sort(
    (left, right) =>
      Math.abs(left.getTime() - preferredStart.getTime())
      - Math.abs(right.getTime() - preferredStart.getTime()),
  );

  for (const start of candidates) {
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    if (end > dayEnd) continue;
    if (!busyPeriods.some((busyPeriod) => overlaps(start, end, busyPeriod))) {
      return { end, start };
    }
  }

  return null;
}
