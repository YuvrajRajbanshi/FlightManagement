"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          It looks like you've lost your internet connection. Some features may
          not be available, but you can still view your cached bookings.
        </p>

        <div className="space-y-4">
          <Link
            href="/my-bookings"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            View My Bookings
          </Link>
          <p className="text-sm text-gray-600">
            Please check your connection and try again for full functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
