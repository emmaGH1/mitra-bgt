import { FedSignal, PortfolioAsset, UsageRecord, SimulationPreset } from '../types';

export const INITIAL_ASSETS: PortfolioAsset[] = [
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq 100 ETF)',
    price: 480.00,
    quantity: 160,
    allocation: 38.4,
    targetAllocation: 40.0,
    change24h: 1.25,
    value: 76800,
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust (S&P 500 Index)',
    price: 550.00,
    quantity: 100,
    allocation: 27.5,
    targetAllocation: 25.0,
    change24h: 0.85,
    value: 55000,
  },
  {
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF (RWA)',
    price: 95.00,
    quantity: 420,
    allocation: 19.95,
    targetAllocation: 20.0,
    change24h: -0.35,
    value: 39900,
  },
  {
    symbol: 'GLD',
    name: 'SPDR Gold Shares ETF (Tokenized Gold RWA)',
    price: 220.00,
    quantity: 90,
    allocation: 9.9,
    targetAllocation: 10.0,
    change24h: 0.45,
    value: 19800,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (Stablecoin Capital Reserve)',
    price: 1.00,
    quantity: 8500,
    allocation: 4.25,
    targetAllocation: 5.0,
    change24h: 0.0,
    value: 8500,
  },
];

export const INITIAL_SIGNALS: FedSignal[] = [
  {
    id: 'sig-1',
    timestamp: '2026-06-26T14:00:00Z',
    source: 'FOMC Press Conference',
    headline: 'Powell signals rate cuts are back on the table for Q3',
    sentiment: 'dovish',
    score: 0.75,
    interpretation: 'Chairman Powell acknowledged cooling inflation and moderate job growth, stating the FOMC is "growing more confident" that rates can be dialed back. This is a highly bullish catalyst for long-duration bonds (TLT) and interest-rate-sensitive growth equities (QQQ).',
    recommendedAllocation: { QQQ: 45, SPY: 20, TLT: 20, GLD: 10, USDT: 5 },
  },
  {
    id: 'sig-2',
    timestamp: '2026-06-18T12:30:00Z',
    source: 'CPI Inflation Report',
    headline: 'Core CPI dips to 3.1%, beating consensus of 3.3%',
    sentiment: 'dovish',
    score: 0.60,
    interpretation: 'A downward surprise in consumer price indices validates the cooling inflation thesis, lowering the likelihood of further rate hikes and opening a wider runway for immediate Fed policy loosening.',
    recommendedAllocation: { QQQ: 42, SPY: 18, TLT: 25, GLD: 10, USDT: 5 },
  },
  {
    id: 'sig-3',
    timestamp: '2026-06-11T18:00:00Z',
    source: 'Fed Minutes release',
    headline: 'FOMC members voice concern over persistent services inflation',
    sentiment: 'hawkish',
    score: -0.45,
    interpretation: 'Minutes show that while goods inflation continues to fall, the stickiness of shelter and service costs makes a rate cut in the near term premature. The committee remains heavily data-dependent.',
    recommendedAllocation: { QQQ: 25, SPY: 10, TLT: 40, GLD: 15, USDT: 10 },
  },
];

export const INITIAL_LOGS: UsageRecord[] = [
  {
    id: 'tx-1001',
    timestamp: '2026-06-26T14:15:22Z',
    asset: 'QQQ',
    action: 'BUY',
    price: 475.00,
    quantity: 20,
    value: 9500.00,
    rationale: 'Rebalancing: Dovish FOMC statement by Powell increased risk appetite. Target allocation for growth asset QQQ raised to 40%. Traded with Bitget Agent Hub API.',
    txHash: '0x3a9b...7c41 (Verifiable via Bitget API Log ID: bg-mcp-9201)'
  },
  {
    id: 'tx-1002',
    timestamp: '2026-06-26T14:15:25Z',
    asset: 'TLT',
    action: 'SELL',
    price: 95.00,
    quantity: 150,
    value: 14250.00,
    rationale: 'Rebalancing: Rotating defensive bond capital (TLT) into high-beta growth equities (QQQ) during dovish interest rate regime to capture upside momentum.',
    txHash: '0x1c8d...9f3e (Verifiable via Bitget API Log ID: bg-mcp-9202)'
  },
  {
    id: 'tx-1003',
    timestamp: '2026-06-11T18:10:05Z',
    asset: 'USDT',
    action: 'BUY',
    price: 1.00,
    quantity: 8500,
    value: 8500.00,
    rationale: 'Rebalancing: Hawkish Fed Minutes triggered asset rotation. Reduced equity and bond exposure, raising collateral reserves (USDT) to 15% to hedge rate risk.',
    txHash: '0xf92a...1108 (Verifiable via Bitget API Log ID: bg-mcp-7840)'
  },
];

// Presets that can be triggered by the user in the interactive dashboard demo

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    name: 'Rate Cut Announcement',
    source: 'FOMC Decision Statement',
    headline: 'Fed announces surprise 25bps rate cut to support labor market',
    sentiment: 'dovish',
    score: 0.90,
    interpretation: 'The Fed voted 11-1 to reduce the federal funds rate by 25 basis points, citing a cooling labor market and steady progress toward the 2% inflation target. This signals an official pivot, which is a major tailwind for growth equities (QQQ) and supportive factor for bonds (TLT).',
    thought: 'CRITICAL EVENT DETECTED: FOMC pivot is official. Rotating aggressively. Buying QQQ/SPY to lock in high expansion metrics, optimizing TLT weight, and reducing USDT cash reserves to a bare minimum. Placing trade orders via Bitget Agent Hub.',
    recommendedAllocation: { QQQ: 48, SPY: 22, TLT: 20, GLD: 8, USDT: 2 }
  },
  {
    name: 'Hawkish Inflation Shock',
    source: 'CPI Data Release',
    headline: 'May Core CPI jumps 0.4% MoM, shattering 0.2% estimate',
    sentiment: 'hawkish',
    score: -0.85,
    interpretation: 'CPI inflation re-accelerated sharply due to rising energy costs and persistent rent index gains. This effectively kills the possibility of a rate cut for the next two meetings and raises the risk of a "higher for longer" stance, which is bearish for high-beta growth stocks (QQQ) and gold (GLD).',
    thought: 'HAWKISH THREAT DETECTED: CPI hot shock. Protecting capital. Rebalancing to a defensive posture. Liquidating growth exposure: selling QQQ/SPY in favor of TLT stability and cash (USDT) reserves. Simulating order routing via Bitget Agent Hub MCP Server.',
    recommendedAllocation: { QQQ: 15, SPY: 5, TLT: 45, GLD: 20, USDT: 15 }
  },
  {
    name: 'Robust Gold Play',
    source: 'Geopolitical & Fed Speech',
    headline: 'Fed members suggest inflation targets could be "flexible"',
    sentiment: 'dovish',
    score: 0.40,
    interpretation: 'Two regional Fed presidents indicated that anchoring inflation close to 2.5% in the medium term might be acceptable to avoid deep recessions. Softening target credibility debases real fiat yield, acting as a direct catalyst for Gold (GLD).',
    thought: 'STRATEGY ADJUSTMENT: Inflation tolerance rises. Increasing Gold (GLD) allocations as a hedge. Shifting 5% of QQQ and SPY into GLD while keeping a neutral-dovish weight on core assets. Initiating trades.',
    recommendedAllocation: { QQQ: 35, SPY: 15, TLT: 25, GLD: 20, USDT: 5 }
  }
];
