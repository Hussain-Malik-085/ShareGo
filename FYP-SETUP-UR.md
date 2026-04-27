# ShareGo – setup (step by step) / Urdu + English

Yeh project teen hisson par hai: **App-Backend** (Node + Mongo), **App-Frontend** (React Native), **Admin-Frontend** (React web). Neeche order follow karein.

---

## Step 0 – Tools (ek dafa)

- **Node.js** 18+ (`node -v`)
- **MongoDB** : local (MongoDB Community) **ya** free cluster [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- (Mobile) **Android Studio** / **Xcode** for emulator

---

## Step 1 – MongoDB

**Local option:**  
Mongo start karein, default connection string:  
`mongodb://127.0.0.1:27017/sharego`

**Atlas option:**  
Cluster banayein → Connect → “Drivers” se URI copy karein, password set karein, DB name `sharego` rakh sakte hain.

---

## Step 2 – App-Backend (API)

```bash
cd App-Backend
cp .env.example .env
# .env mein MONGODB_URI apna string daalein
npm install
npm start
```

Server chal gaya to browser mein: [http://localhost:4000](http://localhost:4000) → `{"ok":true,...}`

**Check:** [http://localhost:4000/api/Fuel-price](http://localhost:4000/api/Fuel-price) bhi chalna chahiye.

**Android emulator** se PC ka backend: same machine, IP nahi.  
**App** already default `10.0.2.2` use karti hai (Android emulator → host PC = `10.0.2.2`).

**Asli phone** se test: PC ka Wi‑Fi IP (jaise `192.168.1.20`) + port `4000` — App-Frontend ke `.env` mein `API_BASE_URL` set karein:  
`http://192.168.1.20:4000/api` (apna IP daalna).

**iOS Simulator:** aam tor par `http://127.0.0.1:4000/api` theek rehta hai.

---

## Step 3 – App-Frontend (React Native) – .env

```bash
cd App-Frontend
# .env file already hai; zarurat ho to .env.example se compare karein
```

`.env` mein yeh set karein:

| Key | Kya hai |
|-----|--------|
| `API_BASE_URL` | `http://10.0.2.2:4000/api` (Android emulator) / iOS ke liye `http://127.0.0.1:4000/api` / phone test ke liye `http://LAN_IP:4000/api` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase “anon public” key |
| `CLOUDINARY_*` | Cloudinary (neeche) |

```bash
npm install
npm start
# dusre terminal: npm run android   ya   npm run ios
```

**Supabase bina** login/signup nahi chalein ge. **Cloudinary bina** document photo upload wale steps fail ho sakte hain.

---

## Step 4 – Supabase (naya project)

1. [supabase.com](https://supabase.com) → New project.  
2. **Project Settings → API:** `URL` + `anon public` key copy karein → App-Frontend `.env` mein `SUPABASE_URL` aur `SUPABASE_ANON_KEY`.  
3. **SQL Editor** mein `docs/SUPABASE-profiles.sql` ka content run karein ( `profiles` table + RLS).  
4. **Authentication → Providers → Email** enabled ho (default).  
5. App mein sign up: email confirmation agar on hai to Supabase se email / dashboard se user verify karein.

---

## Step 5 – Cloudinary (naya)

1. [cloudinary.com](https://cloudinary.com) → free account.  
2. **Dashboard** se `Cloud name` copy → `CLOUDINARY_CLOUD_NAME`.  
3. **Settings → Upload → Upload presets** → naya preset, **Unsigned** = ON → name copy (e.g. `sharego_unsigned`) → `CLOUDINARY_UPLOAD_PRESET`.  
4. `CLOUDINARY_API_KEY` optional hai (unsigned preset ke saath aksar optional); agar chahiye to Cloudinary **API key** wahan se.  
5. Sab `.env` mein daal kar app dubara run karein.

---

## Step 6 – Admin panel (web)

```bash
cd Admin-Frontend
# CRA .env ignore karta hai agar aap alag se copy karein; .env.example dekhain
# REACT_APP_API_URL=http://localhost:4000
npm install
npm start
```

`src/apiConfig.js` → `REACT_APP_API_URL` (default `http://localhost:4000`) — **same** backend jahan chal raha ho.

**Login:** `src/Login.js` mein wahi hardcoded test emails; production ke liye badalna hoga.

---

## Step 7 – GitHub (repo connect)

Agar folder mein `git` abhi bhi nahi:

```bash
cd /path/to/FYP   # jahan App-Backend / App-Frontend hain
git init
git add .
git commit -m "Initial ShareGo project with backend and configs"
```

GitHub par **empty** repo banaein, phir:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Agar `remote` pehle se ghalat ho:

```bash
git remote -v
git remote set-url origin https://github.com/YOUR_USER/YOUR_REPO.git
```

**Zaroori:** public repo par **asli** `SUPABASE_ANON_KEY` / `CLOUDINARY` secrets mat daalain — `.env` mein placeholers/empty rakhein, ya `.env` ko `.gitignore` mein rakhein aur sirf `.env.example` commit karein (App-Frontend wala pattern already aap adjust kar sakte hain).

---

## Masle / checklist

- **Connection refused (app → API):** backend chal raha? firewall? phone aur PC same Wi‑Fi? `API_BASE_URL` sahi?  
- **Mongo error:** `MONGODB_URI` theek? Atlas pe IP `0.0.0.0/0` allow (dev ke liye).  
- **Supabase:** `profiles` table + SQL run; email confirmation off rakh ke test aasaan.

---

*Backend API routes: mobile app `BASE_URL` = `.../api/...` ; admin `http://...:4000/drivers` bina `/api` — dono is server par same database use karte hain.*
