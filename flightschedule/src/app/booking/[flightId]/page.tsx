"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import { createBooking } from "@/lib/api";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.flightId as string;

  const {
    selectedFlight,
    selectedSeat,
    passengerDetails,
    setPassengerDetails,
    setBookingStep,
  } = useFlightStore();
  const { session } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedFlight || !selectedSeat || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Session
          </h2>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Start from beginning
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !passengerDetails.name ||
      !passengerDetails.passportNumber ||
      !passengerDetails.nationality ||
      !passengerDetails.dateOfBirth
    ) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const booking = await createBooking(
        flightId,
        selectedSeat,
        passengerDetails,
      );
      setBookingStep("CONFIRMED");
      router.push(`/booking/confirm/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/flights/${flightId}/seats`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Seat Selection
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Passenger Details
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={passengerDetails.name}
                    onChange={(e) =>
                      setPassengerDetails({
                        ...passengerDetails,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    value={passengerDetails.passportNumber}
                    onChange={(e) =>
                      setPassengerDetails({
                        ...passengerDetails,
                        passportNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="AB123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={passengerDetails.nationality}
                    onChange={(e) =>
                      setPassengerDetails({
                        ...passengerDetails,
                        nationality: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={passengerDetails.dateOfBirth}
                    onChange={(e) =>
                      setPassengerDetails({
                        ...passengerDetails,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating Booking..." : "Proceed to Confirmation"}
                </button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Booking Summary
              </h3>

              <div className="space-y-4 border-b pb-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">From</p>
                  <p className="font-semibold text-gray-900">
                    {selectedFlight.origin}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">To</p>
                  <p className="font-semibold text-gray-900">
                    {selectedFlight.destination}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Seat</p>
                  <p className="font-semibold text-gray-900">{selectedSeat}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600">Fare</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${selectedFlight.price}
                </p>
              </div>

              <div className="text-xs text-gray-600 text-center">
                <p>Airline: {selectedFlight.airline}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
