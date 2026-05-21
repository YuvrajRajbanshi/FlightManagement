"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/useUserStore";
import { useFlightStore } from "@/store/useFlightStore";
import { createClient } from "@/lib/supabase/client";
import { AIRPORTS, getAirportSuggestions } from "@/lib/airports";
import { SearchWarningModal } from "@/components/SearchWarningModal";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const { session, reset: resetUser } = useUserStore();
  const { setSearchQuery, setBookingStep } = useFlightStore();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [passengerCount, setPassengerCount] = useState("1");
  const [showWarningModal, setShowWarningModal] = useState(false);

  const [originSuggestions, setOriginSuggestions] = useState<typeof AIRPORTS>(
    [],
  );
  const [destSuggestions, setDestSuggestions] = useState<typeof AIRPORTS>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const handleOriginChange = (value: string) => {
    setOrigin(value.toUpperCase());
    if (value) {
      setOriginSuggestions(getAirportSuggestions(value));
      setShowOriginDropdown(true);
    } else {
      setShowOriginDropdown(false);
    }
  };

  const handleDestChange = (value: string) => {
    setDestination(value.toUpperCase());
    if (value) {
      setDestSuggestions(getAirportSuggestions(value));
      setShowDestDropdown(true);
    } else {
      setShowDestDropdown(false);
    }
  };

  const selectOrigin = (airport: (typeof AIRPORTS)[0]) => {
    setOrigin(airport.code);
    setShowOriginDropdown(false);
  };

  const selectDestination = (airport: (typeof AIRPORTS)[0]) => {
    setDestination(airport.code);
    setShowDestDropdown(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetUser();
    router.push("/auth/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) {
      toast.error("Please fill in all fields");
      return;
    }
    setShowWarningModal(true);
  };

  const handleConfirmSearch = () => {
    setShowWarningModal(false);
    setSearchQuery({
      origin,
      destination,
      departureDate,
      passengerCount: parseInt(passengerCount),
    });
    setBookingStep("SELECT_FLIGHT");
    router.push("/flights");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SearchWarningModal
        isOpen={showWarningModal}
        onConfirm={handleConfirmSearch}
        onCancel={() => setShowWarningModal(false)}
      />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">✈️ SkyBook</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session.user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                ✈️ Search Flights
              </h2>

              <form onSubmit={handleSearch} className="space-y-6">
                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      onFocus={() => origin && setShowOriginDropdown(true)}
                      placeholder="e.g., DEL, NYC"
                      maxLength={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase text-gray-900 placeholder-gray-500 font-semibold bg-white"
                    />
                    {showOriginDropdown && originSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {originSuggestions.map((airport) => (
                          <button
                            key={airport.code}
                            type="button"
                            onClick={() => selectOrigin(airport)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition"
                          >
                            <span className="font-bold text-blue-600">
                              {airport.code}
                            </span>
                            <span className="text-gray-700 ml-3">
                              {airport.city}, {airport.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => handleDestChange(e.target.value)}
                      onFocus={() => destination && setShowDestDropdown(true)}
                      placeholder="e.g., LAX, BOM"
                      maxLength={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase text-gray-900 placeholder-gray-500 font-semibold bg-white"
                    />
                    {showDestDropdown && destSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {destSuggestions.map((airport) => (
                          <button
                            key={airport.code}
                            type="button"
                            onClick={() => selectDestination(airport)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition"
                          >
                            <span className="font-bold text-blue-600">
                              {airport.code}
                            </span>
                            <span className="text-gray-700 ml-3">
                              {airport.city}, {airport.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Passengers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passengers *
                    </label>
                    <select
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Passenger" : "Passengers"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition text-lg"
                >
                  🔍 Search Flights
                </button>
              </form>

              {/* Quick Links to Popular Routes */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Popular Routes:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { from: "DEL", to: "BOM", label: "Delhi → Mumbai" },
                    { from: "BOM", to: "BLR", label: "Mumbai → Bangalore" },
                    { from: "DEL", to: "LAX", label: "Delhi → LA" },
                  ].map((route) => (
                    <button
                      key={`${route.from}-${route.to}`}
                      type="button"
                      onClick={() => {
                        setOrigin(route.from);
                        setDestination(route.to);
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 rounded-full text-gray-700 hover:text-blue-700"
                    >
                      {route.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <Link
              href="/my-bookings"
              className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900">My Bookings</h3>
              <p className="text-sm text-gray-600 mt-2">
                View and manage your bookings
              </p>
            </Link>

            <div className="block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="font-semibold text-gray-900">Quick Tips</h3>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>✓ Search Indian & international flights</li>
                <li>✓ Select seats on interactive map</li>
                <li>✓ Get instant PNR confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
