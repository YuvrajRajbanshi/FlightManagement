# SkyBook - Flight Management PWA

A modern flight booking application built with Next.js 16, React 19, Supabase, and Zustand.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- Supabase account

### 2. Setup

```bash
cd flightschedule
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=SkyBook
```

### 4. Database Setup

1. Go to your Supabase project
2. Create a new migration by running the SQL from `supabase/migrations/20250521000001_initial_schema.sql`
3. Or use Supabase CLI if configured

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Project Structure

```
flightschedule/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout with AuthProvider
│   │   ├── page.tsx      # Home / Flight search
│   │   └── auth/         # Authentication pages
│   ├── components/       # React components
│   │   └── AuthProvider.tsx
│   ├── lib/
│   │   └── supabase/     # Supabase client setup
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## ✨ Features Implemented

### Phase 1: Foundation (✅ Complete)

- ✅ Supabase setup & configuration
- ✅ Authentication (register/login)
- ✅ Zustand state management stores
- ✅ Database schema with RLS policies
- ✅ Auth provider with session management
- ✅ Home page with flight search form

### Phase 2: Core Booking (Coming Next)

- [ ] Flight search results page
- [ ] Seat selection with Realtime updates
- [ ] Passenger details form
- [ ] Booking confirmation with PNR

### Phase 3: Booking Management

- [ ] My bookings page
- [ ] Reschedule booking flow
- [ ] Cancel booking functionality

### Phase 4: PWA & Polish

- [ ] PWA manifest & service worker
- [ ] Offline fallback page
- [ ] Performance optimization

## 🔑 Key Technologies

- **Frontend**: Next.js 14+, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State**: Zustand with persist middleware
- **Realtime**: Supabase Realtime (for seat updates)

## 📚 API Endpoints & Functions

### Authentication

- `POST /auth/register` - Create new account
- `POST /auth/login` - Sign in with email/password
- `POST /auth/logout` - Sign out

### Database Functions

- `reserve_seat(flight_id, seat_id, user_id)` - Atomic seat reservation
- `cancel_booking(booking_id)` - Cancel booking with 2-hour restriction

## 🔐 Security

- Row-Level Security (RLS) on all tables
- ANON_KEY only exposed on client (no SERVICE_ROLE_KEY)
- Atomic seat reservation prevents double-booking
- 2-hour pre-departure cancellation restriction

## 📱 PWA Features (In Progress)

- Offline support via service worker
- Installable on mobile devices
- Responsive design
- Fast load times with caching strategies

## 🚧 Next Steps

1. Deploy to Supabase (run migrations)
2. Implement flight search results page
3. Add seat selection with Realtime updates
4. Build booking confirmation flow
5. Add my bookings management
6. Configure PWA settings

## 📖 Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

**Supabase connection error?**

- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Ensure Supabase project is active

**Auth pages not loading?**

- Clear browser cache and localStorage
- Check browser console for errors

**Database migrations not applied?**

- Copy and run the SQL migration directly in Supabase SQL editor
- Check that RLS policies are enabled
