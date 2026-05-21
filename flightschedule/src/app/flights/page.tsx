"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useFlightStore } from "@/store/useFlightStore";
import { searchFlights } from "@/lib/api";

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

export default function FlightsPage() {
  const router = useRouter();
  const { searchQuery, setSelectedFlight, setBookingStep } = useFlightStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !searchQuery.origin ||
      !searchQuery.destination ||
      !searchQuery.departureDate
    ) {
      router.push("/");
      return;
    }

    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadingToast = toast.loading("🔍 Searching flights...");

        const results = await searchFlights(
          searchQuery.origin,
          searchQuery.destination,
          searchQuery.departureDate,
        );

        toast.dismiss(loadingToast);

        setFlights(results);
        if (results.length === 0) {
          const errorMsg =
            "No flights found for this route. Try different dates.";
          setError(errorMsg);
          toast.error(errorMsg);
        } else {
          toast.success(`✈️ Found ${results.length} flight(s)!`);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to search flights";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchQuery, router]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight({
      id: flight.id,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departure_time,
      arrivalTime: flight.arrival_time,
      price: flight.price,
    });
    setBookingStep("SELECT_SEAT");
    router.push(`/flights/${flight.id}/seats`);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Search
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Flights from {searchQuery.origin} to {searchQuery.destination}
          </h1>
          <p className="text-gray-600 mt-1">
            {formatDate(searchQuery.departureDate)} •{" "}
            {searchQuery.passengerCount}{" "}
            {searchQuery.passengerCount === 1 ? "Passenger" : "Passengers"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching for flights...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && flights.length > 0 && (
          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer border-l-4 border-blue-500"
                onClick={() => handleSelectFlight(flight)}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  {/* Airline & Flight */}
                  <div>
                    <p className="text-sm text-gray-600">Airline</p>
                    <p className="font-semibold text-gray-900">
                      {flight.airline}
                    </p>
                  </div>

                  {/* Departure */}
                  <div>
                    <p className="text-sm text-gray-600">Departs</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatTime(flight.departure_time)}
                    </p>
                    <p className="text-xs text-gray-500">{flight.origin}</p>
                  </div>

                  {/* Duration */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {calculateDuration(
                        flight.departure_time,
                        flight.arrival_time,
                      )}
                    </p>
                  </div>

                  {/* Arrival */}
                  <div>
                    <p className="text-sm text-gray-600">Arrives</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatTime(flight.arrival_time)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {flight.destination}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">From</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${flight.price}
                    </p>
                    <p className="text-xs text-gray-500">per person</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && flights.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-gray-900">
              No flights available
            </h2>
            <p className="text-gray-600 mt-2">Try different search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
