"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import { getFlightById, getFlightSeats, reserveSeat } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

type Seat = {
  id: string;
  seat_number: string;
  status: "available" | "reserved" | "booked";
  user_id: string | null;
};

type Flight = {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  capacity: number;
};

export default function SeatsPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.id as string;
  const supabase = createClient();

  const { selectedFlight, selectedSeat, setSelectedSeat, setBookingStep } =
    useFlightStore();
  const { session } = useUserStore();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFlight || selectedFlight.id !== flightId) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const flightData = await getFlightById(flightId);
        const seatsData = await getFlightSeats(flightId);
        setFlight(flightData);
        setSeats(seatsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load seats");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to Realtime updates
    const channel = supabase
      .channel(`seats:flight_id=eq.${flightId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flightId}`,
        },
        (payload: any) => {
          const newSeat = payload.new as Seat;
          setSeats((prev) =>
            prev.map((seat) =>
              seat.id === newSeat.id ? { ...seat, ...newSeat } : seat,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [flightId, selectedFlight, router, supabase]);

  const handleSeatSelect = async (seat: Seat) => {
    if (seat.status !== "available") {
      toast.error(`❌ Seat ${seat.seat_number} is not available`);
      return;
    }

    if (!session.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setReserving(true);
    setError(null);
    const loadingToast = toast.loading(
      `⏳ Reserving seat ${seat.seat_number}...`,
    );

    try {
      const reserved = await reserveSeat(flightId, seat.id, session.user.id);
      if (reserved) {
        toast.dismiss(loadingToast);
        toast.success(`✅ Seat ${seat.seat_number} reserved!`);
        setSelectedSeat(seat.seat_number);
        setBookingStep("PASSENGER_DETAILS");
        setTimeout(() => {
          router.push(`/booking/${flightId}`);
        }, 500);
      } else {
        toast.dismiss(loadingToast);
        const msg = `Seat ${seat.seat_number} is no longer available. Please choose another.`;
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      const msg = err instanceof Error ? err.message : "Failed to reserve seat";
      setError(msg);
      toast.error(msg);
    } finally {
      setReserving(false);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === "booked") return "bg-red-500 cursor-not-allowed";
    if (seat.status === "reserved") return "bg-yellow-500 cursor-not-allowed";
    if (selectedSeat === seat.seat_number) return "bg-green-500";
    return "bg-gray-200 hover:bg-blue-400 cursor-pointer";
  };

  const seatRows = seats.length > 0 ? Math.ceil(seats.length / 6) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading seats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/flights"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Flights
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Select Your Seat
          </h1>
          {flight && (
            <p className="text-gray-600 mt-1">
              {flight.airline} • {flight.origin} → {flight.destination}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          {/* Legend */}
          <div className="mb-8 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Selected</span>
            </div>
          </div>

          {/* Seat Map */}
          <div className="flex justify-center mb-8">
            <div className="inline-block border-2 border-gray-300 rounded-lg p-4">
              <div className="text-center mb-4 font-semibold text-gray-700">
                Cockpit
              </div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
              >
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatSelect(seat)}
                    disabled={seat.status !== "available" || reserving}
                    className={`w-10 h-10 rounded text-xs font-semibold text-white transition ${getSeatColor(seat)}`}
                    title={`${seat.seat_number} - ${seat.status}`}
                  >
                    {seat.seat_number.replace(/[A-F]/, "")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedSeat && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✓ Seat <strong>{selectedSeat}</strong> selected. Proceed to
                passenger details.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (selectedSeat) {
                setBookingStep("PASSENGER_DETAILS");
                router.push(`/booking/${flightId}`);
              } else {
                setError("Please select a seat first");
              }
            }}
            disabled={!selectedSeat || reserving}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {reserving ? "Reserving..." : "Continue to Passenger Details"}
          </button>
        </div>
      </main>
    </div>
  );
}
