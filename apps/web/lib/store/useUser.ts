import { create } from "zustand";

interface UserState {
  uid: string | null;
  roles: string[];
  orgId: string | null;
  setUser: (u: { uid: string; roles: string[]; orgId: string }) => void;
  clearUser: () => void;
}

export const useUser = create<UserState>((set) => ({
  uid: null,
  roles: [],
  orgId: null,
  setUser: ({ uid, roles, orgId }) => set({ uid, roles, orgId }),
  clearUser: () => set({ uid: null, roles: [], orgId: null }),
}));
