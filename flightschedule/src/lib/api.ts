import { createClient } from "@/lib/supabase/client";

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
) {
  const supabase = createClient();

  console.log("🔍 Searching flights:", { origin, destination, departureDate });

  // Search ALL flights for this route, ignore date for now
  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("origin", origin.trim().toUpperCase())
    .eq("destination", destination.trim().toUpperCase())
    .order("departure_time", { ascending: true });

  console.log("📊 Found flights:", data?.length, "Error:", error);

  if (error) {
    console.error("❌ Search error:", error);
    return [];
  }

  return data || [];
}

export async function getFlightById(flightId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("id", flightId)
    .single();

  if (error) {
    console.error("Fetch error:", error);
    return null;
  }

  return data;
}

export async function getFlightSeats(flightId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("seats")
    .select("*")
    .eq("flight_id", flightId)
    .order("seat_number", { ascending: true });

  if (error) {
    console.error("Fetch seats error:", error);
    return [];
  }

  return data || [];
}

export async function reserveSeat(
  flightId: string,
  seatId: string,
  userId: string,
) {
  const supabase = createClient();

  console.log("🔍 Attempting to reserve seat:", { flightId, seatId, userId });

  // First check if seat exists and is available
  const { data: seatData, error: checkError } = await (supabase as any)
    .from("seats")
    .select("*")
    .eq("id", seatId)
    .eq("flight_id", flightId)
    .single();

  console.log("📊 Seat check:", { seatData, checkError });

  if (checkError || !seatData) {
    console.error("❌ Seat not found:", checkError);
    return false;
  }

  const seat = seatData as any;
  if (seat.status !== "available") {
    console.error("❌ Seat not available, status:", seat.status);
    return false;
  }

  // Now update the seat
  const { data: updateData, error: updateError } = await (supabase as any)
    .from("seats")
    .update({ status: "reserved", user_id: userId })
    .eq("id", seatId)
    .eq("flight_id", flightId)
    .select();

  console.log("✅ Seat update result:", { updateData, updateError });

  if (updateError) {
    console.error("Reserve seat error:", updateError);
    return false;
  }

  return updateData && updateData.length > 0;
}

export async function createBooking(
  flightId: string,
  selectedSeat: string,
  passengerDetails: {
    name: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
  },
): Promise<{ id: string; pnr: string; status: string; user_id: string; flight_id: string }> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    throw new Error("User not authenticated");
  }

  // Generate PNR
  const pnr = "PNR" + Date.now().toString().slice(-6);

  // Create booking
  const { data: bookingData, error: bookingError } = await (supabase as any)
    .from("bookings")
    .insert({
      user_id: userData.user.id,
      flight_id: flightId,
      pnr,
      status: "confirmed",
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Booking error:", bookingError);
    throw bookingError;
  }

  if (!bookingData) {
    throw new Error("Failed to create booking");
  }

  // Add passenger
  const { error: passengerError } = await (supabase as any).from("passengers").insert({
    booking_id: bookingData.id,
    name: passengerDetails.name,
    passport_number: passengerDetails.passportNumber,
    nationality: passengerDetails.nationality,
    date_of_birth: passengerDetails.dateOfBirth,
  });

  if (passengerError) {
    console.error("Passenger error:", passengerError);
    throw passengerError;
  }

  // Update seat status to booked
  const { error: seatError } = await (supabase as any)
    .from("seats")
    .update({ status: "booked" })
    .eq("seat_number", selectedSeat)
    .eq("flight_id", flightId);

  if (seatError) {
    console.error("Seat update error:", seatError);
    throw seatError;
  }

  return bookingData;
}

export async function getBookingWithDetails(bookingId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      flights:flight_id(*),
      passengers(*)
    `,
    )
    .eq("id", bookingId)
    .single();

  if (error) {
    console.error("Fetch booking error:", error);
    return null;
  }

  return data;
}

export async function getUserBookings(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      flights:flight_id(origin, destination, departure_time, arrival_time),
      passengers(name)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch bookings error:", error);
    return [];
  }

  return data || [];
}

export async function cancelBooking(bookingId: string) {
  const supabase = createClient();

  const { data, error } = await (supabase as any).rpc("cancel_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    console.error("Cancel booking error:", error.message);
    throw error;
  }

  return data;
}

export async function createReschedule(
  bookingId: string,
  newFlightId: string,
  reschedulingFee: number,
) {
  const supabase = createClient();

  const { data: booking } = await (supabase as any)
    .from("bookings")
    .select("flight_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    throw new Error("Booking not found");
  }

  const { data, error } = await (supabase as any)
    .from("reschedules")
    .insert({
      booking_id: bookingId,
      old_flight_id: booking.flight_id,
      new_flight_id: newFlightId,
      rescheduling_fee: reschedulingFee,
    })
    .select()
    .single();

  if (error) {
    console.error("Reschedule error:", error);
    throw error;
  }

  // Update booking flight
  const { error: updateError } = await (supabase as any)
    .from("bookings")
    .update({
      flight_id: newFlightId,
      status: "rescheduled",
    })
    .eq("id", bookingId);

  if (updateError) {
    throw updateError;
  }

  return data;
}
