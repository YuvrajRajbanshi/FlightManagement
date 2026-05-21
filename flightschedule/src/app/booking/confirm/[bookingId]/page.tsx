"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBookingWithDetails } from "@/lib/api";
import { useFlightStore } from "@/store/useFlightStore";

type BookingDetails = {
  id: string;
  pnr: string;
  status: string;
  flights: {
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    airline: string;
  };
  passengers: Array<{
    name: string;
    passport_number: string;
    nationality: string;
    date_of_birth: string;
  }>;
};

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const { reset } = useFlightStore();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await getBookingWithDetails(bookingId);
        if (data) {
          setBooking(data as BookingDetails);
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

  const handleNewBooking = () => {
    reset();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading confirmation...</p>
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
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const passenger = booking.passengers?.[0];
  const flight = booking.flights;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your flight has been successfully booked
          </p>
        </div>

        {/* PNR Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-blue-600">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-4xl font-bold text-blue-600">{booking.pnr}</p>
            <p className="text-xs text-gray-500 mt-2">
              Save this for your records
            </p>
          </div>

          {/* Flight Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Airline</p>
              <p className="font-semibold text-gray-900">{flight?.airline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Route</p>
              <p className="font-semibold text-gray-900">
                {flight?.origin} → {flight?.destination}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Departure</p>
              <p className="font-semibold text-gray-900">
                {flight?.departure_time
                  ? new Date(flight.departure_time).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        {passenger && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Passenger Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{passenger.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Passport Number</p>
                <p className="font-semibold text-gray-900">
                  {passenger.passport_number}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nationality</p>
                <p className="font-semibold text-gray-900">
                  {passenger.nationality}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-900">
                  {new Date(passenger.date_of_birth).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">
            ✈️ Important Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Arrive at the airport 2-3 hours before departure</li>
            <li>• Bring your passport and booking reference</li>
            <li>• Check-in opens 24 hours before departure</li>
            <li>• Cancellations allowed up to 2 hours before departure</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleNewBooking}
            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700"
          >
            Book Another Flight
          </button>
          <Link
            href="/my-bookings"
            className="flex-1 text-center bg-gray-600 text-white font-semibold py-3 rounded-md hover:bg-gray-700"
          >
            View My Bookings
          </Link>
        </div>
      </main>
    </div>
  );
}
