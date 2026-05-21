import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  session: {
    accessToken: string | null;
    user: {
      id: string;
      email: string;
    } | null;
  };
  setSession: (session: UserStore["session"]) => void;

  bookings: Array<{
    id: string;
    pnr: string;
    status: "confirmed" | "rescheduled" | "cancelled";
    flightId: string;
  }>;
  setBookings: (bookings: UserStore["bookings"]) => void;

  reset: () => void;
};

const initialState = {
  session: {
    accessToken: null,
    user: null,
  },
  bookings: [],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session) => set({ session }),
      setBookings: (bookings) => set({ bookings }),
      reset: () => set(initialState),
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        session: {
          accessToken: state.session.accessToken,
          user: state.session.user,
        },
      }),
    },
  ),
);
