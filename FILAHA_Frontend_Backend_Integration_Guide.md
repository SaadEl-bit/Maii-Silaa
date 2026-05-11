# 🔗 Filaha Frontend-Backend Integration Guide
> **For first-time fullstack developers — step by step, no assumptions**
> 
> Based on project status: Backend Phases 0-5.6 ✅ | Frontend wiring ❌

---

## What Does "Merging" Actually Mean?

Right now you have **two separate things** that don't know about each other:

| | Backend (Node.js + Express) | Frontend (HTML/JS demo) |
|---|---|---|
| **Location** | `localhost:3000` | `localhost:5173` (or opening `.html` file) |
| **Data** | Lives in Supabase PostgreSQL | Lives in hardcoded JS arrays inside the HTML |
| **Auth** | Real JWT tokens from Supabase | Fake — just writes to `localStorage` |
| **AI** | Real OpenRouter calls | Static text strings |

**"Merging" means teaching your frontend to:**
1. **Ask** the backend for data (instead of using fake arrays)
2. **Prove** who you are (using JWT tokens)
3. **Send** user actions to the backend (register, create listing, etc.)

Think of it like plugging a phone into a charger. The phone (frontend) and charger (backend) are both real devices. The cable is `fetch()` + JWT.

---

## The 3 Concepts You Must Understand First

### 1. `fetch()` — The Cable

`fetch()` is JavaScript's built-in way to make HTTP requests from a browser to a server.

```javascript
// Before (fake data — what you have now)
const listings = [
  { id: 1, crop: 'Tomato', price: 12.5 },
  { id: 2, crop: 'Wheat', price: 8.0 }
];

// After (real data from backend)
const response = await fetch('http://localhost:3000/api/marketplace/listings');
const listings = await response.json();
```

### 2. JWT Token — Your ID Card

When you login, the backend gives you a **token** (a long string). You must send this string with every request so the backend knows *"this is Ahmed, he is allowed to see his farm data."*

```javascript
// Login response from backend
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "role": "farmer", "name": "Ahmed" }
}

// Every future request must include:
fetch('/api/irrigation/recommend', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
});
```

### 3. CORS — The Security Gate

Browsers block websites from calling random servers (security). Your backend must explicitly say *"I allow the frontend to talk to me."*

This is already handled in `server.js` with the `cors` middleware.

---

## Prerequisites Checklist

Before touching any code, verify these:

```
□ Terminal 1: cd backend && npm start  →  "Server running on :3000"
□ curl http://localhost:3000/api/health  →  { "status": "ok" }
□ Supabase tables exist and have data
□ You can login via terminal: curl -X POST /api/auth/login ...
□ Your frontend file (filaha-v2.html) opens in browser
```

---

## Phase 1: Create the API Helper (5 minutes)

**Where:** Top of your `<script>` tag in `filaha-v2.html`

**What:** One function that handles every backend call automatically (adds token, parses JSON, handles errors).

```javascript
// ═══════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const API_URL = 'http://localhost:3000';

/**
 * Universal API helper. Every frontend→backend call goes through here.
 * @param {string} method - HTTP method: 'GET', 'POST', 'PUT', 'DELETE'
 * @param {string} path - API path, e.g. '/api/auth/login'
 * @param {object|null} body - JSON body for POST/PUT, null for GET
 * @returns {Promise<object>} - Parsed JSON response from backend
 */
async function api(method, path, body = null) {
  // 1. Get the saved token (null if not logged in)
  const token = localStorage.getItem('filaha_token');

  // 2. Build request options
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      // 3. Attach token if it exists
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };

  // 4. Attach body for POST/PUT
  if (body) {
    options.body = JSON.stringify(body);
  }

  // 5. Send the request
  const response = await fetch(`${API_URL}${path}`, options);

  // 6. Parse JSON regardless of success/failure
  const data = await response.json();

  // 7. If backend returned an error status (400, 401, 500...)
  if (!response.ok) {
    console.error('API Error:', data);
    throw new Error(data.message || 'Une erreur est survenue');
  }

  // 8. Return successful data
  return data;
}
```

**Why this pattern?** Instead of writing `fetch()` 20 times across your app, you write `api('GET', '/api/...')` everywhere. One place to fix if something changes.

---

## Phase 2: Add the Missing Password Field (2 minutes)

**Problem:** Your onboarding Step 1 collects phone, first name, last name, language — but the backend requires a `password` to create an account.

**Where:** Inside the `ob-step-1` div in your HTML

**Action:** Add this input field inside the step-1 form:

```html
<!-- Add this INSIDE the ob-step-1 container, after the phone input -->
<div class="form-field" style="margin-top: 12px;">
  <input 
    type="password" 
    id="ob-password" 
    placeholder=" " 
    autocomplete="new-password"
    minlength="6"
  />
  <label for="ob-password">
    <!-- Arabic: كلمة المرور | French: Mot de passe -->
    Mot de passe
  </label>
  <small style="opacity: .6; font-size: 11px; display: block; margin-top: 4px;">
    Minimum 6 caractères
  </small>
</div>
```

**Then** in your `goStep(2)` function (or wherever you collect Step 1 data), add:

```javascript
const password = document.getElementById('ob-password').value;

// Basic validation
if (!password || password.length < 6) {
  showToast('Veuillez entrer un mot de passe (min 6 caractères)', 'warn');
  return; // Stop — don't go to step 2
}

STATE.obData.password = password;
```

---

## Phase 3: Replace Fake Onboarding with Real Registration (10 minutes)

**Where:** Your `completeOnboarding()` function

**Current behavior:** Writes fake data to `localStorage`, shows dashboard.

**New behavior:** 
1. Send registration data to backend
2. Immediately login to get a real token
3. Save token + user info
4. Show real dashboard

```javascript
async function completeOnboarding() {
  try {
    showToast('Création du compte en cours...');

    // ── 1. REGISTER ─────────────────────────────────────────────
    await api('POST', '/api/auth/register/farmer', {
      phone: STATE.obData.phone,
      password: STATE.obData.password,
      name: `${STATE.obData.fname} ${STATE.obData.lname}`.trim(),
      country_code: 'MA',
      language: STATE.obData.lang || 'fr'
    });

    // ── 2. LOGIN (to get the JWT token) ─────────────────────────
    const loginResult = await api('POST', '/api/auth/login', {
      phone: STATE.obData.phone,
      password: STATE.obData.password
    });

    // ── 3. SAVE TOKEN ───────────────────────────────────────────
    localStorage.setItem('filaha_token', loginResult.access_token);
    localStorage.setItem('filaha_refresh_token', loginResult.refresh_token);
    localStorage.setItem('filaha_user', JSON.stringify(loginResult.user));
    localStorage.setItem('filaha_role', loginResult.user.role);

    // ── 4. UPDATE APP STATE ─────────────────────────────────────
    STATE.role = loginResult.user.role;
    saveStorage();

    // ── 5. LAUNCH DASHBOARD ─────────────────────────────────────
    if (STATE.role === 'farmer') {
      launchFarmerDash();
    } else {
      launchDistDash();
    }

    showToast('✓ Compte créé avec succès !');

  } catch (err) {
    console.error('Onboarding error:', err);
    showToast('Erreur: ' + (err.message || 'Impossible de créer le compte'), 'warn');
  }
}
```

**What changed?**
- Before: `localStorage.setItem('filaha_profile', JSON.stringify(STATE.obData))`
- After: Real API calls, real token, real user object from backend

---

## Phase 4: Wire Each Dashboard Tab to Real Data (20 minutes)

This is where you replace hardcoded arrays with `api()` calls. Do this **one tab at a time**.

### 4A — Irrigation (MAÏ Tab)

**Find:** The function that loads irrigation data (probably called when the farmer opens the MAÏ tab).

**Replace this pattern:**
```javascript
// BEFORE (fake)
const irrigationData = {
  waterMm: 18.5,
  recommendation: "Arrosez vos tomates ce matin..."
};
updateIrrigationUI(irrigationData);
```

**With this:**
```javascript
// AFTER (real)
async function loadIrrigationData(farmId) {
  try {
    showToast('Chargement des données météo...');

    // You need lat/lng. If your farm object has them:
    const farm = STATE.farms?.[0]; // or however you store the current farm
    if (!farm || !farm.lat || !farm.lng) {
      showToast('Veuillez configurer l'emplacement de votre ferme', 'warn');
      return;
    }

    const data = await api('GET', 
      `/api/irrigation/recommend?farmId=${farmId}&lat=${farm.lat}&lng=${farm.lng}`
    );

    // Update your UI elements with real data
    document.getElementById('irrigation-water-amount').textContent = 
      `${data.waterMm} mm`;
    document.getElementById('irrigation-confidence').textContent = 
      `${Math.round((data.confidence || 0) * 100)}%`;
    document.getElementById('irrigation-advice').textContent = 
      data.recommendation;

    // Store for later use
    STATE.lastIrrigation = data;
    saveStorage();

  } catch (err) {
    showToast('Erreur de chargement: ' + err.message, 'warn');
  }
}
```

**Call this function** when the farmer clicks the MAÏ tab or when the dashboard loads.

---

### 4B — Market Prices (SILA Tab)

```javascript
async function loadMarketPrices(crop = 'tomato', region = 'casablanca-settat') {
  try {
    const data = await api('GET', 
      `/api/market/price?crop=${crop}&region=${region}&country=MA`
    );

    // Update your price table/chart
    renderPriceTable(data.prices);

    // Update trend indicator
    const trendEl = document.getElementById('price-trend');
    trendEl.textContent = data.trend === 'rising' ? '↗ En hausse' : 
                          data.trend === 'falling' ? '↘ En baisse' : '→ Stable';

  } catch (err) {
    showToast('Erreur de chargement des prix', 'warn');
  }
}
```

---

### 4C — Community Alerts

```javascript
async function loadCommunityAlerts() {
  try {
    const data = await api('GET', '/api/community/alerts');

    // Replace ALERT_DATA with real alerts
    STATE.alerts = data.alerts || [];
    renderAlertsList(STATE.alerts);

    // Update badge count
    const unread = STATE.alerts.filter(a => !a.read).length;
    updateNotificationBadge(unread);

  } catch (err) {
    console.error('Alerts error:', err);
  }
}
```

---

### 4D — Notifications

```javascript
async function loadNotifications() {
  try {
    const data = await api('GET', '/api/notifications');
    STATE.notifications = data.notifications || [];
    renderNotificationsList(STATE.notifications);
  } catch (err) {
    console.error('Notifications error:', err);
  }
}

async function markNotificationRead(notificationId) {
  try {
    await api('PUT', `/api/notifications/${notificationId}/read`, {});
    // Update local state
    const notif = STATE.notifications.find(n => n.id === notificationId);
    if (notif) notif.read = true;
    renderNotificationsList(STATE.notifications);
  } catch (err) {
    console.error('Mark read error:', err);
  }
}
```

---

### 4E — Marketplace (Listings & Offers)

**For farmers — Create a listing:**
```javascript
async function createListing(listingData) {
  try {
    const result = await api('POST', '/api/marketplace/listings', {
      crop: listingData.crop,
      quantity_kg: listingData.quantity,
      price_per_kg: listingData.price,
      quality: listingData.quality,
      location: listingData.location
    });

    showToast('✓ Annonce publiée !');
    // Refresh the listings list
    await loadMyListings();

  } catch (err) {
    showToast('Erreur: ' + err.message, 'warn');
  }
}
```

**For distributors — Browse listings:**
```javascript
async function loadListings(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const data = await api('GET', `/api/marketplace/listings?${queryParams}`);

    STATE.listings = data.listings || [];
    renderListingsCards(STATE.listings);

  } catch (err) {
    showToast('Erreur de chargement des annonces', 'warn');
  }
}
```

**For distributors — Make an offer:**
```javascript
async function submitOffer(listingId, offeredPrice, quantity) {
  try {
    await api('POST', '/api/marketplace/offers', {
      listing_id: listingId,
      offered_price: offeredPrice,
      quantity_kg: quantity
    });

    showToast('✓ Offre envoyée au fermier');

  } catch (err) {
    showToast('Erreur: ' + err.message, 'warn');
  }
}
```

---

## Phase 5: Handle Returning Users (Token Persistence) (5 minutes)

**Problem:** When the user refreshes the page, they should stay logged in.

**Where:** Your `DOMContentLoaded` event listener

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  initStorage();

  const token = localStorage.getItem('filaha_token');
  const savedRole = localStorage.getItem('filaha_role');

  // If we have a token, verify it's still valid with the backend
  if (token && savedRole) {
    try {
      // This endpoint validates the token and returns user info
      const me = await api('GET', '/api/auth/me');

      // Token is valid — restore session
      STATE.role = savedRole;
      STATE.user = me;
      saveStorage();

      // Go directly to dashboard, skip splash
      if (savedRole === 'farmer') {
        launchFarmerDash();
      } else {
        launchDistDash();
      }

    } catch (err) {
      // Token expired or invalid — force re-login
      console.log('Session expired, redirecting to login');
      localStorage.removeItem('filaha_token');
      localStorage.removeItem('filaha_role');
      showScreen('splash');
    }
  } else {
    // No token — show splash/login
    showScreen('splash');
  }
});
```

---

## Phase 6: Add Logout (2 minutes)

**Where:** Your logout button handler

```javascript
async function handleLogout() {
  try {
    // Optional: tell backend to invalidate session
    await api('POST', '/api/auth/logout');
  } catch (err) {
    // Ignore errors — we logout locally regardless
  }

  // Clear everything
  localStorage.removeItem('filaha_token');
  localStorage.removeItem('filaha_refresh_token');
  localStorage.removeItem('filaha_user');
  localStorage.removeItem('filaha_role');
  localStorage.removeItem('filaha_profile');

  // Reset app state
  STATE.role = null;
  STATE.user = null;
  saveStorage();

  // Go back to splash
  showScreen('splash');
  showToast('Déconnexion réussie');
}
```

---

## Testing Your Integration (Step by Step)

### Test 1: Registration Flow
1. Open browser console (F12 → Console tab)
2. Open your frontend
3. Go through onboarding with a new phone number
4. Watch the Network tab — you should see:
   - `POST /api/auth/register/farmer` → 201
   - `POST /api/auth/login` → 200
5. Check Application → Local Storage → you should see `filaha_token`

### Test 2: Protected Route
1. After login, click the MAÏ tab
2. Watch Network tab for `GET /api/irrigation/recommend`
3. Should return real JSON with Arabic recommendation

### Test 3: Page Refresh
1. Refresh the browser (F5)
2. You should land directly on the dashboard (not splash)
3. Console should show no errors

### Test 4: Logout
1. Click logout
2. You should return to splash screen
3. Local Storage should be empty (no `filaha_token`)

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Failed to fetch` / `CORS error` | Backend not running or CORS not configured | Run `npm start` in backend. Check `server.js` has `app.use(cors())` |
| `401 Unauthorized` | Missing or expired token | Re-login. Check that `Authorization: Bearer ...` header is sent |
| `403 Forbidden` | Wrong role for route | Distributor token used on farmer route (or vice versa) |
| `lat and lng are required` | Irrigation endpoint needs coordinates | Pass `lat` and `lng` as query params, not just `farmId` |
| `Cannot read property of undefined` | Backend returned error HTML instead of JSON | Check backend terminal for crash logs |
| `User already registered` | Phone number exists in Supabase | Use a different phone number or delete user from Supabase Auth dashboard |

---

## Complete Wiring Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Onboarding  │  │  Dashboard  │  │  Marketplace / SILA     │ │
│  │  (HTML/JS)  │  │   (HTML/JS) │  │    (HTML/JS)            │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         ▼                ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  api() helper  →  fetch()  →  localStorage (token)       │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTP requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  routes/    │  │ middleware/ │  │      services/          │ │
│  │  auth.js    │  │   auth.js   │  │  weatherService.js      │ │
│  │irrigation.js│  │  roleCheck  │  │  etCalculator.js        │ │
│  │ market.js   │  │             │  │  aiTranslator.js        │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase (PostgreSQL + Auth)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Final Checklist

```
□ Phase 1: api() helper added to top of script
□ Phase 2: Password input added to onboarding Step 1
□ Phase 3: completeOnboarding() calls real API
□ Phase 4A: MAÏ tab loads from /api/irrigation/recommend
□ Phase 4B: SILA tab loads from /api/market/price
□ Phase 4C: Community alerts load from /api/community/alerts
□ Phase 4D: Notifications load from /api/notifications
□ Phase 4E: Marketplace uses /api/marketplace/listings and /offers
□ Phase 5: DOMContentLoaded validates token on refresh
□ Phase 6: Logout clears localStorage and calls /api/auth/logout
□ CORS enabled in backend server.js
□ All hardcoded data arrays removed (or clearly marked as fallback)
```

---

## Next Steps After Integration

Once this works:
1. **Jobs folder** — Add `morningWeatherJob.js` and `priceUpdateJob.js` for automation
2. **Frontend polish** — Add loading spinners while `api()` calls are in flight
3. **Error handling** — Show friendly Arabic/French messages instead of console errors
4. **Offline support** — Cache last-known data in `localStorage` for when network is down

---

*Document generated for Filaha project — Backend Phase 5.6 ✅ → Frontend wiring in progress*
