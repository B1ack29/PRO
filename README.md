# PRO — Product Rating Overview

Rate any product with custom criteria. Built with Expo + React Native.

## Features
- Add products with photos
- Custom rating criteria (0–10, supports decimals like 7.5)
- Auto-calculated overall score
- Categories: Drink, Food, Snack, Alcohol, Other
- Notes per product
- Stats dashboard (total, average, top rated)

---

## How to build APK via GitHub

### Step 1 — Create Expo account
Go to https://expo.dev and create a free account.

### Step 2 — Get your EXPO_TOKEN
1. Go to https://expo.dev/settings/access-tokens
2. Click **Create Token**
3. Copy the token

### Step 3 — Add token to GitHub
1. Open your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `EXPO_TOKEN`
4. Value: paste your token
5. Save

### Step 4 — Push code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/PRO.git
git push -u origin main
```

### Step 5 — Trigger the build
The build starts automatically on push. Or go to:
**Actions** tab → **Build APK** → **Run workflow**

### Step 6 — Download APK
1. Go to https://expo.dev/accounts/YOUR_USERNAME/projects/pro-product-rating/builds
2. Wait ~10 minutes for build to finish
3. Download the `.apk` file
4. Install on Android (enable "Install from unknown sources" in settings)

---

## Local development
```bash
npm install
npx expo start
```
Scan QR code with Expo Go app.
