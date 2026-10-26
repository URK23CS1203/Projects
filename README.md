# Real-Time Tracking of Crop Residue Management (CRM) Machines

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)

A real-time telemetry, geographic tracking, and field dispatch platform designed under the **Department of Agriculture & Farmers Welfare (DA&FW), Government of India** scheme for **In-Situ Crop Residue Management**. The system monitors subsidized farm machinery (Happy Seeders, Super SMS, Balers, Paddy Straw Choppers, Zero Till Drills) across Custom Hiring Centers (CHCs) in Punjab, Haryana, and Western Uttar Pradesh to eliminate paddy stubble burning and mitigate Delhi/NCR seasonal air pollution.

---

## Key Features

1. **Live GPS Telemetry & Geo-Tracking Operations Map**
   - Real-time location coordinates, operating speed (km/h), fuel level (%), engine hours, and today's acreage.
   - Dual-mode visualization: OpenStreetMap Administrative view and high-resolution Satellite Field Imagery (Esri World Imagery).
   - Custom Hiring Center (CHC) 16km service radius coverage boundaries.
   - Historic trajectory breadcrumbs trail for machines active in the field.
   - One-click Full Screen map view (`80vh` expanded layout).

2. **Satellite Stubble Burning Hotspot Ingestion & Rapid Dispatch**
   - Simulated thermal anomalies from NASA VIIRS and ISRO FIRMS satellite feeds with village-level accuracy.
   - Automatic distance-proximity calculation to the nearest idle CRM balers and choppers.
   - 1-click machine dispatch to extinguish or manage crop residue in high-risk parcels.
   - Dismiss and remove verified or contained thermal alerts.

3. **Custom Hiring Center (CHC) Equipment Booking Queue**
   - End-to-end booking lifecycle for local farmers (`Pending` → `Approved` → `Dispatched` → `In Field` → `Completed`).
   - Create new farmer hire requests with custom acreage, residue type, and urgency level.
   - Remove/cancel bookings directly from the tracking queue.

4. **Environmental Impact & Scheme Progress Analytics**
   - Seasonal target progress tracking (e.g. 85,000 acres target vs cumulative managed area).
   - Real-time calculation of toxic PM2.5 prevented (kg) and CO₂ greenhouse gas savings (metric tonnes).
   - Dual-axis trend charts correlating daily straw processed against falling fire incidents.
   - District-level Custom Hiring Center performance ranking matrix.

5. **Fleet Administration & Telemetry Export**
   - Register subsidized CRM implements with scheme registration numbers (`DAFW/CRM/...`).
   - Decommission / remove machines from the tracking fleet with safety confirmation.
   - Export full telemetry datasets to CSV with coordinates, fuel, speed, and operator contact details.
   - Real-time simulation engine with adjustable playback rates (1x, 2x, 5x, or paused).

---

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Plus Jakarta Sans, JetBrains Mono
- **Mapping & GIS**: Leaflet, React-Leaflet
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or pnpm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/crm-machine-dashboard.git
cd crm-machine-dashboard

# Install dependencies
npm install

# Start the local development server
npm run dev
```

The application will be running at `http://localhost:3000`.

### Production Build

```bash
# Compile and build production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## Deploying to GitHub

Follow these steps to deploy this codebase to your GitHub repository:

### 1. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Crop Residue Management (CRM) Real-Time Tracking Dashboard"
```

### 2. Connect to your GitHub Repository
Create a new repository on [GitHub](https://github.com/new) (e.g., `crm-machine-dashboard`), then run:

```bash
# Rename default branch to main
git branch -M main

# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/crm-machine-dashboard.git

# Push the code to GitHub
git push -u origin main
```

### 3. Deploying Live Online

#### Option A: GitHub Pages
1. Install `gh-pages`:
   ```bash
   npm install -D gh-pages
   ```
2. In `vite.config.ts`, set `base: '/crm-machine-dashboard/'`.
3. In `package.json`, add scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Run `npm run deploy`.

#### Option B: Vercel / Netlify
1. Import your GitHub repository directly on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Click **Deploy**.

---

## License

This project is licensed under the MIT License.
