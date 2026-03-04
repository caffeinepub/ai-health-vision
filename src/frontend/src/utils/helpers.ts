import { Severity } from "../backend.d";

/** Convert bigint nanoseconds to a JS Date */
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

/** Format a date for display */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert confidence score bigint to percentage */
export function confidenceToPercent(score: bigint): number {
  return Number(score);
}

/** Get severity label */
export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case Severity.low:
      return "Low";
    case Severity.medium:
      return "Medium";
    case Severity.high:
      return "High";
    case Severity.emergency:
      return "Emergency";
    default:
      return "Unknown";
  }
}

/** Get severity CSS class */
export function getSeverityClass(severity: Severity): string {
  switch (severity) {
    case Severity.low:
      return "severity-low";
    case Severity.medium:
      return "severity-medium";
    case Severity.high:
      return "severity-high";
    case Severity.emergency:
      return "severity-emergency";
    default:
      return "severity-low";
  }
}

/** Get confidence badge color */
export function getConfidenceColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

/** Convert File to Uint8Array */
export async function fileToUint8Array(
  file: File,
): Promise<Uint8Array<ArrayBuffer>> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
