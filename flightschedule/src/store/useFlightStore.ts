import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BookingStep =
  | "SEARCH"
  | "SELECT_FLIGHT"
  | "SELECT_SEAT"
  | "PASSENGER_DETAILS"
  | "CONFIRMED";

type FlightStore = {
  // Search
  searchQuery: {
    origin: string;
    destination: string;
    departureDate: string;
    passengerCount: number;
  };
  setSearchQuery: (query: Partial<FlightStore["searchQuery"]>) => void;

  // Flight selection
  selectedFlight: {
    id: string;
    airline: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
  } | null;
  setSelectedFlight: (flight: FlightStore["selectedFlight"]) => void;

  // Seat selection
  selectedSeat: string | null;
  setSelectedSeat: (seat: string | null) => void;

  // Booking step
  bookingStep: BookingStep;
  setBookingStep: (step: BookingStep) => void;

  // Passenger details
  passengerDetails: {
    name: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
  };
  setPassengerDetails: (
    details: Partial<FlightStore["passengerDetails"]>,
  ) => void;

  // Reset
  reset: () => void;
};

const initialState = {
  searchQuery: {
    origin: "",
    destination: "",
    departureDate: "",
    passengerCount: 1,
  },
  selectedFlight: null,
  selectedSeat: null,
  bookingStep: "SEARCH" as BookingStep,
  passengerDetails: {
    name: "",
    passportNumber: "",
    nationality: "",
    dateOfBirth: "",
  },
};

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSearchQuery: (query) =>
        set((state) => ({
          searchQuery: { ...state.searchQuery, ...query },
        })),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassengerDetails: (details) =>
        set((state) => ({
          passengerDetails: { ...state.passengerDetails, ...details },
        })),
      reset: () => set(initialState),
    }),
    {
      name: "flight-store",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        passengerDetails: {
          name: state.passengerDetails.name,
          nationality: state.passengerDetails.nationality,
          dateOfBirth: state.passengerDetails.dateOfBirth,
        },
      }),
    },
  ),
);
