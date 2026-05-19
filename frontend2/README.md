# Filaha Frontend — Enhanced UI Dashboard

Full-featured dashboard for the Filaha agricultural intelligence platform.

## Setup

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Open the frontend:**
   Serve via HTTP (file:// won't work due to CORS):
   ```bash
   # Using VS Code Live Server (usually on port 5500)
   # Or using npx:
   npx serve frontend2 -p 5500
   ```
   Then open `http://localhost:5500` in your browser.

3. **Configure API URL:**
   Edit `index.html` and change `API_BASE` if your backend runs on a different port:
   ```javascript
   const API_BASE = 'http://localhost:3000';
   ```

## Features

### 🔐 Authentication & Account
- Register as Farmer (phone + password)
- Register as Distributor (email + password)
- Login with phone or email
- Logout button in account dropdown
- Session persistence with localStorage

### 💧 Smart Irrigation (MAÏ)
- ET₀ calculation based on weather
- Irrigation recommendations
- Historical logs

### 🏪 Market (SILA)
- Real-time crop prices
- Multi-country price comparison
- Price trend analysis
- Best price finder

### 📦 Marketplace
- Farmers: Create harvest listings (crop, quantity, price, quality)
- Browse all active listings
- View your own listings

### 🔬 Crop Diagnosis
- AI photo analysis (disease/pest detection)
- Detection history

### 🌍 Community
- View nearby alerts (15km radius)
- ✅ **Confirm or dismiss alerts** from other farmers
- Find nearby farmers

### 🔔 Notifications
- View all in-app notifications
- Unread count badge
- Mark all as read

## Requirements
- Backend must be running (port 3000)
- CORS: backend ALLOWED_ORIGINS must include your frontend's origin (default: 5173, 3000, 5500)
- Some endpoints require authentication (login first)
- Role-based: farmers create listings, distributors send offers
