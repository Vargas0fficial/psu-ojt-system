function parseTimeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function computeDurationMinutesClient(
  timeIn: string | null,
  timeOut: string | null
): number {
  if (!timeIn || !timeOut) return 0;
  const start = parseTimeToMinutes(timeIn);
  const end = parseTimeToMinutes(timeOut);
  let diff = end - start;
  if (diff < 0) diff += 24 * 60;
  return diff;
}
