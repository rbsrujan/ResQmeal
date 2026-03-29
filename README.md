# ResQmeal - AI-Powered Food Waste Reduction Platform

ResQmeal is a 3-layer architecture project designed to minimize food waste by connecting donors (restaurants, hotels, etc.) with receivers (NGOs, shelters, farms) through an AI-powered logistics and tracking system.

## 🏗️ 3-Layer Architecture

This project follows a modular 3-layer architecture for reliability and consistency:

1.  **Layer 1: Directive (What to do)**
    *   SOPs and instructions located in `directives/`
    *   Defines the business logic and goals.
2.  **Layer 2: Orchestration (Decision making)**
    *   The intelligent routing layer (e.g., this AI assistant or backend services).
    *   Glues intent to execution.
3.  **Layer 3: Execution (Doing the work)**
    *   Deterministic scripts located in `execution/` (e.g., Python scripts for data processing).
    *   The web application in `zero-waste-web/` handles the user-facing interactions.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm
*   Supabase Account

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/karthiktotad/ResQmeal.git
    cd ResQmeal
    ```

2.  Install dependencies for the web app:
    ```bash
    cd zero-waste-web
    npm install
    ```

### Environment Configuration

1.  Copy `.env.example` to `.env` in both the root and `zero-waste-web/`:
    ```bash
    # From root
    cp .env.example .env
    cp .env.example zero-waste-web/.env
    ```
2.  Update the `.env` files with your **Supabase URL** and **Anon Key**.

### Database Setup

1.  Log in to your Supabase dashboard.
2.  Go to the **SQL Editor**.
3.  Copy and run the contents of `zero-waste-web/supabase_setup.sql`.
4.  Run `zero-waste-web/supabase_expansion.sql` to add tracking and location-based features.

### Run Locally

```bash
cd zero-waste-web
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📁 Project Structure

*   `directives/`: SOPs and schema definitions.
*   `execution/`: Backend/Deterministic scripts.
*   `zero-waste-web/`: The main React + Vite + Supabase application.
*   `.tmp/`: Temporary processing files (ignored by Git).

## 🛠️ Built With

*   [React](https://reactjs.org/)
*   [Vite](https://vitejs.dev/)
*   [Supabase](https://supabase.com/)
*   [Lucide React Icons](https://lucide.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
