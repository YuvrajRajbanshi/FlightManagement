# SkyBook - Flight Management PWA

A modern, production-ready flight booking application built with **Next.js 16**, **React 19**, **Supabase**, and **Zustand**. Features complete flight search, seat selection, booking management, and rescheduling capabilities with a responsive Progressive Web App design.

## 📸 Features Overview

### ✈️ Core Booking Flow
- **Flight Search**: Search flights by origin, destination, and date with airport autocomplete
- **Airport Autocomplete**: Support for 24+ airports including major Indian cities and international hubs
- **Seat Selection**: Interactive seat map with real-time availability updates via Supabase Realtime
- **Passenger Details**: Collect and validate passenger information (name, passport, nationality, DOB)
- **Booking Confirmation**: Instant PNR (Passenger Name Record) generation and confirmation display

### 📱 Booking Management
- **My Bookings**: View all your flight bookings with status indicators
- **Reschedule Flights**: Change flights with automatic fee calculation ($25 base + price difference)
- **Cancel Bookings**: Cancel bookings with 2-hour pre-departure restriction
- **Status Tracking**: Real-time booking status (Confirmed, Rescheduled, Cancelled)

### 🎨 User Experience
- **Custom Modals**: Friendly warning dialogs for limited demo flight warnings
- **Toast Notifications**: Real-time notifications with emojis for search, reservations, and errors
- **Responsive Design**: Mobile-first UI that works on all devices
- **Input Validation**: Enhanced input visibility with proper styling and validation

### 🔐 Security & Performance
- **Row-Level Security (RLS)**: All database tables protected with user-level access policies
- **Atomic Operations**: Seat reservation prevents double-booking race conditions
- **Real-time Sync**: Live seat availability updates across all users
- **State Persistence**: Zustand stores with smart localStorage caching
- **Optimistic Updates**: Fast UI responses with server synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Clone and install dependencies:**
```bash
cd flightschedule
npm install
```

2. **Configure environment variables:**

Update `.env` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=SkyBook
```

Get these values from your Supabase project dashboard:
- Go to [supabase.com](https://supabase.com) → Your Project → Settings → API
- Copy the Project URL and Public Anonymous Key

3. **Setup Database:**

Run the SQL migration to create tables and policies:

1. Open your Supabase project → SQL Editor
2. Create a new query and paste the contents of `supabase/migrations/20250521000001_initial_schema.sql`
3. Click "Run" to execute the migration

This creates:
- `flights` - Flight information
- `seats` - Seat availability for each flight
- `bookings` - Booking records with PNR
- `passengers` - Passenger details
- `reschedules` - Reschedule history

4. **Start development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Walkthrough

### Home Page (/)
- Search form with airport autocomplete
- Date picker for departure date
- Demo warning modal explaining limited flight availability
- Tips for finding flights

### Flight Results (/flights)
- List of available flights matching search criteria
- Displays route, airline, departure/arrival times, and price
- Click a flight to proceed to seat selection

### Seat Selection (/flights/[id]/seats)
- Interactive 6-column seat grid
- Real-time seat status updates:
  - **Gray**: Available seats
  - **Yellow**: Reserved (being booked by another user)
  - **Red**: Booked (completed bookings)
  - **Green**: Your selected seat
- Toast notifications for reservation status

### Passenger Details (/booking/[flightId])
- Enter passenger information:
  - Full name
  - Passport number
  - Nationality (3-letter code, auto-uppercase)
  - Date of birth
- Booking summary sidebar showing flight and seat details
- Price display

### Booking Confirmation (/booking/confirm/[bookingId])
- Large PNR display (save for airport check-in)
- Complete flight and passenger information
- Important travel information
- Options to book another flight or view my bookings

### My Bookings (/my-bookings)
- All your flight bookings with status badges
- Quick actions:
  - **Reschedule** (if more than 2 hours before departure)
  - **Cancel** (if more than 2 hours before departure)
- Color-coded status indicators

### Reschedule Flight (/my-bookings/[id]/reschedule)
- Shows current booking details
- Lists alternative flights for same route
- Automatic fee calculation:
  - Rescheduling fee: $25
  - Price difference: charged if new flight is more expensive
- Summary panel with total amount due

## 🏗️ Project Structure

```
flightschedule/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home / Flight search
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # Login page
│   │   │   └── register/page.tsx     # Registration page
│   │   ├── flights/
│   │   │   ├── page.tsx              # Search results
│   │   │   └── [id]/seats/page.tsx   # Seat selection
│   │   ├── booking/
│   │   │   ├── [flightId]/page.tsx   # Passenger details
│   │   │   └── confirm/[bookingId]/page.tsx  # Confirmation
│   │   ├── my-bookings/
│   │   │   ├── page.tsx              # My bookings list
│   │   │   └── [id]/reschedule/page.tsx  # Reschedule flow
│   │   └── offline/page.tsx          # PWA offline page
│   │
│   ├── components/                   # React components
│   │   ├── AuthProvider.tsx          # Session management
│   │   ├── ToastProvider.tsx         # Toast configuration
│   │   └── SearchWarningModal.tsx    # Custom modal
│   │
│   ├── lib/
│   │   ├── api.ts                    # API service layer
│   │   ├── airports.ts               # Airport data & autocomplete
│   │   └── supabase/
│   │       └── client.ts             # Supabase client
│   │
│   ├── store/                        # Zustand stores
│   │   ├── useFlightStore.ts         # Flight & booking state
│   │   └── useUserStore.ts           # User & session state
│   │
│   └── types/
│       └── database.types.ts         # Generated TypeScript types
│
├── supabase/
│   └── migrations/
│       └── 20250521000001_initial_schema.sql  # Database schema
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── service-worker.ts             # PWA service worker
│
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind CSS config
└── next.config.ts                    # Next.js config
```

## 🔧 Technologies & Libraries

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS

### Backend & Database
- **Supabase** - PostgreSQL database + Auth + Realtime
- **Supabase JS Client** - Browser client library
- **PostgreSQL** - Database engine

### State Management
- **Zustand** - Lightweight state management
- **Zustand Persist** - localStorage persistence middleware

### UI & Notifications
- **React Hot Toast** - Toast notifications
- **Custom Modal Component** - Styled modal dialogs

### PWA
- **next-pwa** - Progressive Web App support
- **Service Workers** - Offline functionality

## 🔐 Security Features

### Authentication
- Email/password registration and login via Supabase Auth
- Session-based authentication with tokens
- Automatic logout on session expiry

### Database Security
- **Row-Level Security (RLS)** on all tables
- Users can only view/modify their own bookings
- Seats have atomic transaction protection
- Service role key never exposed to frontend

### Atomic Operations
```sql
-- Prevents double-booking with database-level locking
FUNCTION reserve_seat(flight_id, seat_id, user_id)
- Check if seat is available
- Reserve for user
- Blocks concurrent bookings
```

### Validation
- Client-side input validation
- Server-side RLS policies
- Passenger data validation before booking
- 2-hour pre-departure cancellation/reschedule restriction

## 📊 Airport Coverage

### Indian Airports (12)
- DEL - Delhi (Indira Gandhi)
- BOM - Mumbai (Bombay)
- BLR - Bangalore
- HYD - Hyderabad
- CCU - Kolkata (Calcutta)
- MAA - Chennai (Madras)
- COK - Kochi (Cochin)
- PNQ - Pune
- AMD - Ahmedabad
- JAI - Jaipur
- LKO - Lucknow
- VTZ - Varanasi

### International Hubs (12+)
- NYC - New York (JFK, LGA, EWR)
- LAX - Los Angeles
- LHR - London (Heathrow)
- CDG - Paris (Charles de Gaulle)
- SIN - Singapore (Changi)
- HKG - Hong Kong
- DXB - Dubai
- ICN - Seoul (Incheon)
- NRT - Tokyo (Narita)
- KUL - Kuala Lumpur
- BKK - Bangkok
- BJS - Beijing

## 🎯 Key Implementation Details

### Flight Search
- Airport autocomplete by code or city name
- Date-based filtering
- Real-time results display
- Demo flights refresh daily

### Seat Reservation
- 6-column seat grid layout
- Color-coded availability
- Real-time sync via Supabase Realtime subscriptions
- Toast notifications for status updates
- Prevents double-booking with database locks

### Booking State Management
```javascript
// useFlightStore tracks:
- searchQuery (origin, destination, date)
- selectedFlight (flight details)
- selectedSeat (seat number)
- bookingStep (SEARCH → SEAT_SELECTION → PASSENGER_DETAILS → CONFIRMED)
- passengerDetails (name, passport, nationality, DOB)
```

### PNR Generation
- Unique 6-character alphanumeric code
- Generated on booking creation
- Displayed on confirmation page
- Used for my bookings tracking

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Self-Hosted
```bash
npm run build
npm start
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_NAME`

## 🧪 Testing Checklist

- [ ] Register and login
- [ ] Search for flights
- [ ] View search results
- [ ] Select a seat
- [ ] Enter passenger details
- [ ] Complete booking
- [ ] View confirmation with PNR
- [ ] View my bookings
- [ ] Reschedule a booking
- [ ] Cancel a booking
- [ ] Verify real-time seat updates (open in 2 browser windows)
- [ ] Test offline mode (open offline page)

## 🐛 Troubleshooting

### "Could not find table 'flights'"
- **Solution**: Run database migration in Supabase SQL editor

### Supabase connection fails
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- Verify Supabase project is active
- Clear browser cache

### Seat reservation fails
- Verify RLS policies are enabled on seats table
- Check that user is authenticated
- Try selecting a different seat

### Toast notifications not showing
- Ensure `ToastProvider` is in root layout
- Check browser console for errors
- Verify react-hot-toast is installed

### Offline page not working
- Check that PWA is properly configured
- Install app to home screen first
- Verify service worker is registered

## 📚 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hot Toast](https://react-hot-toast.com)

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

SkyBook Development Team

## 🙏 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review console logs in browser DevTools
- Check Supabase logs and database queries
- Verify all environment variables are set correctly
