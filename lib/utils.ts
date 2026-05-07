export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatWatts(w: number): string {
  if (w >= 1000) return `${(w / 1000).toFixed(1)} kW`;
  return `${w} W`;
}

export function calcSavingsPct(actual: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Math.round(((baseline - actual) / baseline) * 100);
}
