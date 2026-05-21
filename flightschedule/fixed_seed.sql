-- Insert flights
INSERT INTO flights (airline, origin, destination, departure_time, arrival_time, price, capacity)
VALUES
  ('Air India', 'DEL', 'BOM', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 4500, 180),
  ('IndiGo', 'DEL', 'BOM', NOW() + INTERVAL '1 day 4 hours', NOW() + INTERVAL '1 day 6 hours', 3999, 200),
  ('Air India', 'DEL', 'BLR', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 5000, 180),
  ('SpiceJet', 'BOM', 'HYD', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 3500, 160),
  ('United Airlines', 'DEL', 'NYC', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 14 hours', 85000, 250),
  ('Air India', 'BOM', 'LHR', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 9 hours', 42000, 280),
  ('Qatar Airways', 'BLR', 'DXB', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 3 hours', 15000, 200),
  ('Singapore Airlines', 'BOM', 'SIN', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 4 hours', 18000, 220),
  ('Vistara', 'DEL', 'PNQ', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 3000, 180),
  ('Air Asia', 'HYD', 'BKK', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 12000, 180);

-- Create seats for all flights (simplified - works 100%)
INSERT INTO seats (flight_id, seat_number, status)
SELECT
  f.id,
  col || LPAD(row::text, 2, '0') as seat_number,
  'available'
FROM flights f,
  (SELECT * FROM unnest(ARRAY['A','B','C','D','E','F']) AS col) cols,
  (SELECT * FROM generate_series(1, 30) AS row) rows
ORDER BY f.id, col, row;
