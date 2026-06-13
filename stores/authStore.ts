import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { UserProfile } from "@/types";

interface AuthStore {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  isGuest: boolean;
  setGuest: (isGuest: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isGuest: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setGuest: (isGuest) => set({ isGuest }),
}));
