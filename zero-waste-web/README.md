# ResQmeal - Web Application (React + Vite + Supabase)

This is the main web application for **ResQmeal**, an AI-powered food waste reduction platform.

## 🚀 Getting Started

1.  **Clone the Repo** (if you haven't already):
    ```bash
    git clone https://github.com/karthiktotad/ResQmeal.git
    cd ResQmeal/zero-waste-web
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in this directory with the following variables:
    ```bash
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    You can use `.env.example` as a template.

4.  **Database Migration**:
    Run the following SQL scripts in your Supabase SQL Editor:
    *   `supabase_setup.sql` (Core schema)
    *   `supabase_expansion.sql` (Tracking and expanded mission features)

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🛠️ Features

*   **Donor Dashboard**: Post surplus food, track pickups live, AI safety classification.
*   **Volunteer Dashboard**: Mission control, OSRM-based routing, real-time location broadcasting, OTP-only delivery verification.
*   **Receiver Dashboard**: Active mission tracking, delivery OTP visibility, donation management.
*   **Impact Tracking**: Visualize metrics and food waste reduction stats.

## 🧱 Architecture

This application is part of a larger 3-layer architecture. See the [root README.md](../README.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
