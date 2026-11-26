/** True when the date is later than the current moment. Used by server components rendering per request. */
export function isFuture(value: Date | string | null | undefined) {
  if (!value) return false;
  return new Date(value).getTime() > Date.now();
}

/** A date `days` from now. */
export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000);
}
