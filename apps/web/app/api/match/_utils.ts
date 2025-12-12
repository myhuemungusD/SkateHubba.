export type MatchTicket = {
  uid: string;
  ts: number;
};

export function asErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export function parseMatchTicket(value: unknown): MatchTicket | null {
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;

    const ticket = parsed as { uid?: unknown; ts?: unknown };
    if (typeof ticket.uid !== "string") return null;
    if (typeof ticket.ts !== "number") return null;

    return { uid: ticket.uid, ts: ticket.ts };
  } catch {
    return null;
  }
}
