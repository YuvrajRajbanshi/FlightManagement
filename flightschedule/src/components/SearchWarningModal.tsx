"use client";

import { useState } from "react";

interface SearchWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SearchWarningModal({
  isOpen,
  onConfirm,
  onCancel,
}: SearchWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">✈️</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Flight Search Info
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            We have a limited set of demo flights for testing purposes.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-gray-900 mb-2">
              💡 If no flights are found:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Try different dates</li>
              <li>✓ Use popular routes below</li>
              <li>✓ Try: DEL↔BOM, BOM↔BLR, etc.</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            This is a demo environment with limited flight data. For production,
            all routes will be available.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Search →
          </button>
        </div>
      </div>
    </div>
  );
}
