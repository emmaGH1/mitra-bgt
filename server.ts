import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Direct imports for DB
import { getDb, isDbConfigured } from "./src/db/index.ts";
import { tradeLogs, signalsLog } from "./src/db/schema.ts";
import { desc } from "drizzle-orm";
import { isFirestoreConfigured, getTradeLogsFromFirestore, addTradeLogToFirestore, getSignalsFromFirestore, addSignalToFirestore } from "./src/db/firebase.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent fallback file paths for database logs
const DATA_DIR = path.join(process.cwd(), "data");
const LOGS_FILE = path.join(DATA_DIR, "trade_logs.json");
const SIGNALS_FILE = path.join(DATA_DIR, "signals_log.json");

// Ensure data directory and fallback files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(SIGNALS_FILE)) {
  fs.writeFileSync(SIGNALS_FILE, JSON.stringify([], null, 2));
}

// REST APIs: GET historical trade logs
app.get("/api/logs", async (req, res) => {
  try {
    const db = getDb();
    if (db) {
      const records = await db.select().from(tradeLogs).orderBy(desc(tradeLogs.timestamp));
      return res.json(records);
    }

    if (isFirestoreConfigured()) {
      const records = await getTradeLogsFromFirestore();
      return res.json(records);
    }

    // Fallback JSON DB
    const raw = fs.readFileSync(LOGS_FILE, "utf-8");
    const records = JSON.parse(raw);
    // Sort newest first
    records.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json(records);
  } catch (error: any) {
    console.error("API GET logs error:", error);
    return res.status(500).json({ error: "Failed to load trade logs.", details: error.message });
  }
});

// REST APIs: POST a new trade log
app.post("/api/logs", async (req, res) => {
  try {
    const newLog = req.body;
    if (!newLog.id || !newLog.asset || !newLog.action || !newLog.price) {
      return res.status(400).json({ error: "Invalid trade log payload" });
    }

    const db = getDb();
    if (db) {
      await db.insert(tradeLogs).values({
        id: newLog.id,
        timestamp: new Date(newLog.timestamp || Date.now()),
        asset: newLog.asset,
        action: newLog.action,
        price: Number(newLog.price),
        quantity: Number(newLog.quantity),
        value: Number(newLog.value),
        rationale: newLog.rationale || "",
        txHash: newLog.txHash || "",
      });
      console.log(`Saved trade log to Cloud SQL: ${newLog.id}`);
    } else if (isFirestoreConfigured()) {
      await addTradeLogToFirestore(newLog);
      console.log(`Saved trade log to Firestore: ${newLog.id}`);
    } else {
      // Fallback JSON DB
      const raw = fs.readFileSync(LOGS_FILE, "utf-8");
      const records = JSON.parse(raw);
      records.unshift(newLog); // prepend
      fs.writeFileSync(LOGS_FILE, JSON.stringify(records, null, 2));
      console.log(`Saved trade log to JSON DB fallback: ${newLog.id}`);
    }

    return res.json({ status: "success", data: newLog });
  } catch (error: any) {
    console.error("API POST log error:", error);
    return res.status(500).json({ error: "Failed to save trade log.", details: error.message });
  }
});

// REST APIs: GET signals
app.get("/api/signals", async (req, res) => {
  try {
    const db = getDb();
    if (db) {
      const records = await db.select().from(signalsLog).orderBy(desc(signalsLog.timestamp));
      return res.json(records);
    }

    if (isFirestoreConfigured()) {
      const records = await getSignalsFromFirestore();
      return res.json(records);
    }

    const raw = fs.readFileSync(SIGNALS_FILE, "utf-8");
    const records = JSON.parse(raw);
    records.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json(records);
  } catch (error: any) {
    console.error("API GET signals error:", error);
    return res.status(500).json({ error: "Failed to load signals.", details: error.message });
  }
});

// REST APIs: POST a new signal
app.post("/api/signals", async (req, res) => {
  try {
    const newSignal = req.body;
    if (!newSignal.id || !newSignal.headline || !newSignal.sentiment) {
      return res.status(400).json({ error: "Invalid signal payload" });
    }

    const db = getDb();
    if (db) {
      await db.insert(signalsLog).values({
        id: newSignal.id,
        timestamp: new Date(newSignal.timestamp || Date.now()),
        source: newSignal.source,
        headline: newSignal.headline,
        sentiment: newSignal.sentiment,
        score: Number(newSignal.score),
        interpretation: newSignal.interpretation,
        recommendedAllocation: newSignal.recommendedAllocation,
      });
      console.log(`Saved signal to Cloud SQL: ${newSignal.id}`);
    } else if (isFirestoreConfigured()) {
      await addSignalToFirestore(newSignal);
      console.log(`Saved signal to Firestore: ${newSignal.id}`);
    } else {
      // Fallback JSON DB
      const raw = fs.readFileSync(SIGNALS_FILE, "utf-8");
      const records = JSON.parse(raw);
      records.unshift(newSignal);
      fs.writeFileSync(SIGNALS_FILE, JSON.stringify(records, null, 2));
      console.log(`Saved signal to JSON DB fallback: ${newSignal.id}`);
    }

    return res.json({ status: "success", data: newSignal });
  } catch (error: any) {
    console.error("API POST signal error:", error);
    return res.status(500).json({ error: "Failed to save signal.", details: error.message });
  }
});

// Live Order Execution Express Proxy (using @bitget-ai/getagent-skill pattern)
app.post("/api/execute-trade", (req, res) => {
  try {
    const { asset, action, price, quantity, value, rationale } = req.body;
    
    // Check if live API keys exist (Bitget S1 credentials)
    const apiKey = process.env.BITGET_API_KEY || "bg-mcp-sandbox-demo-key-2026";
    const apiSecret = process.env.BITGET_API_SECRET || "bg-mcp-sandbox-secret-abc";

    console.log("=== BITGET LIVE AGENT ORDER ROUTER ===");
    console.log(`[AUTH] Authenticating with Bitget key: ${apiKey.substring(0, 8)}...`);
    console.log(`[ORDER] Routing to Tokenized RWA/Crypto Matching engine...`);
    console.log(`[DETAIL] ${action} ${quantity} units of ${asset} at reference price $${price}`);
    console.log(`[RATIONALE] ${rationale}`);
    
    // Simulate real @bitget-ai/getagent-skill execution response
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`;
    const mockBitgetOrderId = `bg-order-${asset ? asset.toLowerCase() + '-' : ''}${Math.floor(Math.random() * 900000 + 100000)}`;

    console.log(`[STATUS] Order successfully filled! Order ID: ${mockBitgetOrderId}. TX Hash: ${mockTxHash}`);
    console.log("======================================");

    return res.json({
      success: true,
      orderId: mockBitgetOrderId,
      txHash: mockTxHash,
      executionTimestamp: new Date().toISOString(),
      networkCostUSD: 0.00, // Paper Trading Sandbox
      status: "FILLED"
    });
  } catch (err: any) {
    console.error("Error in execute-trade proxy:", err);
    return res.status(500).json({ error: "Failed to route order to Bitget Agent Hub.", details: err.message });
  }
});

// Create base HTTP Server
const server = http.createServer(app);

// WebSocket Server for streaming live news headlines (Bitget Macro-Analyst Skill)
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket upgrade
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// List of live headlines for continuous streaming
const STREAMING_HEADLINES = [
  {
    source: "Bloomberg Terminals",
    headline: "Waller signals current policy is sufficiently restrictive, hinting at incoming cuts",
    sentiment: "dovish" as const,
    score: 0.65,
    interpretation: "Fed Governor Waller indicated that current real interest rates are high enough to tame demand, laying the groundwork for cutting rates in the coming quarter. High growth assets are highly favored.",
    recommendedAllocation: { QQQ: 42, SPY: 26, TLT: 22, GLD: 8, USDT: 2 }
  },
  {
    source: "CNBC Broadcast",
    headline: "Producer Price Index (PPI) shows negative growth in manufacturing sectors",
    sentiment: "dovish" as const,
    score: 0.55,
    interpretation: "PPI manufacturing components contracted by 0.2%, providing additional confirmation that supply-side wholesale pricing pressures have been entirely extinguished. Perfect recipe for interest rate moderation.",
    recommendedAllocation: { QQQ: 39, SPY: 28, TLT: 23, GLD: 7, USDT: 3 }
  },
  {
    source: "Federal Reserve Alert",
    headline: "Kashkari voices concern over rental inflation delay, suggests fewer cuts",
    sentiment: "hawkish" as const,
    score: -0.70,
    interpretation: "Fed President Kashkari argued that shelter services cost remains a sticky variable, expressing hesitation to support immediate cuts. Rotation into cash reserves and defensive sectors is recommended.",
    recommendedAllocation: { QQQ: 28, SPY: 32, TLT: 14, GLD: 11, USDT: 15 }
  },
  {
    source: "Bloomberg Economics",
    headline: "Jobless claims hit 240k, indicating clear soft landing trend in labor",
    sentiment: "dovish" as const,
    score: 0.45,
    interpretation: "Rising initial jobless claims suggest the sizzling labor market is cooling down to sustainable levels. This gives the FOMC a wider margin to cut rates without igniting wage inflation.",
    recommendedAllocation: { QQQ: 36, SPY: 29, TLT: 21, GLD: 9, USDT: 5 }
  },
  {
    source: "FOMC Minutes Release",
    headline: "Dot plot projections revised; median members forecast 3 cuts next year",
    sentiment: "dovish" as const,
    score: 0.80,
    interpretation: "The latest Dot Plot shows a cluster of consensus around deep policy easing through next year, reassuring investors of a continuous downward glide path in short-term interest rates.",
    recommendedAllocation: { QQQ: 44, SPY: 24, TLT: 26, GLD: 4, USDT: 2 }
  },
  {
    source: "CPI Bulletin",
    headline: "Core inflation matches forecast at 3.0%, heading towards target",
    sentiment: "neutral" as const,
    score: 0.15,
    interpretation: "No unexpected surprises in the latest CPI report. The steady pace of core inflation keeps the Fed on a moderate, highly predictable path, favoring a balanced asset mix.",
    recommendedAllocation: { QQQ: 34, SPY: 31, TLT: 19, GLD: 10, USDT: 6 }
  }
];

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to real-time News Websocket.");

  // Send an immediate greeting and acknowledgment
  ws.send(JSON.stringify({ type: "ping", text: "WebSocket Connection Established with Bitget Agent Hub." }));

  // Keep connection alive with heartbeat ping
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("close", () => {
    console.log("Client disconnected from News Websocket.");
    clearInterval(pingInterval);
  });
});

// Broadcast a live announcement to all connected clients every 20 seconds
let currentHeadlineIndex = 0;
setInterval(() => {
  if (wss.clients.size > 0) {
    const item = STREAMING_HEADLINES[currentHeadlineIndex];
    const data = {
      id: `sig-ws-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: item.source,
      headline: item.headline,
      sentiment: item.sentiment,
      score: item.score,
      interpretation: item.interpretation,
      recommendedAllocation: item.recommendedAllocation
    };

    console.log(`[WEBSOCKET] Broadcasting Live News: ${item.headline}`);
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "news",
          data: data
        }));
      }
    });

    // Cycle through headlines
    currentHeadlineIndex = (currentHeadlineIndex + 1) % STREAMING_HEADLINES.length;
  }
}, 20000); // 20 seconds interval for highly dynamic stream

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build serving from /dist.");
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`MitraBGT Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
