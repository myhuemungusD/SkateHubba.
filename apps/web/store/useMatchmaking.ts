import { create } from "zustand";

interface MatchState {
  searching: boolean;
  lobbyId: string | null;
  ticketId: string | null;
  startMatch: (uid: string, mode: string, skill?: number) => Promise<void>;
  cancelMatch: (uid: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  searching: false,
  lobbyId: null,
  ticketId: null,

  startMatch: async (uid, mode, skill = 100) => {
    set({ searching: true });

    const res = await fetch("/api/match/start", {
      method: "POST",
      body: JSON.stringify({ uid, mode, skill }),
    }).then((r) => r.json());

    set({ ticketId: res.ticketId });
  },

  cancelMatch: async (uid) => {
    const state = get();

    await fetch("/api/match/cancel", {
      method: "POST",
      body: JSON.stringify({ uid, ticketId: state.ticketId }),
    });

    set({ searching: false, ticketId: null, lobbyId: null });
  },
}));
