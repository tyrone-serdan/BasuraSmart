# BasuraSmart

A waste management mobile application built with Expo, React Native, and Supabase.

## Overview

BasuraSmart is designed for **Barangay Obrero, Butuan City** to help communities manage their waste collection more efficiently. The app provides a streamlined experience for residents, garbage collectors, and barangay officials.

## Features

### For Residents
- View monthly pickup schedule calendar
- Report illegal dumping with photo & location
- Earn points for proper waste segregation
- Redeem points for load credits (GLOBE, SMART, TNT)
- View announcements from barangay

### For Collectors
- View assigned pickup routes with all stops
- Track completed and pending stops on map
- Mark pickups as complete
- Report issues during collection

### For Admins
- Dashboard with statistics
- Manage reports (pending, investigating, resolved)
- View all pickup schedules

### Authentication
- Email-based registration and login
- OTP verification for account security
- Role-based access (resident/collector/admin)
- Supabase Auth for secure sessions

## Supabase Integration

This app uses **Supabase** as the backend:

- **Authentication:** Email/password login with OTP verification
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Storage:** For report photos (optional)

### Supabase Tables

The app uses the following tables:
- `profiles` - User profiles (name, purok, userType, points)
- `pickup_schedules` - Waste collection schedule
- `routes` - Collector routes
- `route_stops` - Individual stops on routes
- `reports` - Illegal dumping reports
- `announcements` - Barangay announcements
- `rewards` - Redeemable load credits
- `points_transactions` - Points history

## Tech Stack

- **Framework:** Expo SDK 52 with Expo Router
- **Language:** TypeScript
- **Backend:** Supabase (PostgreSQL + Auth)
- **State Management:** Zustand
- **Maps:** React Native WebView with Leaflet.js + OpenStreetMap

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (see setup below)
- Android Studio or Xcode

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL in `SUPABASE_SETUP.sql` in your Supabase SQL Editor
3. Add your credentials to `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key"
    }
  }
}
```

### Installation

```bash
# Install dependencies
npm install

# Generate native folders
npx expo prebuild

# Start development server
npm start

# Run on Android
npx expo run:android
```

## Database Setup SQL

Run this in your Supabase SQL Editor to seed routes:

```sql
-- Routes
INSERT INTO routes (name, date, total_stops, completed_stops, status) 
VALUES ('Tuesday Route - Purok 1-12', '2026-05-08', 12, 4, 'pending');

-- Route Stops (run after routes insert)
INSERT INTO route_stops (route_id, purok, address, latitude, longitude, status, waste_type) VALUES
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 1', '123 Centro St', 8.964216, 125.535944, 'completed', 'biodegradable'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 2', '201 Main Rd', 8.963616, 125.537344, 'completed', 'biodegradable'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 3', '301 Village Way', 8.962216, 125.537944, 'completed', 'biodegradable'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 4', '401 Church St', 8.960816, 125.537344, 'completed', 'biodegradable'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 5', '501 Market Ave', 8.960216, 125.535944, 'pending', 'non-biodegradable'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 6', '601 School Lane', 8.959816, 125.534544, 'pending', 'non-biodegradable'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 7', '701 Health Center Rd', 8.962216, 125.533944, 'pending', 'recyclables'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 8', '801 Basketball Ct', 8.963616, 125.534544, 'pending', 'recyclables'),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 9', '901 Day Care St', 8.964716, 125.534944, 'pending', NULL),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 10', '1001 Chapel Road', 8.964716, 125.536944, 'pending', NULL),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 11', '1101 Municipal Hall', 8.959716, 125.534944, 'pending', NULL),
((SELECT id FROM routes WHERE name = 'Tuesday Route - Purok 1-12' LIMIT 1), 'Purok 12', '1201 Plaza Complex', 8.959716, 125.536944, 'pending', NULL);
```

## Demo Credentials

Create users in Supabase Auth, then their profiles will be created on first login.

| User Type | Email | Password |
|----------|-------|----------|
| Resident | juan@email.com | demo123 |
| Collector | pedro@basurasmart.com | demo123 |
| Admin | admin@basurasmart.com | admin123 |

## Project Structure

```
basurasmart/
├── app/                    # Expo Router screens
│   ├── (auth)/           # Authentication screens
│   ├── (resident)/       # Resident screens
│   ├── (collector)/     # Collector screens
│   └── (admin)/         # Admin screens
├── components/           # Reusable components
│   ├── ui/              # UI components
│   ├── illustrations/   # SVG illustrations
│   └── map/             # Map components
├── lib/                  # Core logic
│   ├── api.ts           # Supabase API functions
│   ├── supabase.ts      # Supabase client
│   ├── store.ts        # Zustand stores
│   └── types.ts        # TypeScript types
├── SUPABASE_SETUP.sql   # Database schema
└── app.json            # Expo config with Supabase keys
```

## Map Configuration

The map is configured for **Barangay Obrero, Butuan City**:

- **Center:** `8.962216, 125.535944`
- **Zoom Level:** 15
- **Provider:** OpenStreetMap