"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { getUserBookings } from "@/lib/api";

type BookingWithDetails = {
  id: string;
  pnr: string;
  status: "confirmed" | "rescheduled" | "cancelled";
  flights: {
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
  };
  passengers: Array<{ name: string }>;
};

export default function MyBookingsPage() {
  const router = useRouter();
  const { session } = useUserStore();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.user?.id) {
      router.push("/auth/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings(session.user!.id);
        setBookings(data as BookingWithDetails[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load bookings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session.user?.id, router]);

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800",
      rescheduled: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const canCancel = (departureTime: string) => {
    const departure = new Date(departureTime);
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return departure > twoHoursFromNow;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
            >
              ← Back Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <div className="text-right">
            <p className="text-gray-700">{session.user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-900">
              No bookings yet
            </h2>
            <p className="text-gray-600 mt-2">
              Start by searching and booking a flight
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search Flights
            </Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  {/* PNR */}
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Booking Reference
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {booking.pnr}
                    </p>
                  </div>

                  {/* Route & Passenger */}
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Route
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {booking.flights.origin} → {booking.flights.destination}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.passengers[0]?.name || "Passenger"}
                    </p>
                  </div>

                  {/* Departure */}
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Departure
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(
                        booking.flights.departure_time,
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        booking.flights.departure_time,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Status
                    </p>
                    <p
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {booking.status === "confirmed" &&
                      canCancel(booking.flights.departure_time) && (
                        <>
                          <Link
                            href={`/my-bookings/${booking.id}/reschedule`}
                            className="text-center px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                          >
                            Reschedule
                          </Link>
                          <button
                            onClick={() =>
                              alert("Cancel functionality to be implemented")
                            }
                            className="text-center px-3 py-2 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    {!canCancel(booking.flights.departure_time) &&
                      booking.status === "confirmed" && (
                        <p className="text-xs text-red-600">
                          Cannot cancel within 2 hours of departure
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
