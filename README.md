# MitraBGT // Autonomous US Stock & ETF AI Rebalancing Engine

MitraBGT is an autonomous, context-aware macro trading agent designed for **Track 3 (US Stock AI Trading)** of the **Bitget S1 Hackathon**. The platform intercepts real-time Federal Reserve monetary policy announcements and CPI inflation indices, interprets macro sentiment indicators using server-side LLMs, and executes precise, risk-mitigated US stock and ETF portfolio reallocations.

It features a high-fidelity, brutalist-themed responsive terminal complete with an interactive **Tethered Physics Custom Cursor** matching the core branding of gold and crimson orbits.

---

## 🏛️ Four-Part Project Description (Hackathon Compliance)

### Part 1: Problem Statement & US Stock Trading Experience
Active portfolio management during pivotal macroeconomic regimes is traditionally slow, error-prone, and relies on rigid, deterministic quantitative models. Such systems fail to capture the nuanced language and hawkish/dovish leanings of Chairman Jerome Powell's FOMC press conferences or complex market sentiment. 

When macro news hits (e.g., higher-than-expected inflation metrics or interest rate revisions), manual rotation across indices such as **QQQ**, **SPY**, **TLT**, and **GLD** often occurs too late, resulting in severe capital drawdowns. MitraBGT resolves this latency by establishing a secure, fully autonomous, context-aware AI Agent loop that digests macro feeds, infers optimal allocations, and executes them instantly.

### Part 2: The AI-Powered Solution & Macro-Economic Strategy
MitraBGT operates on a validated macroeconomic thesis where Federal Reserve interest rate policy and inflation gravity govern general market valuations:
1. **Dovish Shifts (Policy Easing)**: Under Dovish regimes, capital costs drop, favoring growth assets. The engine dynamically rotates idle cash or defensive holdings into interest-rate-sensitive growth equities (**QQQ** and **SPY**).
2. **Hawkish Shifts (Policy Tightening)**: High rates compel defensive rotation to preserve capital. Under Hawkish regimes, the agent liquidates high-beta growth exposures in favor of defensive bond proxies (**TLT**), tokenized gold (**GLD**), or stable cash reserves (**USDT**).
3. **Logic Validation Safety Intercept**: To maintain rigorous compliance guardrails, if the agent attempts to purchase growth stocks during highly restrictive monetary regimes, the loop intercepts the trade, aborts execution, and logs a documented logic mismatch error—protecting capital from rogue sentiment inputs.

### Part 3: Technical Architecture & Bitget Ecosystem Integration
The architecture is designed for full auditability, combining Web3-level logging with high-speed indexing:
- **Frontend App**: React 19, Vite, Tailwind CSS, motion (fluid animations), and Lucide Icons.
- **Backend & Event Proxy**: Node.js and Express server with a WebSocket gateway for streaming real-time Fed signals.
- **Persistence Layer**: Multi-layered persistent storage backing state to **Google Cloud PostgreSQL (via Cloud SQL & Drizzle)** and **Firebase Firestore** with local JSON file fallbacks.
- **Bitget Agent Hub Integration**: Custom adapter (`BitgetAdapter.ts`) that maps model inferences to standard Bitget schemas. All simulated trade actions are translated into the official **Bitget Transaction format** (verifiable via unique Bitget API Log IDs).
- **Interactive Navigation**: Seamless navigation across the **Agent Terminal**, **Live Portfolio NAV**, **Fed Signals Feed**, and **Cryptographic Audit Logs**.

### Part 4: Our Take on AI Trading & Future Outlook
AI is shifting quantitative trading from purely numerical indicators to multi-modal cognitive loops. By joining LLM-based linguistic comprehension with deterministic safety guardrails, we bridge the gap between human language and high-speed execution. Our future vision directly couples the **BitgetAdapter** to live brokerage accounts via the **Bitget Agent Hub Model Context Protocol (MCP) Server**, enabling secure, non-custodial capital rotation across traditional ETFs and tokenized US equities.

---

## 🛠️ System Architecture Diagram

```
                       [Real-Time Macro Feeds]
                     (FOMC Speeches, CPI Prints)
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │   Express Proxy Server  │
                     └────────────┬────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│ Gemini API (LLM) │                              │ WebSocket Server │
│ Macro Sentiment  │                              │ Live Broadcasts  │
└────────┬─────────┘                              └────────┬─────────┘
         │                                                 │
         ├─────────────────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────────────────┐
│              MitraBGT Agent Decision Engine              │
│    (Asset Reallocation Logic & Safety Intercept Guard)   │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┼────────────────┬───────────────┐
         ▼               ▼                ▼               ▼
  ┌─────────────┐ ┌─────────────┐  ┌─────────────┐ ┌─────────────┐
  │  Firestore  │ │  Cloud SQL  │  │ Bitget Hub  │ │ Local Cache │
  │ (Persistent)│ │(PostgreSQL) │  │  (Orders)   │ │ (Fallback)  │
  └─────────────┘ └─────────────┘  └─────────────┘ └─────────────┘
```

---

## 📊 Verifiable Paper Trading Log (Track 3 Requirement)

All trade logs executed by the autonomous engine are formatted according to the official Bitget ledger structure:

| ID | Timestamp (UTC) | Asset | Direction | Execution Price | Quantity | Total Value | Verification & Bitget API Log ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **tx-1001** | 2026-06-26T14:15:22Z | **QQQ** | `BUY` | $475.00 | 20 | $9,500.00 | Verifiable via Bitget Hub ID: `bg-mcp-9201` |
| **tx-1002** | 2026-06-26T14:15:25Z | **TLT** | `SELL` | $95.00 | 150 | $14,250.00 | Verifiable via Bitget Hub ID: `bg-mcp-9202` |
| **tx-1003** | 2026-06-11T18:10:05Z | **USDT** | `BUY` | $1.00 | 8,500 | $8,500.00 | Verifiable via Bitget Hub ID: `bg-mcp-7840` |

---

## 🎮 Custom Tethered Physics Cursor
To reflect our core design branding, we have replaced the default cursor on desktop with a **Tethered Gravity Cursor** modeled after the user-supplied reference:
- **Lead Target (White Dot)**: Moves instantly with the pointer coordinates to guarantee pixel-perfect UI clicking and interactive control.
- **Trailing Mass (Crimson & Gold Orb on a Base Block)**: Follows the lead target with physics-based spring dampening, simulating a heavy kinetic anchor.
- **Tension Tether (Dashed Line)**: Stretches dynamically between the target and the mass, indicating momentum, speed, and real-time inertia.
- Hovering over buttons/links causes the leading dot to glow with an amber scale transition, while the orb tilts in physical response.

---

## 🚀 Deployment Guide (Vercel vs. Containers)

As a full-stack dashboard featuring **WebSockets**, a stateful **background broadcast loop** (polling news every 20 seconds), and persistent server-side caching, the deployment strategy has a few important constraints depending on your provider:

### Model A: Container-Based Hosting (Recommended: Render, Railway, Cloud Run)
Because MitraBGT runs a persistent WebSockets server (`ws`) and a continuous scheduling loop, **deploying the entire app as a unified container is the easiest, most robust method.**

1. **Vite + Express Bundle**: When you run `npm run build`, Vite compiles the frontend into `dist/`, and `esbuild` compiles the backend server into a single bundled Node file `dist/server.cjs`.
2. **Setup on Render/Railway**:
   - Create a new **Web Service** pointed to your repository.
   - Set the Build Command to `npm run build`.
   - Set the Start Command to `npm start`.
   - Add your environment variables (detailed below).
   - *Result*: Your persistent WebSocket connections, background schedulers, and Express API endpoints will run continuously with 100% uptime.

---

### Model B: Vercel Deployment (Decoupled Model)
Vercel is a **serverless** platform designed for stateless, short-lived executions.
> ⚠️ **Important Caveats on Serverless Platforms:**
> - **WebSockets**: Vercel Serverless Functions do **NOT** support persistent WebSockets (`ws`). If you deploy on Vercel, the websocket gateway connection will close after 10-60 seconds. The client will gracefully fallback to regular REST calls, but real-time push events are disabled.
> - **Continuous Intervals**: `setInterval` loops do not run continuously on Vercel because the Node instance shuts down as soon as the HTTP response is completed.
> - **Local Cache**: Fallback file storage (`data/trade_logs.json`) will be erased whenever Vercel spins down the serverless container. You **must** configure Firebase or PostgreSQL (Cloud SQL) for persistent storage.

If you choose to deploy on Vercel, follow these steps:

#### Step 1: Split Frontend & Backend (Recommended for Vercel)
1. Deploy the **Frontend Static Assets** to Vercel (point build settings to `dist/` with Build Command: `npm run build`).
2. Deploy the **Express Backend** to Render, Railway, or Google Cloud Run.
3. Set the environment variable `VITE_BACKEND_URL` on Vercel to point to your hosted backend url (e.g. `https://mitrabgt-backend.onrender.com`), allowing the frontend to make remote REST/WS requests securely.

#### Step 2: Serverless Mono-Repo Config (Alternative Vercel-Only Setup)
If you deploy the entire monorepo directly to Vercel:
1. Provide a `vercel.json` in the root mapping all `/api/*` requests to your Express backend:
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/server.ts" },
    { "source": "/(.*)", "destination": "/dist/$1" }
  ]
}
```
2. Note that WebSockets and persistent background interval news cycles will be inactive in this mode.

---

## 🔑 Environment Variables Setup
You must supply the following credentials to your deployment panel (Vercel, Render, or Railway) or your local `.env` file:

```env
# Google Gemini API Key (Mandatory for AI Macro interpretation and sentiment synthesis)
GEMINI_API_KEY="AIzaSy..."

# Bitget API Management credentials (Used to mock secure Bitget Hub trading API keys)
BITGET_API_KEY="bg-mcp-sandbox-demo-key-2026"
BITGET_API_SECRET="bg-mcp-sandbox-secret-abc"

# Relational Database URL (Optional: For PostgreSQL Drizzle backend)
DATABASE_URL="postgresql://user:password@host:5432/db"

# Firebase Config (Optional: If utilizing Firebase Firestore as your persistent engine)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@..."
```

---

## ⚙️ Running Locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Launches the Express server and Vite in tandem:
```bash
npm run dev
```

### 3. Build & Run in Production
Compiles frontend assets and bundles the Node server for distribution:
```bash
npm run build
npm start
```
The server will bind to `http://localhost:3000`, matching all target environment setups.
