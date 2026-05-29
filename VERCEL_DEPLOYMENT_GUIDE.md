# 🚀 Amour - Vercel Deployment & Local Run Guide

This guide details how to resolve the `vite` command error in VS Code and deploy the **Amour Web App** to Vercel with serverless AI capabilities.

---

## 💻 Part 1: Fix VS Code "Vite is not recognized" Error

When you export or download a project from AI Studio, the `node_modules` folder is excluded to keep the file size light. Trying to run `npm run build` or `npm run dev` without downloading dependencies first results in the `'vite' is not recognized` error.

### 🛠️ The Fix:
Open your VS Code terminal in the project directory, and run:

```bash
# 1. Install all required dependencies (Vite, React, Express, Firebase, etc.)
npm install

# 2. Run the application locally in development mode
npm run dev

# 3. Compile the application to production bundle
npm run build
```

---

## ☁️ Part 2: Deploying to Vercel

Vercel is the ultimate host for Vite and Serverless APIs. By structuring our API endpoints under the `/api` directory, Vercel will host:
1. **The frontend** statically for high-performance delivery.
2. **The backend API** (Empathetic Chat, Assessment Insights, and Portals) serverlessly with zero persistent server setup!

### Option A: Deploy via Vercel GitHub Integration (Recommended)

1. Commit and push your code to your **GitHub** repository.
2. Import the repository in your [Vercel Dashboard](https://vercel.com/new).
3. **Configure Environment Variables**:
   * Add `GEMINI_API_KEY` under the Environment Variables section of the project deployment configuration (this protects your secret key!).
4. Click **Deploy**! Vercel automatically detects Vite, compiles your assets, and provisions URLs instantly.

---

### Option B: Deploy via Vercel CLI

If you have the Vercel CLI installed globally (`npm i -g vercel`), you can deploy directly from your VS Code terminal:

```bash
# 1. Log in to Vercel (if not already logged in)
vercel login

# 2. Link your local project to Vercel
vercel link

# 3. Add your secret Gemini API key to Vercel environment variables
vercel env add GEMINI_API_KEY

# 4. Deploy the project publicly
vercel --prod
```

---

## 🔒 Part 3: Live Firebase Sync Configuration

Your app's `/firebase-applet-config.json` has been successfully updated with your private Firebase Web credential values:
* **Firebase Project ID**: `love-41f34`
* **App ID**: `1:942934220465:web:4c8b793c6509c91804cc90`
* **Storage Bucket**: `love-41f34.firebasestorage.app`

All register, login, diary entries, and synchronized database pipelines are live and directly secure!
