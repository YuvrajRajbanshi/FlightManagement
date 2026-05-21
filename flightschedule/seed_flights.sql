-- Add sample flights
INSERT INTO flights (airline, origin, destination, departure_time, arrival_time, price, capacity)
VALUES
  ('United Airlines', 'NYC', 'LAX', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 5 hours 30 minutes', 299.99, 180),
  ('Delta Air Lines', 'NYC', 'LAX', NOW() + INTERVAL '2 days 4 hours', NOW() + INTERVAL '2 days 9 hours 45 minutes', 349.99, 200),
  ('American Airlines', 'NYC', 'MIA', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 3 hours 15 minutes', 199.99, 150),
  ('Southwest Airlines', 'NYC', 'MIA', NOW() + INTERVAL '1 day 6 hours', NOW() + INTERVAL '1 day 9 hours 30 minutes', 179.99, 165),
  ('United Airlines', 'LAX', 'NYC', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 5 hours', 279.99, 190),
  ('JetBlue Airways', 'LAX', 'MIA', NOW() + INTERVAL '2 days 12 hours', NOW() + INTERVAL '2 days 20 hours', 249.99, 175);

-- Add seats for each flight (6 columns, 30 rows = 180 seats per flight)
DO $$
DECLARE
  flight_record RECORD;
  row_num INT;
  col_char CHAR;
  seat_num VARCHAR;
BEGIN
  FOR flight_record IN SELECT id FROM flights LOOP
    FOR row_num IN 1..30 LOOP
      FOR col_char IN 'A'..'F' LOOP
        seat_num := col_char || LPAD(row_num::TEXT, 2, '0');
        INSERT INTO seats (flight_id, seat_number, status)
        VALUES (flight_record.id, seat_num, 'available');
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
