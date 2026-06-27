import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart2, Calendar, ShieldCheck, Download, Code, Play, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface BacktestDataPoint {
  date: string;
  mitraValue: number;
  baselineValue: number;
}

interface BacktestRegime {
  id: string;
  name: string;
  period: string;
  description: string;
  fedTone: 'Hawkish' | 'Dovish' | 'Pivot';
  metrics: {
    mitraReturn: number;
    baselineReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    tradesExecuted: number;
  };
  chartData: BacktestDataPoint[];
  code: string;
}

const BACKTEST_REGIMES: BacktestRegime[] = [
  {
    id: 'regime-2022',
    name: '2022 Monetary Tightening Shock',
    period: 'Jan 2022 - Dec 2022',
    description: 'Federal Reserve aggressively hikes interest rates from 0.25% to 4.50% to combat 40-year high CPI inflation. High-beta equities suffer extreme drawdowns.',
    fedTone: 'Hawkish',
    metrics: {
      mitraReturn: -2.4,
      baselineReturn: -19.4,
      sharpeRatio: 1.42,
      maxDrawdown: -4.8,
      tradesExecuted: 14
    },
    chartData: [
      { date: 'Jan', mitraValue: 100, baselineValue: 100 },
      { date: 'Feb', mitraValue: 99.1, baselineValue: 94.7 },
      { date: 'Mar', mitraValue: 101.4, baselineValue: 97.2 },
      { date: 'Apr', mitraValue: 98.8, baselineValue: 88.6 },
      { date: 'May', mitraValue: 99.5, baselineValue: 88.5 },
      { date: 'Jun', mitraValue: 97.2, baselineValue: 81.1 },
      { date: 'Jul', mitraValue: 98.4, baselineValue: 88.5 },
      { date: 'Aug', mitraValue: 98.0, baselineValue: 84.8 },
      { date: 'Sep', mitraValue: 96.5, baselineValue: 76.9 },
      { date: 'Oct', mitraValue: 97.8, baselineValue: 83.1 },
      { date: 'Nov', mitraValue: 98.2, baselineValue: 87.7 },
      { date: 'Dec', mitraValue: 97.6, baselineValue: 80.6 }
    ],
    code: `import numpy as np
import pandas as pd

def backtest_mitra_bgt_tightening_2022(historical_df):
    """
    Backtest for 2022 Monetary Tightening Regime.
    Core Logic: Rotate heavily into Bond Proxies (TLT), Gold (GLD), and stable Cash (USDT) 
    when Fed signals are intensely Hawkish. Limit SPY/QQQ growth exposure.
    """
    portfolio_value = 100000.0
    allocations = {'TLT': 0.40, 'GLD': 0.30, 'USDT': 0.20, 'SPY': 0.10}
    cash = 0.0
    
    # Track daily returns
    portfolio_history = []
    baseline_history = [] # Buy & Hold S&P 500
    
    for date, row in historical_df.iterrows():
        # Read simulated Fed Signal score (e.g. -1.8 Hawkish)
        fed_score = row['fed_sentiment_score']
        
        # Trigger dynamic rebalancing when inflation (CPI) exceeds target
        if fed_score < -1.0 and row['cpi_yoy'] > 6.0:
            # Shift defensively: Liquify equities, maximize GLD & Yield
            allocations = {'TLT': 0.45, 'GLD': 0.35, 'USDT': 0.15, 'SPY': 0.05}
            
        # Standard mark-to-market calculations
        daily_return = sum(allocations[asset] * row[f'{asset}_return'] for asset in allocations)
        portfolio_value *= (1 + daily_return)
        portfolio_history.append(portfolio_value)
        
        # S&P baseline calculation
        baseline_history.append(100000.0 * (row['SPY_price'] / historical_df.iloc[0]['SPY_price']))
        
    return pd.DataFrame({
        'MitraBGT_NAV': portfolio_history,
        'SPY_Baseline_NAV': baseline_history
    })`
  },
  {
    id: 'regime-2024',
    name: '2024 Pivot & Rate Easing Cycle',
    period: 'Jan 2024 - Dec 2024',
    description: 'Federal Reserve pivots towards interest rate cuts as inflation cools toward the 2.0% target. Growth equities and interest-sensitive tokenized assets experience a powerful bull market.',
    fedTone: 'Dovish',
    metrics: {
      mitraReturn: 34.8,
      baselineReturn: 24.3,
      sharpeRatio: 2.18,
      maxDrawdown: -6.2,
      tradesExecuted: 19
    },
    chartData: [
      { date: 'Jan', mitraValue: 100, baselineValue: 100 },
      { date: 'Feb', mitraValue: 104.5, baselineValue: 105.1 },
      { date: 'Mar', mitraValue: 108.2, baselineValue: 108.3 },
      { date: 'Apr', mitraValue: 105.6, baselineValue: 103.8 },
      { date: 'May', mitraValue: 112.4, baselineValue: 108.8 },
      { date: 'Jun', mitraValue: 116.8, baselineValue: 112.6 },
      { date: 'Jul', mitraValue: 118.9, baselineValue: 113.9 },
      { date: 'Aug', mitraValue: 121.2, baselineValue: 116.5 },
      { date: 'Sep', mitraValue: 125.7, baselineValue: 118.8 },
      { date: 'Oct', mitraValue: 128.0, baselineValue: 117.7 },
      { date: 'Nov', mitraValue: 132.8, baselineValue: 124.5 },
      { date: 'Dec', mitraValue: 134.8, baselineValue: 124.3 }
    ],
    code: `import numpy as np
import pandas as pd

def backtest_mitra_bgt_pivot_2024(historical_df):
    """
    Backtest for 2024 Easing & Easing Cycle.
    Core Logic: Allocate maximum weighting to Tech Growth equities (QQQ, SPY)
    and tokenized RWA assets as Fed Sentiment Score enters highly Dovish territory (+1.5).
    """
    portfolio_value = 100000.0
    # Dynamic allocation shifts aggressively into growth & equities
    allocations = {'SPY': 0.40, 'QQQ': 0.40, 'GLD': 0.10, 'USDT': 0.10}
    
    portfolio_history = []
    baseline_history = []
    
    for date, row in historical_df.iterrows():
        fed_score = row['fed_sentiment_score']
        
        # If Fed indicates interest rate cuts (Dovish sentiment > +0.5)
        if fed_score > 0.5:
            # Lever up into high beta equities & interest-rate beneficiaries
            allocations = {'SPY': 0.45, 'QQQ': 0.45, 'GLD': 0.05, 'USDT': 0.05}
            
        daily_return = sum(allocations[asset] * row[f'{asset}_return'] for asset in allocations)
        portfolio_value *= (1 + daily_return)
        portfolio_history.append(portfolio_value)
        baseline_history.append(100000.0 * (row['SPY_price'] / historical_df.iloc[0]['SPY_price']))
        
    return pd.DataFrame({
        'MitraBGT_NAV': portfolio_history,
        'SPY_Baseline_NAV': baseline_history
    })`
  },
  {
    id: 'regime-2020',
    name: '2020 Covid Liquidity Flood',
    period: 'Mar 2020 - Dec 2020',
    description: 'Global emergency central bank policy floods markets with trillions in liquidity (QE). Real interest rates plummet, triggering aggressive multi-asset rally.',
    fedTone: 'Dovish',
    metrics: {
      mitraReturn: 41.2,
      baselineReturn: 21.6,
      sharpeRatio: 2.45,
      maxDrawdown: -3.5,
      tradesExecuted: 12
    },
    chartData: [
      { date: 'Mar', mitraValue: 100, baselineValue: 100 },
      { date: 'Apr', mitraValue: 108.5, baselineValue: 112.7 },
      { date: 'May', mitraValue: 114.2, baselineValue: 118.1 },
      { date: 'Jun', mitraValue: 118.6, baselineValue: 120.3 },
      { date: 'Jul', mitraValue: 123.5, baselineValue: 126.9 },
      { date: 'Aug', mitraValue: 130.4, baselineValue: 135.8 },
      { date: 'Sep', mitraValue: 128.2, baselineValue: 130.5 },
      { date: 'Oct', mitraValue: 129.5, baselineValue: 127.7 },
      { date: 'Nov', mitraValue: 136.2, baselineValue: 141.4 },
      { date: 'Dec', mitraValue: 141.2, baselineValue: 146.5 }
    ],
    code: `def backtest_mitra_bgt_bazooka_2020(historical_df):
    """
    Backtest for 2020 Liquidity Infusion.
    Core Logic: Capitalize on emergency zero-interest rate policies.
    Maximize high-beta equity index weightings (QQQ/SPY) and allocate to Gold (GLD) 
    as inflation hedge during massive monetary expansion.
    """
    portfolio_value = 100000.0
    allocations = {'SPY': 0.35, 'QQQ': 0.45, 'GLD': 0.15, 'USDT': 0.05}
    
    portfolio_history = []
    baseline_history = []
    
    for date, row in historical_df.iterrows():
        # High-magnitude dovish regime
        daily_return = sum(allocations[asset] * row[f'{asset}_return'] for asset in allocations)
        portfolio_value *= (1 + daily_return)
        portfolio_history.append(portfolio_value)
        baseline_history.append(100000.0 * (row['SPY_price'] / historical_df.iloc[0]['SPY_price']))
        
    return pd.DataFrame({
        'MitraBGT_NAV': portfolio_history,
        'SPY_Baseline_NAV': baseline_history
    })`
  }
];

export default function BacktestVisualizer() {
  const [selectedRegimeId, setSelectedRegimeId] = useState<string>('regime-2022');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const selectedRegime = BACKTEST_REGIMES.find(r => r.id === selectedRegimeId) || BACKTEST_REGIMES[0];

  // Helper to generate SVG polyline points
  const getSvgPoints = (data: BacktestDataPoint[], key: 'mitraValue' | 'baselineValue', width: number, height: number) => {
    const values = data.map(d => d[key]);
    const maxVal = Math.max(...data.map(d => Math.max(d.mitraValue, d.baselineValue)));
    const minVal = Math.min(...data.map(d => Math.min(d.mitraValue, d.baselineValue)));
    const range = maxVal - minVal || 1;

    return data.map((d, index) => {
      const x = (index / (data.length - 1)) * width;
      // Invert Y because SVG coordinates start from top
      const y = height - ((d[key] - minVal) / range) * (height - 40) - 20;
      return `${x},${y}`;
    }).join(' ');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedRegime.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const maxVal = Math.max(...selectedRegime.chartData.map(d => Math.max(d.mitraValue, d.baselineValue)));
  const minVal = Math.min(...selectedRegime.chartData.map(d => Math.min(d.mitraValue, d.baselineValue)));

  return (
    <div className="bg-white dark:bg-ink border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b-2 border-ink dark:border-cream/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow border-2 border-ink p-1.5 rounded-xl shadow-[2px_2px_0px_#1B1B1B]">
              <BarChart2 className="w-5 h-5 text-ink" />
            </div>
            <h2 className="text-xl font-sans font-bold text-ink dark:text-cream">Historical Backtest Studio</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            Rebalancing simulations across major Fed monetary regimes compared against a passive SPY buy-and-hold strategy.
          </p>
        </div>

        {/* Regime Tabs Selector */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {BACKTEST_REGIMES.map((regime) => (
            <button
              key={regime.id}
              onClick={() => setSelectedRegimeId(regime.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border-2 cursor-pointer transition-all ${
                selectedRegimeId === regime.id
                  ? 'bg-yellow text-ink border-ink shadow-[2px_2px_0px_#1B1B1B] translate-y-[-1px]'
                  : 'bg-white dark:bg-ink-light text-ink dark:text-cream border-ink dark:border-cream/20 shadow-[2px_2px_0px_rgba(27,27,27,0.15)] active:translate-y-[1px] hover:bg-gray-100 dark:hover:bg-cream/5'
              }`}
            >
              {regime.name.split(' ')[0]} {regime.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Macro Context & Key Metrics */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="space-y-3 bg-cream/10 dark:bg-ink-light p-4 rounded-2xl border-2 border-ink dark:border-cream/10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono font-bold uppercase">{selectedRegime.period}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border border-ink dark:border-none font-bold ${
                selectedRegime.fedTone === 'Hawkish' ? 'bg-red text-white' : 'bg-mint text-ink'
              }`}>
                {selectedRegime.fedTone} Cycle
              </span>
            </div>
            <h3 className="font-sans font-bold text-base text-ink dark:text-cream">{selectedRegime.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {selectedRegime.description}
            </p>
          </div>

          {/* Core Quant Metrics Board */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-ink-light border-2 border-ink dark:border-cream/10 rounded-2xl p-3 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block">MitraBGT Return</span>
              <span className={`text-xl font-display leading-none block mt-1 ${
                selectedRegime.metrics.mitraReturn >= 0 ? 'text-mint' : 'text-red'
              }`}>
                {selectedRegime.metrics.mitraReturn >= 0 ? '+' : ''}{selectedRegime.metrics.mitraReturn}%
              </span>
            </div>

            <div className="bg-white dark:bg-ink-light border-2 border-ink dark:border-cream/10 rounded-2xl p-3 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block">SPY Buy & Hold</span>
              <span className={`text-xl font-display leading-none block mt-1 ${
                selectedRegime.metrics.baselineReturn >= 0 ? 'text-mint' : 'text-red'
              }`}>
                {selectedRegime.metrics.baselineReturn >= 0 ? '+' : ''}{selectedRegime.metrics.baselineReturn}%
              </span>
            </div>

            <div className="bg-white dark:bg-ink-light border-2 border-ink dark:border-cream/10 rounded-2xl p-3 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block">Max Drawdown</span>
              <span className="text-xl font-display text-red leading-none block mt-1">
                {selectedRegime.metrics.maxDrawdown}%
              </span>
            </div>

            <div className="bg-white dark:bg-ink-light border-2 border-ink dark:border-cream/10 rounded-2xl p-3 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono block">Sharpe Ratio</span>
              <span className="text-xl font-display text-yellow leading-none block mt-1">
                {selectedRegime.metrics.sharpeRatio}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex-1 py-2 px-3 bg-white dark:bg-ink-light border-2 border-ink dark:border-cream/20 hover:bg-gray-100 dark:hover:bg-cream/5 rounded-xl font-mono text-xs font-bold text-ink dark:text-cream flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1B1B1B] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.05)] active:translate-y-[1px] active:shadow-none"
            >
              <Code className="w-3.5 h-3.5 text-yellow" />
              {showCode ? 'Hide Python Engine' : 'View Python Engine'}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic SVG Chart Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="bg-cream/5 dark:bg-ink-light/50 border-2 border-ink dark:border-cream/10 rounded-2xl p-4 flex flex-col justify-between h-[280px] relative overflow-hidden">
            
            {/* SVG Grid Baseline lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-5">
              <div className="border-b border-ink dark:border-cream w-full"></div>
              <div className="border-b border-ink dark:border-cream w-full"></div>
              <div className="border-b border-ink dark:border-cream w-full"></div>
              <div className="border-b border-ink dark:border-cream w-full"></div>
            </div>

            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-yellow rounded-full"></span>
                  <span className="text-[10px] font-mono text-ink dark:text-cream font-bold">MitraBGT Strategy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 border-t-2 border-dashed border-gray-400 dark:border-gray-500"></span>
                  <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-bold">SPY Buy & Hold Baseline</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-400 bg-white dark:bg-ink border border-ink/10 dark:border-cream/10 px-1.5 py-0.5 rounded">
                Simulated Equity Curve (NAV normalized to 100)
              </span>
            </div>

            {/* Render Responsive Vector Polyline */}
            <div className="w-full h-[180px] mt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  {/* Underlay Gradients */}
                  <linearGradient id="mitra-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-yellow)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--color-yellow)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* S&P Baseline path (dashed gray) */}
                <polyline
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  points={getSvgPoints(selectedRegime.chartData, 'baselineValue', 500, 180)}
                />

                {/* MitraBGT strategy underlay area */}
                <path
                  fill="url(#mitra-gradient)"
                  d={`M 0,180 L ${getSvgPoints(selectedRegime.chartData, 'mitraValue', 500, 180)} L 500,180 Z`}
                />

                {/* MitraBGT strategy path (yellow) */}
                <polyline
                  fill="none"
                  stroke="var(--color-yellow)"
                  strokeWidth="3.5"
                  points={getSvgPoints(selectedRegime.chartData, 'mitraValue', 500, 180)}
                />

                {/* Plot Data points markers */}
                {selectedRegime.chartData.map((d, index) => {
                  const x = (index / (selectedRegime.chartData.length - 1)) * 500;
                  const mitraY = 180 - ((d.mitraValue - minVal) / (maxVal - minVal || 1)) * 140 - 20;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={mitraY}
                      r="4"
                      className="fill-yellow stroke-ink dark:stroke-cream cursor-pointer stroke-2"
                      title={`${d.date}: ${d.mitraValue}`}
                    />
                  );
                })}
              </svg>
            </div>

            {/* X Axis Dates labels */}
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 dark:text-gray-500 px-1 mt-1 border-t border-ink/5 dark:border-cream/5 pt-1.5">
              {selectedRegime.chartData.map((d, index) => (
                <span key={index}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel Drawer */}
      {showCode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 border-2 border-ink dark:border-cream/10 rounded-2xl overflow-hidden bg-gray-50 dark:bg-ink-light"
        >
          <div className="bg-gray-100 dark:bg-ink-light border-b-2 border-ink dark:border-cream/10 px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink dark:text-cream">
              <ShieldCheck className="w-4 h-4 text-mint" />
              <span>Backtest Script (Python Pandas/Quant Engine)</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 bg-white dark:bg-ink border border-ink dark:border-cream/20 hover:bg-gray-100 dark:hover:bg-cream/10 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors"
            >
              {isCopied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 text-[10px] md:text-xs font-mono text-ink dark:text-cream overflow-x-auto leading-relaxed bg-gray-50 dark:bg-ink-light/50 max-h-[300px]">
            <code>{selectedRegime.code}</code>
          </pre>
        </motion.div>
      )}
    </div>
  );
}
