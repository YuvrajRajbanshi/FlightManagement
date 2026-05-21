"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBookingWithDetails,
  searchFlights,
  createReschedule,
} from "@/lib/api";

type BookingDetails = {
  id: string;
  pnr: string;
  flights: {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    price: number;
  };
};

type AvailableFlight = {
  id: string;
  airline: string;
  departure_time: string;
  arrival_time: string;
  price: number;
};

const RESCHEDULING_FEE = 25;

export default function ReschedulePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [availableFlights, setAvailableFlights] = useState<AvailableFlight[]>(
    [],
  );
  const [selectedNewFlight, setSelectedNewFlight] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await getBookingWithDetails(bookingId);
        if (data) {
          setBooking(data as unknown as BookingDetails);

          // Search for alternative flights
          const flights = await searchFlights(
            data.flights.origin,
            data.flights.destination,
            new Date(data.flights.departure_time).toISOString().split("T")[0],
          );
          setAvailableFlights(
            flights.filter(
              (f: any) => f.id !== data.flights.id,
            ) as AvailableFlight[],
          );
        } else {
          setError("Booking not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleReschedule = async () => {
    if (!selectedNewFlight || !booking) {
      setError("Please select a new flight");
      return;
    }

    setRescheduling(true);
    setError(null);

    try {
      await createReschedule(booking.id, selectedNewFlight, RESCHEDULING_FEE);
      router.push("/my-bookings?rescheduled=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reschedule");
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {error || "Booking not found"}
          </h2>
          <Link
            href="/my-bookings"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  const selectedFlight = availableFlights.find(
    (f) => f.id === selectedNewFlight,
  );
  const priceDifference = selectedFlight
    ? selectedFlight.price - booking.flights.price
    : 0;
  const totalFee = RESCHEDULING_FEE + Math.max(0, priceDifference);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/my-bookings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to My Bookings
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Reschedule Flight
          </h1>
          <p className="text-gray-600 mt-1">Booking Reference: {booking.pnr}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Booking */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Current Booking
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-semibold text-gray-900">
                    {booking.flights.origin} → {booking.flights.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.flights.departure_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fare</p>
                  <p className="font-semibold text-gray-900">
                    ${booking.flights.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Available Flights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Alternative Flights
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {availableFlights.length === 0 ? (
                <p className="text-gray-600">
                  No alternative flights available for this route.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableFlights.map((flight) => (
                    <label
                      key={flight.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedNewFlight === flight.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="flight"
                        value={flight.id}
                        checked={selectedNewFlight === flight.id}
                        onChange={(e) => setSelectedNewFlight(e.target.value)}
                        className="mr-3"
                      />
                      <div className="inline-block w-full">
                        <p className="font-semibold text-gray-900">
                          {new Date(flight.departure_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          - ${flight.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(flight.arrival_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rescheduling Summary
              </h3>

              <div className="space-y-3 border-b pb-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">Current Fare</p>
                  <p className="font-semibold text-gray-900">
                    ${booking.flights.price}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">New Fare</p>
                  <p className="font-semibold text-gray-900">
                    ${selectedFlight?.price || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-b pb-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">Rescheduling Fee</p>
                  <p className="font-semibold text-gray-900">
                    ${RESCHEDULING_FEE}
                  </p>
                </div>
                {priceDifference > 0 && (
                  <div>
                    <p className="text-xs text-gray-600">Price Difference</p>
                    <p className="font-semibold text-gray-900">
                      +${priceDifference}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Total Amount Due
                </p>
                <p className="text-2xl font-bold text-blue-600">${totalFee}</p>
              </div>

              <button
                onClick={handleReschedule}
                disabled={!selectedNewFlight || rescheduling}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {rescheduling ? "Processing..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
