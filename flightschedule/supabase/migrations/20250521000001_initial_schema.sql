-- Create flights table
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airline VARCHAR(100) NOT NULL,
  origin VARCHAR(3) NOT NULL,
  destination VARCHAR(3) NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seats table
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(flight_id, seat_number)
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  flight_id UUID NOT NULL REFERENCES flights(id),
  status VARCHAR(20) DEFAULT 'confirmed',
  pnr VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create passengers table
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  passport_number VARCHAR(50) NOT NULL,
  nationality VARCHAR(3) NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reschedules table
CREATE TABLE reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  old_flight_id UUID NOT NULL REFERENCES flights(id),
  new_flight_id UUID NOT NULL REFERENCES flights(id),
  rescheduling_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- Flights RLS: Everyone can read
CREATE POLICY flights_read ON flights FOR SELECT USING (true);

-- Seats RLS: Everyone can read
CREATE POLICY seats_read ON seats FOR SELECT USING (true);

-- Bookings RLS: Users can only see their own bookings
CREATE POLICY bookings_read ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY bookings_insert ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY bookings_update ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Passengers RLS: Users can see passengers in their bookings
CREATE POLICY passengers_read ON passengers FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
);
CREATE POLICY passengers_insert ON passengers FOR INSERT WITH CHECK (
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
);

-- Reschedules RLS: Users can see reschedules for their bookings
CREATE POLICY reschedules_read ON reschedules FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
);
CREATE POLICY reschedules_insert ON reschedules FOR INSERT WITH CHECK (
  booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
);

-- Create function to reserve seat (prevents race condition)
CREATE OR REPLACE FUNCTION reserve_seat(
  p_flight_id UUID,
  p_seat_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE seats
  SET status = 'reserved', user_id = p_user_id
  WHERE id = p_seat_id
    AND flight_id = p_flight_id
    AND status = 'available';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to cancel booking (with 2-hour restriction)
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_departure_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get flight departure time
  SELECT f.departure_time INTO v_departure_time
  FROM bookings b
  JOIN flights f ON b.flight_id = f.id
  WHERE b.id = p_booking_id;

  -- Check if within 2 hours of departure
  IF v_departure_time - INTERVAL '2 hours' <= NOW() THEN
    RAISE EXCEPTION 'Cannot cancel booking within 2 hours of departure';
  END IF;

  -- Update booking status
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

  -- Free up seat
  UPDATE seats
  SET status = 'available', user_id = NULL
  WHERE flight_id = (SELECT flight_id FROM bookings WHERE id = p_booking_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_seats_flight_id ON seats(flight_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX idx_passengers_booking_id ON passengers(booking_id);
CREATE INDEX idx_reschedules_booking_id ON reschedules(booking_id);
