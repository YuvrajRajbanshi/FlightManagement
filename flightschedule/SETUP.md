# SkyBook Setup & Deployment Guide

## ✨ What's Included

SkyBook is a complete flight booking PWA with:

- 🔐 **Authentication**: Register/Login with Supabase Auth
- ✈️ **Flight Search**: Search flights by route and date
- 💺 **Seat Selection**: Interactive seat map with Realtime updates
- 📋 **Bookings**: PNR confirmation and booking management
- 🔄 **Reschedule**: Change flights with fee calculation
- ❌ **Cancellation**: Cancel bookings (with 2-hour restriction)
- 📱 **PWA**: Installable on mobile, offline support
- 🎨 **UI**: Beautiful Tailwind CSS design

---

## 🚀 Deployment Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project name, password, and region
4. Wait for project to be created (2-3 minutes)
5. Copy your project URL and anon key

### Step 2: Run Database Migrations

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy-paste contents of `supabase/migrations/20250521000001_initial_schema.sql`
4. Click "Run"
5. Wait for completion

**What this creates:**

- `flights` table with routes and pricing
- `seats` table with reservation tracking
- `bookings` table with user bookings
- `passengers` table with passenger details
- `reschedules` table with rescheduling history
- RLS policies for data privacy
- Atomic functions for safe seat reservation and cancellation

### Step 3: Configure Environment

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_APP_NAME=SkyBook
   ```

3. **Never commit `.env.local`** (it's in .gitignore)

### Step 4: Install Dependencies & Run

```bash
cd flightschedule
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Testing the App

### 1. Create Test Account

- Go to `/auth/register`
- Sign up with email and password
- Confirm you can log in

### 2. Add Test Flights (SQL)

```sql
INSERT INTO flights (airline, origin, destination, departure_time, arrival_time, price, capacity)
VALUES
  ('United', 'NYC', 'LAX', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 5 hours', 299.99, 180),
  ('Delta', 'NYC', 'LAX', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours', 349.99, 200),
  ('American', 'NYC', 'MIA', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 3 hours', 199.99, 150);

-- Create seats for each flight
INSERT INTO seats (flight_id, seat_number, status)
SELECT f.id,
       CONCAT(CHR(65 + (row_number() OVER (PARTITION BY f.id) - 1) / 30),
              LPAD(((row_number() OVER (PARTITION BY f.id) - 1) % 30 + 1)::text, 2, '0')),
       'available'
FROM flights f, generate_series(1, 180);
```

### 3. Test Booking Flow

1. Search flights (NYC → LAX, any date)
2. Click a flight
3. Select a seat
4. Fill passenger details
5. Confirm booking (you'll get a PNR)
6. View in "My Bookings"

### 4. Test Reschedule

1. Go to "My Bookings"
2. Click "Reschedule" on a booking
3. Select alternative flight
4. Confirm with fee

### 5. Test PWA

- **Desktop**: Click install icon in address bar
- **Mobile**: Use "Add to Home Screen" (Chrome/Safari)
- **Offline**: Disable internet, My Bookings still works

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│          SkyBook Frontend               │
│        (Next.js + React 19)             │
├─────────────────────────────────────────┤
│   Zustand Store (Persist Middleware)    │
│  - useFlightStore: search, seat, booking
│  - useUserStore: session, bookings      │
├─────────────────────────────────────────┤
│   Supabase Client (SSR + Browser)       │
│     - Auth (JWT in cookies)             │
│     - Realtime (seat map updates)       │
│     - RLS (row-level security)          │
├─────────────────────────────────────────┤
│   PostgreSQL Database                   │
│   - flights, seats, bookings, passengers
│   - Atomic functions for race conditions
│   - 2-hour pre-departure restriction    │
└─────────────────────────────────────────┘
```

---

## 🔑 Database Schema

### flights

- `id` (UUID): Primary key
- `airline` (VARCHAR): Airline name
- `origin`, `destination` (VARCHAR): 3-letter airport codes
- `departure_time`, `arrival_time` (TIMESTAMP): Flight times
- `price` (DECIMAL): Per-person price
- `capacity` (INTEGER): Total seats

### seats

- `id` (UUID): Primary key
- `flight_id` (UUID): References flights
- `seat_number` (VARCHAR): e.g., "12A"
- `status` (VARCHAR): 'available', 'reserved', 'booked'
- `user_id` (UUID): Nullable, who reserved it

### bookings

- `id` (UUID): Primary key
- `user_id` (UUID): References auth.users
- `flight_id` (UUID): References flights
- `pnr` (VARCHAR): Booking reference (e.g., "PNR123456")
- `status` (VARCHAR): 'confirmed', 'rescheduled', 'cancelled'

### passengers

- `id` (UUID): Primary key
- `booking_id` (UUID): References bookings
- `name`, `passport_number`, `nationality`, `date_of_birth`

### reschedules

- `id` (UUID): Primary key
- `booking_id` (UUID): Which booking was rescheduled
- `old_flight_id`, `new_flight_id`: Flight change
- `rescheduling_fee` (DECIMAL): Fee charged

---

## 🔐 Security Features

1. **Row-Level Security (RLS)**
   - Users only see their own bookings
   - Anonymous users can see flights but not bookings

2. **Atomic Seat Reservation**
   - `reserve_seat()` RPC prevents race conditions
   - Two users can't book the same seat simultaneously

3. **2-Hour Cancellation Restriction**
   - `cancel_booking()` RPC enforces restriction at DB level
   - Prevents last-minute cancellations

4. **Auth Key Separation**
   - Only ANON_KEY exposed to client
   - SERVICE_ROLE_KEY kept on server (if needed for migrations)

---

## 🧪 Environment Variables

| Variable                        | Required | Example                       |
| ------------------------------- | -------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | `https://project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | `eyJ...` (long JWT)           |
| `NEXT_PUBLIC_APP_NAME`          | No       | `SkyBook`                     |

---

## 📱 PWA Features

- **Installable**: Works on all modern browsers (Chrome, Edge, Safari)
- **Offline**: My Bookings page cached and viewable offline
- **Service Worker**: Automatic with next-pwa
- **Manifest**: App shortcuts to Search and Bookings

**To Install:**

- Desktop: Click install icon in address bar
- Mobile: "Add to Home Screen" → "Install app"

---

## 🚀 Production Deployment

### Option 1: Vercel (Recommended)

```bash
git push origin main
# Vercel auto-deploys on push
```

1. Connect GitHub to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on main branch push

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t skybook .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... skybook
```

### Option 3: Traditional Node Server

```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

### "Cannot GET /flights"

- Make sure `/flights` page is created ✓
- Clear `.next` build cache: `rm -rf .next`

### "Supabase connection error"

- Check credentials in `.env.local`
- Ensure Supabase project is active
- Test in Supabase dashboard

### "Seat already booked"

- Realtime sync issue; refresh page
- Check database directly in Supabase

### PWA not installing

- Use Chrome/Edge (not Safari on desktop)
- On mobile, use "Add to Home Screen"
- Check manifest.json is valid

### Migrations failed

- Run each migration individually in Supabase SQL editor
- Check PostgreSQL syntax
- Ensure RLS is enabled on tables

---

## 📚 API Functions (in src/lib/api.ts)

```typescript
// Search
searchFlights(origin, destination, departureDate);
getFlightById(flightId);
getFlightSeats(flightId);

// Booking
reserveSeat(flightId, seatId, userId);
createBooking(flightId, selectedSeat, passengerDetails);
getBookingWithDetails(bookingId);

// Management
getUserBookings(userId);
cancelBooking(bookingId);
createReschedule(bookingId, newFlightId, reschedulingFee);
```

---

## 🎯 Next Features to Add

- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] SMS confirmations
- [ ] Luggage management
- [ ] Seat upgrades
- [ ] Travel insurance
- [ ] Group bookings
- [ ] Loyalty program
- [ ] Dynamic pricing
- [ ] Multi-city bookings

---

## 📞 Support

For issues:

1. Check this guide
2. Review Supabase docs: https://supabase.com/docs
3. Check Next.js docs: https://nextjs.org/docs
4. Review GitHub Issues in your repo

---

## ✅ Checklist Before Production

- [ ] Supabase backups enabled
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Auth emails configured
- [ ] SSL certificate valid
- [ ] PWA manifest tested
- [ ] Mobile app tested on real device
- [ ] Performance audited (Lighthouse)
- [ ] Security audit completed
- [ ] Monitoring/analytics set up

---

**SkyBook is ready to fly! 🚀✈️**
