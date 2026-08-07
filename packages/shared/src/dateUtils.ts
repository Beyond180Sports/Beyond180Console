function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

/** True when createdAt is on or before the end of the filter calendar day. */
export function isOnOrBeforeFilterDate(
  createdAt: string,
  filterDate: Date | null,
): boolean {
  if (!filterDate) {
    return true;
  }
  return new Date(createdAt) <= endOfDay(filterDate);
}

/** Normalize picker output to the start of the selected calendar day. */
export function normalizeFilterDate(date: Date): Date {
  return startOfDay(date);
}
