import { useState, useEffect } from 'react';
import { FedSignal, SimulationPreset } from '../types';
import { SIMULATION_PRESETS } from '../data/mockData';
import { AlertCircle, ArrowUpRight, Award, MessageSquare, ShieldAlert, Sparkles, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface SignalsProps {
  signals: FedSignal[];
  currentSentimentScore: number; // -1 to +1
  onTriggerPreset: (preset: SimulationPreset) => void;
  isSimulating: boolean;
}

export default function Signals({ signals, currentSentimentScore, onTriggerPreset, isSimulating }: SignalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sentimentFilter]);

  // Translate score to text/colors
  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return { label: 'DOVISH (PRO-GROWTH)', color: 'bg-mint text-white' };
    if (score < -0.3) return { label: 'HAWKISH (DEFENSIVE)', color: 'bg-red text-white' };
    return { label: 'NEUTRAL (BALANCED)', color: 'bg-yellow text-ink' };
  };

  const sentiment = getSentimentLabel(currentSentimentScore);

  const filteredSignals = signals.filter(sig => {
    const matchesSearch = 
      sig.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.interpretation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSentiment = 
      sentimentFilter === 'ALL' || 
      sig.sentiment.toLowerCase() === sentimentFilter.toLowerCase();

    return matchesSearch && matchesSentiment;
  });

  const totalPages = Math.ceil(filteredSignals.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSignals = filteredSignals.slice(startIndex, startIndex + itemsPerPage);

  // Map sentiment to a slider position percentage (from -1 [0%] to +1 [100%])
  const sliderPercent = ((currentSentimentScore + 1) / 2) * 100;

  // Append a specialized compliance test preset designed to intentionally trigger the verification safety checks
  const ALL_PRESETS: SimulationPreset[] = [
    ...SIMULATION_PRESETS,
    {
      name: 'Hawkish Buy Violation (Test)',
      source: 'FED Emergency Alert',
      headline: 'Fed signals rate hikes back on table due to extreme supply shocks',
      sentiment: 'hawkish',
      score: -0.95,
      interpretation: 'Extremely hawkish stance. Real interest rates must rise immediately. Buying QQQ under this environment violates the fundamental Macro Index alignment rule.',
      thought: 'HACKATHON AUDITING TEST: Attempting to buy growth asset QQQ under a highly hawkish environment to test the Logic Validation Safety Intercept. Standby for abort.',
      recommendedAllocation: { QQQ: 55, SPY: 15, TLT: 15, GLD: 10, USDT: 5 } // QQQ is currently 38.4%, so setting QQQ to 55% will trigger a BUY of QQQ under Hawkish conditions!
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Simulation Event Panel (Crucial for Hackathon runnability) */}
      <div 
        id="simulator-panel"
        className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] text-ink dark:text-cream transition-colors duration-150"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-red dark:text-yellow" />
          <h2 className="text-xl font-display uppercase text-red dark:text-yellow outline-text tracking-wide">
            Interactive Fed Simulator
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
          Trigger real-time simulated Fed announcements and macroeconomic events. Watch the MitraBGT autonomous agent process the news, update its macro-sentiment indexes, and immediately rebalance the portfolio's target weights.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_PRESETS.map((preset) => {
            const presetSentiment = getSentimentLabel(preset.score);
            const isTestPreset = preset.name.includes('(Test)');
            return (
              <button
                key={preset.name}
                id={`trigger-btn-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onTriggerPreset(preset)}
                disabled={isSimulating}
                className={`group border-3 border-ink dark:border-cream/20 rounded-2xl p-4 text-left bg-cream/15 dark:bg-ink/35 hover:bg-cream/40 dark:hover:bg-cream/5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1B1B1B] dark:hover:shadow-[4px_4px_0px_var(--color-yellow)] active:translate-y-[0px] active:shadow-none duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isTestPreset ? 'border-amber/85 bg-amber/5' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-500 dark:text-gray-400">
                      {preset.source}
                    </span>
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border border-ink dark:border-cream/20 ${presetSentiment.color}`}>
                      {preset.sentiment.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-ink dark:text-cream leading-snug group-hover:text-red dark:group-hover:text-yellow transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                    {preset.headline}
                  </p>
                </div>
                <div className="mt-3.5 pt-2 border-t border-dashed border-ink/10 dark:border-cream/10 flex items-center justify-between text-xs font-bold text-red dark:text-yellow">
                  <span>{isTestPreset ? 'Test Intercept' : 'Trigger Signals Agent'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Fed Sentiment Score Meter */}
      <div 
        id="sentiment-score-meter"
        className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] text-ink dark:text-cream transition-colors duration-150"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-extrabold text-red dark:text-yellow tracking-wider uppercase">
              Macro Index Perception
            </span>
            <h2 className="text-2xl font-bold font-sans">Fed Sentiment Radar</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">CURRENT STATUS:</span>
            <span className={`font-bold text-xs px-3 py-1 rounded-full border-2 border-ink dark:border-cream ${sentiment.color}`}>
              {sentiment.label}
            </span>
          </div>
        </div>

        {/* Gauge slider visual */}
        <div className="relative pt-6 pb-2 px-4 bg-cream/20 dark:bg-ink/40 border-3 border-ink dark:border-cream rounded-2xl">
          <div className="flex justify-between text-xs font-bold font-mono text-ink dark:text-cream mb-2">
            <span className="text-red dark:text-red">HAWKISH (Tightening)</span>
            <span className="text-gray-500 dark:text-gray-400">NEUTRAL</span>
            <span className="text-mint">DOVISH (Easing)</span>
          </div>

          <div className="h-6 bg-gradient-to-r from-red via-yellow to-mint rounded-full border-3 border-ink dark:border-cream/35 relative overflow-visible">
            {/* Pointer Pin */}
            <div 
              style={{ left: `${sliderPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-ink border-3 border-ink dark:border-cream rounded-full flex items-center justify-center shadow-md transition-all duration-700 ease-out z-10"
            >
              <div className="w-3 h-3 rounded-full bg-red dark:bg-yellow animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 font-mono mt-1 px-1">
            <span>-1.0</span>
            <span>-0.5</span>
            <span>0.0</span>
            <span>+0.5</span>
            <span>+1.0</span>
          </div>
        </div>

        {/* Informational bullet */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 bg-cream/15 dark:bg-ink/30 p-3 rounded-xl border border-ink/10 dark:border-cream/10">
          <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <p className="leading-normal">
            <strong>Strategy Engine Rule:</strong> High Dovish sentiment triggers higher weight allocations for risk-on growth equities (QQQ/SPY). High Hawkish readings rotate capital immediately into Cash (USDT) or bonds (TLT) to protect capital.
          </p>
        </div>
      </div>

      {/* Signals Feed Log */}
      <div 
        id="signals-feed-log"
        className="bg-white dark:bg-ink/90 border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] transition-colors duration-150"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-dashed border-ink/10 dark:border-cream/10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red" />
            <h2 className="text-lg font-bold text-ink dark:text-cream">
              Verifiable Fed Intelligence Feed
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 bg-cream dark:bg-ink px-2 py-0.5 border border-ink/20 dark:border-cream/20 rounded self-start md:self-auto">
            {filteredSignals.length} of {signals.length} Captured
          </span>
        </div>

        {/* Signals Filtering Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search headline, text or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-cream/10 dark:bg-cream/5 border-2 border-ink dark:border-cream/20 rounded-xl text-xs font-sans text-ink dark:text-cream placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red dark:focus:ring-yellow"
            />
          </div>
          
          {/* Sentiment Filter */}
          <div className="flex items-center gap-1.5 border-2 border-ink dark:border-cream/20 rounded-xl p-1 bg-cream/10 dark:bg-cream/5 shrink-0">
            {['ALL', 'DOVISH', 'HAWKISH', 'NEUTRAL'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSentimentFilter(mode)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                  sentimentFilter === mode 
                    ? 'bg-red dark:bg-yellow text-white dark:text-ink' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-cream'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Render Signals Feed */}
        {paginatedSignals.length === 0 ? (
          <div className="text-center py-8 bg-cream/5 border-2 border-dashed border-ink/15 dark:border-cream/15 rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 font-bold text-xs">No matching intelligence feeds found.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSentimentFilter('ALL'); }}
              className="mt-2 text-red dark:text-yellow text-xs font-bold underline cursor-pointer animate-pulse"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {paginatedSignals.map((sig, index) => {
              const sigStyle = getSentimentLabel(sig.score);
              return (
                <div
                  key={`${sig.id}-${index}`}
                  className="border-2 border-ink dark:border-cream/20 rounded-2xl p-4 bg-cream/10 dark:bg-cream/5 hover:bg-cream/20 dark:hover:bg-cream/10 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-cream/40 dark:bg-ink px-2 py-0.5 rounded border border-ink/10 dark:border-cream/10 font-mono">
                        {sig.source}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(sig.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-ink dark:border-cream ${sigStyle.color}`}>
                      {sig.sentiment}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-ink dark:text-cream mb-1.5">{sig.headline}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{sig.interpretation}</p>

                  {/* Target Allocation recommendations */}
                  <div className="pt-2 border-t border-dashed border-ink/10 dark:border-cream/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Agent Action Target Weights
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(sig.recommendedAllocation).map(([asset, weight]) => (
                        <div 
                          key={asset}
                          className="text-xs bg-white dark:bg-ink border border-ink/20 dark:border-cream/20 px-2 py-1 rounded font-mono font-bold flex items-center gap-1 shadow-sm text-ink dark:text-cream"
                        >
                          <span className="text-gray-500 dark:text-gray-400">{asset}:</span>
                          <span className="text-red dark:text-yellow">{weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Signals Pagination Controls */}
        {filteredSignals.length > itemsPerPage && (
          <div className="mt-5 pt-4 border-t border-dashed border-ink/10 dark:border-cream/10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 border-2 border-ink dark:border-cream/25 rounded-lg bg-white dark:bg-ink hover:bg-cream/10 text-ink dark:text-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 border-2 border-ink dark:border-cream/25 rounded-lg bg-white dark:bg-ink hover:bg-cream/10 text-ink dark:text-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
