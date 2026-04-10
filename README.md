<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Claude_AI-Vision-FF6F00?style=for-the-badge&logo=anthropic&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

# 🍽️ ResQMeal — AI-Powered Food Waste Reduction Platform

> **"Turn Surplus Into Hope"** — Every meal you save reaches someone in need, powered by AI, driven by humanity.

ResQMeal is a **full-stack, AI-powered web platform** that bridges the gap between surplus food donors (restaurants, hotels, households, event caterers) and receivers (NGOs, shelters, farms) through **real-time AI food safety verification**, **geospatial smart matching**, and a **gamified reward system** — ensuring no edible food goes to waste.

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| 🌐 **Live Website** | [**res-qmeal.vercel.app**](https://res-qmeal-r0izd2zsq-karthiktotad51-4051s-projects.vercel.app/) |
| 🎥 **Demo Video** | [**Watch on Google Drive**](https://drive.google.com/drive/folders/16MQ1mxQyZo3_XfakH08bC1M-HlkGsQ-e) |
| 📂 **Repository** | [**github.com/karthiktotad/ResQmeal**](https://github.com/karthiktotad/ResQmeal) |

---

## 🧠 Problem Statement

India alone wastes **68.7 million tonnes** of food annually while **189.2 million people** remain undernourished (UN FAO, 2023). The core challenges are:

- ❌ **No real-time safety verification** — Donated food quality is unverified, risking health
- ❌ **No smart logistics** — Surplus food expires before reaching those in need
- ❌ **No accountability** — Manual systems are prone to tampering and misuse
- ❌ **No motivation** — Donors lack incentives to consistently contribute

**ResQMeal solves all four** with AI verification, geospatial matching, OTP-based delivery proof, and a karma-based reward system.

---

## ✨ Key Features

### 1. 🤖 AI-Powered Food Safety Verification (Claude Vision)
- Mandatory **live camera capture** (no gallery uploads — prevents fraud)
- Images preprocessed to 512×512 and analyzed by **Anthropic Claude 3 Sonnet** with a strict food safety inspection prompt
- **Multi-layer scoring**: AI returns a 0-100 safety score with classification
- **Programmatic sanity checks** post-AI: selfie detection (→ score 0), mold detected (→ capped at 25), browning (→ capped at 45)
- **Three-tier classification**:
  - ✅ `Human Safe` (score ≥ 80) → Routed to NGOs & shelters
  - ⚠️ `Animal Safe` (score 50–79) → Routed to farms
  - ❌ `Unsafe` (score < 50) → Rejected, not listed

### 2. 📍 Geospatial Smart Matching & Real-Time Tracking
- **Haversine formula** for accurate Earth-surface distance calculation
- **Elastic radius search**: Default 15km; auto-expands if no nearby pickups found
- **Real-time Supabase subscriptions** + 45-second polling fallback for live updates
- **ETA estimation** based on 20 km/h average urban speed
- **Interactive Leaflet maps** with animated delivery routes (ant-path animation)
- **Instant new-pickup alerts** when donations appear within volunteer radius

### 3. 🏅 Gamified Karma & Rewards System
- Points awarded per verified donation
- **Three progression levels**: Starter → Food Hero → Champion
- **Daily streak tracking** to encourage consistent donations
- **City-level leaderboard** for competitive motivation
- **Redeemable rewards**: Fuel vouchers, UPI cashback ₹50, discount coupons, mobile recharge ₹20, exclusive merch

### 4. 🔐 Tamper-Proof Delivery Verification (OTP System)
- Receiver gets a **4-digit OTP** on their dashboard
- Volunteer must enter the OTP at the delivery point to confirm handover
- OTP verified against Supabase → donation status updated to `delivered` with timestamp
- **No manual overrides** — ensures physical presence and accountability

### 5. 🧪 AI Vision Lab (pH Classifier)
- Secondary safety verification via live camera feed
- Neural scan interface with real-time analysis animation
- PH-level safety scoring for additional food quality assurance

### 6. 📊 Donor Priority Algorithm
A **weighted scoring system** for intelligent pickup prioritization:
```
Score = (1 / (distance + 0.1)) × 0.4 + (reliability / 100) × 0.3 + (history / 50) × 0.3
```
- 🔴 Score > 80 → Critically Urgent
- 🟠 Score > 50 → High Priority
- 🔵 Score ≤ 50 → Standard

### 7. 📱 Role-Based Dashboards
| Role | Features |
|------|----------|
| **Donor** | Upload food, view AI safety results, track donations, impact charts (Chart.js), redeem rewards |
| **Volunteer** | Nearby pickup map, accept tasks, route navigation, food inspection, OTP delivery proof |
| **Receiver** | Accept/reject incoming donations, capacity slider, live delivery map, past donation history |
| **Admin** | KPI overview, 30-day donation trends, AI classification breakdown, flagged items management |

---

## 🏗️ Architecture

ResQMeal follows a **3-Layer Architecture** for reliability and separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│  LAYER 1: DIRECTIVES (What to do)                    │
│  └── directives/db/schema.sql                        │
│  └── SOPs, business rules, edge cases                │
├──────────────────────────────────────────────────────┤
│  LAYER 2: ORCHESTRATION (Decision making)            │
│  └── React App (Router, AuthContext, ProtectedRoute) │
│  └── Intelligent routing between intent & execution  │
├──────────────────────────────────────────────────────┤
│  LAYER 3: EXECUTION (Doing the work)                 │
│  └── Supabase (Auth, DB, Realtime, Storage)          │
│  └── Claude AI API (Food safety vision)              │
│  └── Leaflet (Maps, routing, geolocation)            │
│  └── Deterministic scripts in execution/             │
└──────────────────────────────────────────────────────┘
```

**Why this works**: LLMs are probabilistic; business logic must be deterministic. Pushing complexity into reliable execution layers (Supabase queries, API calls) ensures the orchestration layer only handles decision-making.

---

## 🛠️ Tech Stack

| Category | Technology | Why This Choice |
|----------|-----------|-----------------|
| **Frontend** | React 19 + TypeScript | Type safety, component reusability, modern hooks |
| **Build** | Vite 8 | Instant HMR, lightning-fast builds |
| **Styling** | Tailwind CSS 4 | Utility-first, rapid prototyping, responsive |
| **Backend** | Supabase (PostgreSQL) | Auth + DB + Realtime + Storage in one BaaS |
| **AI Vision** | Anthropic Claude 3 Sonnet | State-of-the-art multimodal food safety analysis |
| **Maps** | Leaflet + React-Leaflet 5 | Free, open-source, interactive mapping |
| **Routing** | Leaflet Routing Machine | Turn-by-turn delivery route visualization |
| **Charts** | Chart.js + react-chartjs-2 | Beautiful, responsive data visualization |
| **Icons** | Lucide React | Modern, consistent icon system |
| **Navigation** | React Router v7 | Client-side routing with role-based guards |
| **Deployment** | Vercel | One-click deploys, edge network, SPA support |

---

## 🗄️ Database Schema

Built on **PostgreSQL via Supabase** with 6 core tables, 7 enums, and real-time subscriptions:

```sql
-- Core Enums
user_role     → 'donor' | 'receiver' | 'admin' | 'agent'
food_type     → 'veg' | 'non_veg' | 'mixed'
ai_class      → 'human_safe' | 'animal_safe' | 'unsafe'
food_status   → 'pending' | 'in_transit' | 'delivered' | 'expired'
delivery_stat → 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
reward_level  → 'starter' | 'food_hero' | 'champion'
```

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | All user accounts with roles | — |
| `receivers` | NGO/shelter/farm profiles with geolocation | — |
| `food_listings` | Donations with AI safety scores | → `users.id`, → `receivers.id` |
| `deliveries` | Real-time delivery tracking | → `food_listings.id`, → `users.id` |
| `rewards` | Donor points, levels, streaks | → `users.id` |
| `redemptions` | Reward redemption history | → `users.id` |

**Real-time enabled** on `food_listings` and `deliveries` for live volunteer/receiver updates.

---

## 📁 Project Structure

```
ResQmeal/
├── directives/                 # Layer 1: SOPs & Schema definitions
│   └── db/
│       └── schema.sql          # Complete PostgreSQL schema
├── execution/                  # Layer 3: Deterministic scripts
├── zero-waste-web/             # Main React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # 17 reusable UI components
│   │   │   ├── LiveCamera.tsx           # Real-time camera capture
│   │   │   ├── LocationPicker.tsx       # Interactive map location selector
│   │   │   ├── MapContainer.tsx         # Reusable Leaflet map
│   │   │   ├── RouteMap.tsx             # Delivery route visualization
│   │   │   ├── DeliveryProof.tsx        # OTP-based delivery verification
│   │   │   ├── PHClassifier.tsx         # AI Vision Lab for pH analysis
│   │   │   ├── SafetyScoreGauge.tsx     # Animated AI score display
│   │   │   ├── ProtectedRoute.tsx       # Role-based route guard
│   │   │   └── ...                      # + 9 more components
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Global auth state with self-healing
│   │   ├── hooks/
│   │   │   └── useNearbyPickups.ts  # Geospatial pickup matching
│   │   ├── lib/
│   │   │   ├── supabase.ts     # Supabase client initialization
│   │   │   └── donorPriority.ts # Weighted priority algorithm
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Public landing with live map
│   │   │   ├── auth/                    # Login, Register, OAuth callback
│   │   │   ├── donor/                   # Dashboard + Upload wizard
│   │   │   ├── volunteer/               # Task page + Inspection
│   │   │   ├── receiver/               # Receiver dashboard
│   │   │   ├── admin/                   # Admin overview panel
│   │   │   └── tracking/               # Live delivery tracking
│   │   ├── App.tsx             # Router with role-based guards
│   │   └── main.tsx            # Entry point
│   ├── vite.config.ts          # Vite + React + Tailwind config
│   ├── vercel.json             # SPA rewrite rules
│   └── package.json
├── .env.example                # Environment variable template
├── gemini.md                   # 3-Layer architecture operating rules
└── README.md                   # ← You are here
```

---

## 🔄 User Flows

### 🍽️ Donor Journey
```
Register → Login → Dashboard → "Donate Now"
  → Step 1: Capture live photo + Fill food details + Pick map location
  → Step 2: AI Safety Audit (Claude Vision analyzes image)
  → Step 3: If safe → Listed for receivers | If unsafe → Rejected
  → Track donation status → Earn reward points → Redeem rewards
```

### 🚴 Volunteer Journey
```
Login → Volunteer Dashboard → View nearby pickups (geospatial)
  → Accept pickup task → Navigate via route map
  → Inspect food quality → Pick up & transport
  → Arrive at receiver → Enter 4-digit OTP → Delivery confirmed ✅
```

### 🏠 Receiver Journey
```
Login → Receiver Dashboard → View incoming donation requests
  → Accept or Reject → Track delivery on live map
  → Share OTP with volunteer → Delivery verified → Rate experience
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- A [Supabase](https://supabase.com/) account (free tier works)
- (Optional) An [Anthropic API key](https://console.anthropic.com/) for real AI analysis

### 1. Clone the Repository
```bash
git clone https://github.com/karthiktotad/ResQmeal.git
cd ResQmeal
```

### 2. Install Dependencies
```bash
cd zero-waste-web
npm install
```

### 3. Configure Environment Variables
```bash
# From the project root
cp .env.example .env
cp .env.example zero-waste-web/.env
```

Edit the `.env` files with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=your-claude-api-key    # Optional — app works with mock data without this
```

### 4. Set Up the Database
1. Go to your **Supabase Dashboard** → SQL Editor
2. Run the schema from `directives/db/schema.sql`
3. Enable **Realtime** on `food_listings` and `deliveries` tables

### 5. Run Locally
```bash
cd zero-waste-web
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌍 UN SDG Alignment

ResQMeal directly contributes to the following **United Nations Sustainable Development Goals**:

| SDG | Goal | How ResQMeal Contributes |
|-----|------|--------------------------|
| 🥗 **SDG 2** | Zero Hunger | Connects surplus food directly to people in need |
| ♻️ **SDG 12** | Responsible Consumption | AI-verified food redistribution prevents landfill waste |
| 🌡️ **SDG 13** | Climate Action | Tracks CO₂ reduction from prevented food waste |
| 🏙️ **SDG 11** | Sustainable Cities | Community food points and smart urban logistics |
| 🤝 **SDG 17** | Partnerships | Multi-stakeholder platform connecting donors, NGOs, and volunteers |

---

## 🔑 Key Technical Highlights

> Perfect talking points for interviews and presentations:

- **AI + Sanity Layering**: Claude Vision provides the base score, but programmatic guardrails (selfie detection, mold cap, browning cap) prevent AI hallucinations from passing unsafe food
- **Self-Healing Auth**: If a user's profile row is missing but their JWT metadata has role info, the system auto-repairs by upserting the profile — zero manual intervention
- **Elastic Radius Search**: Rather than showing "no results" when volunteer has no nearby pickups, the system auto-expands to show the 10 closest options
- **Haversine over Google APIs**: Free, zero-dependency distance calculation that's accurate enough for urban food logistics
- **Real-time + Polling Hybrid**: Supabase Realtime channel for instant updates, with a 45-second polling fallback ensuring reliability
- **OTP over Photo Proof**: Tamper-proof delivery verification — ensures receiver is physically present, unlike easily-faked photo confirmations
- **3-Layer Architecture**: Separates probabilistic AI decisions from deterministic business logic, achieving higher reliability than monolithic approaches

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🚀 Live Demo & Video

| | |
|---|---|
| 🌐 **Live Website** | [**Click here to view**](https://res-qmeal-r0izd2zsq-karthiktotad51-4051s-projects.vercel.app/) |
| 🎥 **Demo Video** | [**Watch on Google Drive**](https://drive.google.com/drive/folders/16MQ1mxQyZo3_XfakH08bC1M-HlkGsQ-e) |

---

<p align="center">
  <b>Built with ❤️ to fight food waste and hunger</b><br/>
  <sub>If this project helped or inspired you, please ⭐ star the repo!</sub>
</p>

<!-- Resubmission commit update -->
