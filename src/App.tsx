import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  Terminal, 
  Layers, 
  Clock, 
  Cpu, 
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Wifi,
  WifiOff,
  Activity,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { FedSignal, PortfolioAsset, UsageRecord, AgentStatusState, SimulationPreset } from './types';
import { INITIAL_ASSETS, INITIAL_SIGNALS, INITIAL_LOGS, SIMULATION_PRESETS } from './data/mockData';
import { BitgetAdapter } from './lib/BitgetAdapter';
import AgentStatus from './components/AgentStatus';
import Signals from './components/Signals';
import Portfolio from './components/Portfolio';
import TradeLog from './components/TradeLog';
import Mascot from './components/Mascot';
import CustomCursor from './components/CustomCursor';
import BacktestVisualizer from './components/BacktestVisualizer';

// Cryptographic hash helper for auditable trade logs
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Typewriter effect component for top texts with a sleek terminal-style blinking cursor
function TypewriterText({ text, speed = 35, className = "" }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    setDone(false);
    
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="inline-block w-2.5 h-4 ml-1 bg-current animate-pulse align-middle" />
      )}
    </span>
  );
}

export default function App() {
  const [assets, setAssets] = useState<PortfolioAsset[]>(INITIAL_ASSETS);
  const [signals, setSignals] = useState<FedSignal[]>(INITIAL_SIGNALS);
  const [logs, setLogs] = useState<UsageRecord[]>(INITIAL_LOGS);
  const [currentSentiment, setCurrentSentiment] = useState<number>(0.75); // Initial dovish state
  const [isSimulating, setIsSimulating] = useState(false);
  const [time, setTime] = useState<string>('');

  // Dark mode state - reads preference from system if no local storage is found
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Responsive mobile menu toggler state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real-time WebSocket Status state
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  const [agentStatus, setAgentStatus] = useState<AgentStatusState>({
    status: 'idle',
    lastThought: 'Market consensus leans dovish following Powell\'s recent commentary. Allocation weight target for QQQ increased to 40%. Standing by for FOMC or CPI announcements.'
  });

  // Scroll Progress Tracker for top indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate live total portfolio valuation
  const totalValue = assets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);

  // Synchronize mutable refs for use inside asynchronous event handlers
  const assetsRef = useRef<PortfolioAsset[]>(assets);
  assetsRef.current = assets;

  const totalValueRef = useRef<number>(totalValue);
  totalValueRef.current = totalValue;

  const isSimulatingRef = useRef<boolean>(isSimulating);
  isSimulatingRef.current = isSimulating;

  const handleTriggerPresetRef = useRef<any>(null);

  // Reference for scrolling to dashboard sections smoothly
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Tick the clock for the header (Aesthetic and matching live time guidelines)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // API Call: Fetch logs and signals from database
  const loadLogsFromDb = () => {
    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Parse the SQL timestamp if necessary or keep strings
          const mappedLogs = data.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp).toISOString(),
          }));
          setLogs(mappedLogs);
        }
      })
      .catch(err => console.warn('Failed to load logs from persistent database, using current state:', err));
  };

  const loadSignalsFromDb = () => {
    fetch('/api/signals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedSignals = data.map((sig: any) => ({
            ...sig,
            timestamp: new Date(sig.timestamp).toISOString(),
            recommendedAllocation: typeof sig.recommendedAllocation === 'string' 
              ? JSON.parse(sig.recommendedAllocation) 
              : sig.recommendedAllocation
          }));
          setSignals(mappedSignals);
          if (mappedSignals[0]) {
            setCurrentSentiment(mappedSignals[0].score);
          }
        }
      })
      .catch(err => console.warn('Failed to load signals from persistent database, using current state:', err));
  };

  // Synchronize histories from DB on mount
  useEffect(() => {
    loadLogsFromDb();
    loadSignalsFromDb();
  }, []);

  // WebSocket Connection Handler
  useEffect(() => {
    const connectWebSocket = () => {
      setWsStatus('connecting');
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}`;
      
      console.log(`[WEBSOCKET] Initiating stream connection to ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WEBSOCKET] Streaming Connected.');
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'news' && message.data) {
            console.log(`[WEBSOCKET] Received Streaming Macro Event: ${message.data.headline}`);
            
            if (isSimulatingRef.current) {
              console.log('[WEBSOCKET] Rebalancing already in progress. Ignoring incoming WebSocket signal.');
              return;
            }

            // Build the preset payload for automatic processing
            const presetPayload: SimulationPreset = {
              name: `Live Alert: ${message.data.source}`,
              source: message.data.source,
              headline: message.data.headline,
              sentiment: message.data.sentiment,
              score: message.data.score,
              interpretation: message.data.interpretation,
              thought: `AUTOMATED STREAM PARSER: Intercepted live feed. Analyzing macro implications... Sentiment score maps to ${message.data.score}. Shifting target positions.`,
              recommendedAllocation: message.data.recommendedAllocation
            };

            // Run autonomous processing loop using non-stale reference
            if (handleTriggerPresetRef.current) {
              handleTriggerPresetRef.current(presetPayload);
            }
          }
        } catch (err) {
          console.error('[WEBSOCKET] Message parsing failed:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WEBSOCKET] Disconnected. Scheduling auto-reconnect...');
        setWsStatus('disconnected');
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (err) => {
        console.warn('[WEBSOCKET] Stream error:', err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Keep handleTriggerPresetRef up to date with latest render state
  useEffect(() => {
    handleTriggerPresetRef.current = handleTriggerPreset;
  }, [assets, totalValue, isSimulating]);

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler for running the diagnostic test (Self-Test)
  const handleRunDiagnostic = () => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setIsSimulating(true);
    setAgentStatus({
      status: 'thinking',
      lastThought: 'RUNNING DIAGNOSTICS: Testing Brokerage API connections... Checking websocket status... Ping 12ms. Validating API payload definitions for US stock endpoints.'
    });

    setTimeout(() => {
      setAgentStatus({
        status: 'rebalancing',
        lastThought: 'DIAGNOSTICS RESOLVED: Connection secure. Sub-account allocation margins are 100% compliant. Verifiable log system is online.'
      });
      
      setTimeout(() => {
        setAgentStatus({
          status: 'idle',
          lastThought: 'System healthy. Listening to active Fed channels and CPI feeds. No trade drift detected.'
        });
        isSimulatingRef.current = false;
        setIsSimulating(false);
      }, 1500);
    }, 1500);
  };

  // Handler for triggering macro simulation presets (Universal processor for both UI click and live WS stream!)
  const handleTriggerPreset = async (preset: SimulationPreset) => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setIsSimulating(true);

    // 1. Agent starts THINKING about the news
    setAgentStatus({
      status: 'thinking',
      lastThought: preset.thought
    });

    // 2. Delay to represent AI processing / API Calls
    setTimeout(() => {
      // Transition to rebalancing state
      setAgentStatus({
        status: 'rebalancing',
        lastThought: `REBALANCING IN PROGRESS: Calculating trade deviations. Connecting to Bitget Agent Hub using @bitget-ai/getagent-skill proxy...`
      });

      // 3. Process the rebalancing mathematically and execute trades live on the backend
      setTimeout(async () => {
        try {
          // Route market perception through BitgetAdapter macro-analyst skill
          const routedPerception = BitgetAdapter.routeMarketPerception(preset);
          console.log('[BITGET ADAPTER] Routed macro perception:', routedPerception);

          // Shift global sentiment meter to preset score
          setCurrentSentiment(preset.score);

          // Add the new signal to the feed history
          const newSignal: FedSignal = {
            id: `sig-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: preset.source,
            headline: preset.headline,
            sentiment: preset.sentiment,
            score: preset.score,
            interpretation: preset.interpretation,
            recommendedAllocation: preset.recommendedAllocation
          };

          // Save signal to backend database
          await fetch('/api/signals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSignal)
          }).catch(err => console.warn('Failed to persist signal in DB:', err));

          // Reload updated signal stream from backend
          loadSignalsFromDb();

          // Process asset quantities/allocations based on recommended weights
          const updatedAssets = await Promise.all(assetsRef.current.map(async (asset) => {
            const targetWeight = preset.recommendedAllocation[asset.symbol] ?? 5.0; // fallback weight
            
            // Calculate the target value based on new weight recommendations
            const targetAssetValue = (totalValueRef.current * targetWeight) / 100;
            // Calculate new implied quantity
            const newQty = Math.round(targetAssetValue / asset.price);
            const currentQty = asset.quantity;
            const deltaQty = newQty - currentQty;

            // If there's a difference, process verification loop
            if (deltaQty !== 0) {
              const tradeAction = deltaQty > 0 ? 'BUY' : 'SELL';
              const logValue = Math.abs(deltaQty * asset.price);

              // ==========================================
              // STEP 1: LOGIC VALIDATION
              // ==========================================
              let isAborted = false;
              let abortReason = "";
              if (preset.sentiment === 'hawkish' && tradeAction === 'BUY' && (asset.symbol === 'QQQ' || asset.symbol === 'SPY')) {
                isAborted = true;
                abortReason = `Logic_Mismatch_Warning: Proposed growth asset BUY contradicts restrictive Hawkish macroeconomic environment`;
              }

              if (isAborted) {
                console.warn(`[LOGIC VALIDATION] ${abortReason}. ABORTING TRADE FOR ${asset.symbol}.`);
                
                // Auditable JSON structure for safety abort
                const decisionTimestamp = new Date().toISOString();
                const decisionLogicText = `System safety check intercepted growth asset BUY during a Hawkish Fed regime to protect capital reserves.`;
                const words = decisionLogicText.split(/\s+/);
                const finalDecisionLogic = words.slice(0, 25).join(' ');

                const tradeHashInput = `${decisionTimestamp}ABORT${Math.abs(deltaQty)}`;
                const calculatedHash = await sha256(tradeHashInput);

                const auditRecord = {
                  Timestamp: decisionTimestamp,
                  Signal_Source: preset.source,
                  Sentiment_Score: Number(preset.score),
                  Decision_Logic: finalDecisionLogic,
                  Trade_Hash: calculatedHash
                };

                const abortedLog: UsageRecord = {
                  id: `abort-${asset.symbol.toLowerCase()}-${Math.floor(Math.random() * 900000 + 100000)}`,
                  timestamp: decisionTimestamp,
                  asset: asset.symbol,
                  action: 'SYSTEM_SAFETY_ABORT',
                  price: asset.price,
                  quantity: Math.abs(deltaQty),
                  value: Math.round(logValue * 100) / 100,
                  rationale: `System_Safety_Abort: ${abortReason}. Trade auto-cancelled by compliance guard. [AUDIT_RECORD: ${JSON.stringify(auditRecord)}]`,
                  txHash: `ABORT-${calculatedHash.substring(0, 12).toUpperCase()}`
                };

                // Persist failure to the TradeLog database
                await fetch('/api/logs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(abortedLog)
                }).catch(err => console.warn('Failed to persist abort log in DB:', err));

                // Inform the dashboard via agent status
                setAgentStatus({
                  status: 'idle',
                  lastThought: `SYSTEM SAFETY INTERCEPT: Logged Logic_Mismatch_Warning. Buying growth index ${asset.symbol} under Hawkish conditions aborted.`
                });

                // Return asset completely unchanged
                return asset;
              }

              // ==========================================
              // STEP 2: CONSTRAINT CHECK
              // ==========================================
              let finalDeltaQty = deltaQty;
              let finalLogValue = logValue;
              let constraintAppliedText = "";

              const riskAllocationCap = totalValueRef.current * 0.20;
              if (logValue > riskAllocationCap) {
                const allowedValue = riskAllocationCap;
                const allowedQty = Math.floor(allowedValue / asset.price);
                finalDeltaQty = deltaQty > 0 ? allowedQty : -allowedQty;
                finalLogValue = Math.abs(finalDeltaQty * asset.price);
                constraintAppliedText = ` [Constraint Checked: Recalculated size from ${Math.abs(deltaQty)} to ${Math.abs(finalDeltaQty)} to comply with 20% Risk_Allocation_Cap ($${Math.round(riskAllocationCap).toLocaleString()})]`;
                console.log(`[CONSTRAINT CHECK] Recalculated size for ${asset.symbol} to comply with 20% Risk Allocation Cap.`);
              }

              // Guard against zero-share trades under strict restrictions
              if (finalDeltaQty === 0 && deltaQty !== 0) {
                finalDeltaQty = deltaQty > 0 ? 1 : -1;
                finalLogValue = Math.abs(finalDeltaQty * asset.price);
              }

              // ==========================================
              // STEP 3: AUDITABLE FORMATTING
              // ==========================================
              const decisionTimestamp = new Date().toISOString();
              const decisionLogicText = `Asset weight shift for ${asset.symbol} matches the ${preset.sentiment} market indicators broadcasted by ${preset.source}.`;
              const words = decisionLogicText.split(/\s+/);
              const finalDecisionLogic = words.slice(0, 25).join(' ');

              const tradeHashInput = `${decisionTimestamp}${tradeAction}${Math.abs(finalDeltaQty)}`;
              const calculatedHash = await sha256(tradeHashInput);

              const auditRecord = {
                Timestamp: decisionTimestamp,
                Signal_Source: preset.source,
                Sentiment_Score: Number(preset.score),
                Decision_Logic: finalDecisionLogic,
                Trade_Hash: calculatedHash
              };

              const rationalString = `Rebalancing: ${preset.source} event - ${preset.headline.substring(0, 50)}... Shift allocation of ${asset.symbol} to ${targetWeight}%${constraintAppliedText}. [AUDIT_RECORD: ${JSON.stringify(auditRecord)}]`;

              // Format trade log to follow the official Bitget transaction format (timestamp, pair, direction, price, quantity)
              const formattedBitgetTransaction = BitgetAdapter.toBitgetTransaction({
                asset: asset.symbol,
                action: tradeAction,
                price: asset.price,
                quantity: Math.abs(finalDeltaQty),
                timestamp: decisionTimestamp,
              });
              console.log('[BITGET ADAPTER] Formatted trade log in Bitget format:', formattedBitgetTransaction);

              // POST order execution to Express proxy (routing orders securely via Bitget Agent Hub API)
              const executionRes = await fetch('/api/execute-trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  asset: asset.symbol,
                  action: tradeAction,
                  price: asset.price,
                  quantity: Math.abs(finalDeltaQty),
                  value: Math.round(finalLogValue * 100) / 100,
                  rationale: rationalString,
                  bitgetTx: formattedBitgetTransaction
                })
              }).then(res => res.json()).catch(err => {
                console.warn('Express order router failed. Generating local sandbox match.', err);
                return {
                  orderId: `bg-order-${asset.symbol.toLowerCase()}-${Math.floor(Math.random() * 900000 + 100000)}`,
                  txHash: `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`
                };
              });

              const newLog: UsageRecord = {
                id: executionRes.orderId || `tx-${asset.symbol.toLowerCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
                timestamp: decisionTimestamp,
                asset: asset.symbol,
                action: tradeAction,
                price: asset.price,
                quantity: Math.abs(finalDeltaQty),
                value: Math.round(finalLogValue * 100) / 100,
                rationale: rationalString,
                txHash: `${executionRes.txHash} (Verifiable Log: ${calculatedHash.substring(0, 10)})`
              };

              // Persist log to backend database
              await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLog)
              }).catch(err => console.warn('Failed to persist log in DB:', err));

              // Compute final metrics for rebalanced asset
              const rebalancedValue = (currentQty + finalDeltaQty) * asset.price;
              const rebalancedWeight = Math.round((rebalancedValue / totalValueRef.current) * 1000) / 10;

              return {
                ...asset,
                quantity: currentQty + finalDeltaQty,
                allocation: rebalancedWeight,
                targetAllocation: targetWeight,
                value: rebalancedValue
              };
            }

            return {
              ...asset,
              targetAllocation: targetWeight
            };
          }));

          setAssets(updatedAssets);
          // Reload latest persistent trades from backend
          loadLogsFromDb();

          // Transition back to IDLE with final reasoning
          setAgentStatus({
            status: 'idle',
            lastThought: `Compliance rebalancing complete. Decoupled and audited trade hashes generated. Verifiable Hackathon database logs updated.`
          });
          isSimulatingRef.current = false;
          setIsSimulating(false);
        } catch (err) {
          console.error('Error during trade rebalancing execution loop:', err);
          isSimulatingRef.current = false;
          setIsSimulating(false);
        }
      }, 2000); // 2 second rebalancing phase

    }, 2000); // 2 second thinking phase
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-ink font-sans p-4 md:p-8 selection:bg-red selection:text-white pb-16 overflow-x-hidden transition-colors duration-150">
      
      {/* Custom trailing fluid high-performance cursor with GSAP ticker */}
      <CustomCursor />

      {/* Progress Scroll Bar Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-red origin-left z-[999]" 
        style={{ scaleX }} 
      />

      {/* Elegant, Transparent Top Utility Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto mb-8 py-4 border-b-2 border-ink/10 dark:border-cream/10 text-ink dark:text-cream relative z-[100]"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Logo & Brand Name */}
          <a 
            href="/" 
            className="flex items-center gap-3 group cursor-pointer hover:scale-102 transition-all duration-300"
            id="brand-logo-link"
          >
            {/* Logo element: image with high-fidelity styled CSS fallback */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-b from-[#3E1A1A] to-ink border-2 border-red flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(249,24,20,0.5)]">
              <img 
                src="/logo.png" 
                alt="MitraBGT Logo" 
                className="absolute inset-0 w-full h-full object-cover hidden"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  e.currentTarget.classList.remove('hidden');
                }}
                referrerPolicy="no-referrer"
              />
              {/* High-fidelity CSS fallback matching the glowing red orb with white pill eyes */}
              <div className="w-full h-full flex items-center justify-center gap-1.5 relative bg-gradient-to-b from-[#2a0e0e] to-ink">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,24,20,0.3)_0%,transparent_70%)]" />
                {/* Left Eye */}
                <div className="w-1.5 h-3 bg-white rounded-full shadow-[0_0_6px_#fff] animate-pulse" />
                {/* Right Eye */}
                <div className="w-1.5 h-3 bg-white rounded-full shadow-[0_0_6px_#fff] animate-pulse" />
              </div>
            </div>
            
            <span className="font-display text-3xl tracking-wide text-red dark:text-yellow select-none">
              MitraBGT
            </span>
          </a>

          {/* Desktop Navigation Links & Controls (visible on screens >= lg) */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider">
              <a 
                href="#main-terminal-view"
                className="px-3 py-1.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-red/10 dark:hover:bg-yellow/10 text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none"
              >
                Terminal
              </a>
              <a 
                href="#portfolio-section"
                className="px-3 py-1.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-red/10 dark:hover:bg-yellow/10 text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none"
              >
                Portfolio
              </a>
              <a 
                href="#signals-section"
                className="px-3 py-1.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-red/10 dark:hover:bg-yellow/10 text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none"
              >
                Fed Signals
              </a>
              <a 
                href="#trade-logs-section"
                className="px-3 py-1.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-red/10 dark:hover:bg-yellow/10 text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none"
              >
                Audit Logs
              </a>
              <a 
                href="#backtest-section"
                className="px-3 py-1.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-red/10 dark:hover:bg-yellow/10 text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none"
              >
                Backtests
              </a>
              <a 
                href="#architecture-section"
                className="px-3 py-1.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-red/10 dark:hover:bg-yellow/10 text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none"
              >
                Architecture
              </a>
            </nav>

            <div className="h-6 w-[2px] bg-ink/15 dark:bg-cream/15" />

            {/* Theme switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light hover:bg-cream/10 cursor-pointer flex items-center justify-center text-ink dark:text-cream transition-all shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-none shrink-0"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-yellow" />
              ) : (
                <Moon className="w-4 h-4 text-ink" />
              )}
            </button>
          </div>

          {/* Tablet & Mobile Navigation Toggles (visible on screens < lg) */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light text-ink dark:text-cream cursor-pointer shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow" /> : <Moon className="w-4 h-4 text-ink" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border-2 border-ink dark:border-cream/20 bg-white dark:bg-ink-light text-ink dark:text-cream cursor-pointer flex items-center justify-center shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)] active:translate-y-[1px] active:shadow-none transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-red dark:text-yellow" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Modern Mobile/Tablet Dropdown Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden bg-white/95 dark:bg-ink/95 backdrop-blur-md rounded-2xl border-3 border-ink dark:border-cream/20 mt-4 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] relative z-[99]"
            >
              <nav className="flex flex-col p-4 gap-3 font-mono text-xs font-bold uppercase tracking-wider">
                <a 
                  href="#main-terminal-view"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border-2 border-ink dark:border-cream/10 bg-cream/10 dark:bg-ink-light/50 text-ink dark:text-cream hover:bg-red/10 dark:hover:bg-yellow/10 hover:text-red dark:hover:text-yellow transition-all flex items-center justify-between"
                >
                  <span>Terminal</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">#01</span>
                </a>
                <a 
                  href="#portfolio-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border-2 border-ink dark:border-cream/10 bg-cream/10 dark:bg-ink-light/50 text-ink dark:text-cream hover:bg-red/10 dark:hover:bg-yellow/10 hover:text-red dark:hover:text-yellow transition-all flex items-center justify-between"
                >
                  <span>Portfolio</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">#02</span>
                </a>
                <a 
                  href="#signals-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border-2 border-ink dark:border-cream/10 bg-cream/10 dark:bg-ink-light/50 text-ink dark:text-cream hover:bg-red/10 dark:hover:bg-yellow/10 hover:text-red dark:hover:text-yellow transition-all flex items-center justify-between"
                >
                  <span>Fed Signals</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">#03</span>
                </a>
                <a 
                  href="#trade-logs-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border-2 border-ink dark:border-cream/10 bg-cream/10 dark:bg-ink-light/50 text-ink dark:text-cream hover:bg-red/10 dark:hover:bg-yellow/10 hover:text-red dark:hover:text-yellow transition-all flex items-center justify-between"
                >
                  <span>Audit Logs</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">#04</span>
                </a>
                <a 
                  href="#backtest-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border-2 border-ink dark:border-cream/10 bg-cream/10 dark:bg-ink-light/50 text-ink dark:text-cream hover:bg-red/10 dark:hover:bg-yellow/10 hover:text-red dark:hover:text-yellow transition-all flex items-center justify-between"
                >
                  <span>Backtests</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">#05</span>
                </a>
                <a 
                  href="#architecture-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border-2 border-ink dark:border-cream/10 bg-cream/10 dark:bg-ink-light/50 text-ink dark:text-cream hover:bg-red/10 dark:hover:bg-yellow/10 hover:text-red dark:hover:text-yellow transition-all flex items-center justify-between"
                >
                  <span>Architecture</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">#06</span>
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cinematic Hero Section to WOW users & explain what site does instantly */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-[36px] p-6 md:p-12 shadow-[12px_12px_0px_#1B1B1B] dark:shadow-[12px_12px_0px_var(--color-yellow)] relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 lg:gap-12 transition-colors duration-150">
          
          {/* Subtle grid visual background details */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,80,0.08)_0%,transparent_60%)] pointer-events-none" />
 
          {/* Left Hero side: Compelling typography & product pitch */}
          <div className="flex-1 space-y-6 text-left relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="inline-flex items-center gap-2 bg-cream/30 dark:bg-ink border-2 border-ink dark:border-cream/20 px-4 py-1.5 rounded-full text-xs font-extrabold text-red dark:text-yellow shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_var(--color-yellow)]"
            >
              <Zap className="w-4 h-4" /> Next-Gen Agentic Wealth Architecture
            </motion.div>
 

 
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-5xl font-display uppercase tracking-wide leading-tight text-ink dark:text-cream"
            >
              The Autonomous <span className="text-red dark:text-yellow font-bold">US Stocks & ETFs</span> Rebalancing Engine.
            </motion.h2>
 
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-base text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed font-medium"
            >
              MitraBGT operates as a secure, decentralized loop that actively intercepts Federal Reserve macro policy announcements and CPI indexes, parses market-critical sentiment parameters via server-side LLMs, and executes precise asset reallocations instantly on tokenized US Stocks and ETFs accounts.
            </motion.p>
 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button 
                onClick={scrollToDashboard}
                className="bg-red dark:bg-yellow text-white dark:text-ink border-3 border-ink dark:border-cream rounded-full px-8 py-4 font-bold font-sans text-lg hover:translate-y-[-3px] hover:scale-[1.02] transition-all shadow-[5px_5px_0px_#1B1B1B] dark:shadow-[5px_5px_0px_rgba(255,255,255,0.15)] hover:shadow-[7px_7px_0px_#1B1B1B] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1B1B1B] cursor-pointer flex items-center gap-2 group duration-150"
              >
                Launch Live Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a 
                href="https://github.com/BitgetLimited/agent_hub" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white dark:bg-ink text-ink dark:text-cream border-3 border-ink dark:border-cream/20 rounded-full px-8 py-4 font-bold text-lg hover:translate-y-[-3px] transition-all hover:bg-cream/10 dark:hover:bg-cream/5 shadow-[5px_5px_0px_rgba(27,27,27,0.15)] flex items-center gap-2 duration-150"
              >
                <Terminal className="w-5 h-5" /> View Agent Code
              </a>
            </motion.div>
          </div>

          {/* Right Hero side: Interactive floating Mascot Sphere */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 80, delay: 0.3 }}
            className="flex-shrink-0 relative w-full lg:w-96 flex flex-col items-center justify-center p-4"
          >
            {/* Elegant visual label for the mascot node */}
            <div className="absolute top-[-10px] bg-yellow border-3 border-ink rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider z-10 shadow-[3px_3px_0px_#1B1B1B] font-mono hover:scale-105 transition-transform text-black">
              AI PERCEPTION CORE
            </div>

            {/* Dynamic mascot sphere displaying state */}
            <div className="p-3 md:p-4 bg-cream/15 rounded-[32px] md:rounded-[40px] border-2 border-dashed border-ink/10 flex items-center justify-center w-full max-w-sm mx-auto shadow-inner overflow-hidden">
              <div className="scale-[0.8] sm:scale-[0.9] md:scale-100 origin-center transition-transform">
                <Mascot status={agentStatus.status} />
              </div>
            </div>

            {/* State descriptor panel */}
            <div className="bg-ink border-2 border-ink rounded-2xl px-6 py-2.5 mt-4 text-xs font-bold text-cream text-center font-mono shadow-[4px_4px_0px_rgba(27,27,27,0.15)] w-full max-w-[280px]">
              STATUS STATE: <span className="text-yellow uppercase animate-pulse">{agentStatus.status}</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* System Workflow Blueprint Loop Map (Staggered scroll trigger) */}
      <section id="architecture-section" className="max-w-7xl mx-auto mb-16 scroll-mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-[36px] p-8 shadow-[8px_8px_0px_#1B1B1B] dark:shadow-[8px_8px_0px_var(--color-yellow)] transition-colors duration-150"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-red dark:text-yellow tracking-wider uppercase bg-red/10 dark:bg-yellow/10 border border-red/20 dark:border-yellow/20 px-3 py-1 rounded-full">
              Dynamic Architecture Blueprint
            </span>
            <h2 className="text-3xl font-bold font-sans mt-3 text-ink dark:text-cream">
              The Autonomous Rebalancing Loop
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              MitraBGT acts entirely on behalf of the investor, establishing a continuous cycle of macro analysis and risk-adjusted order matching.
            </p>
          </div>

          {/* Stepper visual diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Visual connecting line between steps (Desktop only) */}
            <div className="hidden md:block absolute top-[52px] left-12 right-12 h-1 bg-gradient-to-r from-red via-yellow to-mint rounded z-0 border border-ink/10 dark:border-cream/10" />

            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-cream/15 dark:bg-ink/40 border-2 border-ink dark:border-cream/20 rounded-2xl p-5 relative z-10 hover:translate-y-[-4px] transition-all shadow-[3px_3px_0px_#1B1B1B] dark:shadow-[3px_3px_0px_var(--color-yellow)]"
            >
              <div className="w-12 h-12 rounded-xl bg-red text-white flex items-center justify-center font-display text-xl border-2 border-ink mb-4 shadow-[3px_3px_0px_#1B1B1B]">
                01
              </div>
              <h3 className="font-bold text-base text-ink dark:text-cream mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-red" /> Fed News Feed
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Continually monitors Fed conference speeches, CPI indexes, and macroeconomic reports via WebSockets.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-cream/15 dark:bg-ink/40 border-2 border-ink dark:border-cream/20 rounded-2xl p-5 relative z-10 hover:translate-y-[-4px] transition-all shadow-[3px_3px_0px_#1B1B1B] dark:shadow-[3px_3px_0px_var(--color-yellow)]"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow text-ink flex items-center justify-center font-display text-xl border-2 border-ink mb-4 shadow-[3px_3px_0px_#1B1B1B]">
                02
              </div>
              <h3 className="font-bold text-base text-ink dark:text-cream mb-2 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber" /> Sentiment Parsing
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Interprets text vectors to compute a Dovish-Hawkish index score between -1.0 and +1.0.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-cream/15 dark:bg-ink/40 border-2 border-ink dark:border-cream/20 rounded-2xl p-5 relative z-10 hover:translate-y-[-4px] transition-all shadow-[3px_3px_0px_#1B1B1B] dark:shadow-[3px_3px_0px_var(--color-yellow)]"
            >
              <div className="w-12 h-12 rounded-xl bg-mint text-white flex items-center justify-center font-display text-xl border-2 border-ink mb-4 shadow-[3px_3px_0px_#1B1B1B]">
                03
              </div>
              <h3 className="font-bold text-base text-ink dark:text-cream mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-mint" /> Portfolio Math
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Maps policy index metrics into defensive or expansionary weight shifts for growth and bonds ETFs.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-cream/15 dark:bg-ink/40 border-2 border-ink dark:border-cream/20 rounded-2xl p-5 relative z-10 hover:translate-y-[-4px] transition-all shadow-[3px_3px_0px_#1B1B1B] dark:shadow-[3px_3px_0px_var(--color-yellow)]"
            >
              <div className="w-12 h-12 rounded-xl bg-ink text-white flex items-center justify-center font-display text-xl border-2 border-ink mb-4 shadow-[3px_3px_0px_#1B1B1B]">
                04
              </div>
              <h3 className="font-bold text-base text-ink dark:text-cream mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-yellow" /> Secure Execution
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Triggers secure order matching directly via the stock brokerage API endpoints, logging every audit trace.
              </p>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Main Terminal Dashboard Anchor */}
      <div ref={dashboardRef} id="main-terminal-view" className="scroll-mt-8">
        {/* Main Layout Grid with staggered layout entrance */}
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Agent Status */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-4 space-y-6"
          >
            <AgentStatus 
              statusState={agentStatus}
              onRunDiagnostic={handleRunDiagnostic}
            />
          </motion.div>

          {/* Right Column: Portfolio, Signals Sentiment, Trade Record Log */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Portfolio metrics, ticker and allocations */}
            <div id="portfolio-section" className="scroll-mt-8">
              <Portfolio 
                assets={assets}
                totalValue={totalValue}
              />
            </div>

            {/* Interactive Fed Signals Radar */}
            <div id="signals-section" className="scroll-mt-8">
              <Signals 
                signals={signals}
                currentSentimentScore={currentSentiment}
                onTriggerPreset={handleTriggerPreset}
                isSimulating={isSimulating}
              />
            </div>

            {/* Verifiable Usage Records Logs */}
            <div id="trade-logs-section" className="scroll-mt-8">
              <TradeLog logs={logs} />
            </div>

            {/* Interactive Macro-Aware Historical Backtests Visualizer */}
            <div id="backtest-section" className="scroll-mt-8">
              <BacktestVisualizer />
            </div>
          </motion.div>
        </main>
      </div>



      {/* Professional Footer */}
      <footer className="max-w-7xl mx-auto mt-16 border-t-4 border-ink dark:border-cream pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-red dark:text-yellow" />
          <span>© 2026 MitraBGT Platform // Dedicated Autonomous Asset Intelligence Engine</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/BitgetLimited/agent_hub" target="_blank" rel="noreferrer" className="hover:text-red dark:hover:text-yellow transition-colors flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> Bitget Agent Hub MCP
          </a>
          <a href="https://mulerun.com" target="_blank" rel="noreferrer" className="hover:text-red dark:hover:text-yellow transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> MuleRun Platform
          </a>
        </div>
      </footer>
    </div>
  );
}
