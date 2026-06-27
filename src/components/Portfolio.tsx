import { useState, useEffect } from 'react';
import { PortfolioAsset } from '../types';
import { Coins, HelpCircle, RefreshCw, TrendingUp, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioProps {
  assets: PortfolioAsset[];
  totalValue: number;
}

export default function Portfolio({ assets, totalValue }: PortfolioProps) {
  // Calculate daily profit or change mock
  const mockDailyProfit = 3140.25;
  const mockDailyPercent = 1.74;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DRIFT' | 'HIGH_VALUE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMode]);

  // Filter logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const deviation = Math.abs(asset.allocation - asset.targetAllocation);
    
    if (filterMode === 'DRIFT') {
      return matchesSearch && deviation > 1.0; // Show assets with high drift deviation (> 1.0%)
    }
    if (filterMode === 'HIGH_VALUE') {
      return matchesSearch && asset.value > 30000; // Show assets with value > $30k
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Value Hero Card */}
      <div 
        id="portfolio-hero-card"
        className="bg-maroon dark:bg-maroon border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] text-cream relative overflow-hidden transition-colors duration-150"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-yellow tracking-wider uppercase">
                Active Capital Under Management
              </span>
              <h1 className="text-xl font-bold font-sans mt-0.5 text-cream">MitraBGT AI Vault</h1>
            </div>
            <span className="bg-cream/10 border border-cream/20 text-xs px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-yellow animate-bounce" /> US Stocks & ETFs
            </span>
          </div>

          <div className="mt-4 mb-2">
            <span className="text-xs text-yellow/70 uppercase font-mono font-bold">Total Portfolio Net Asset Value</span>
            <div className="font-display text-5xl md:text-6xl text-yellow outline-text-heavy tracking-wide mt-1 select-none">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-white text-mint font-bold text-sm px-3.5 py-1 rounded-full border-2 border-ink shadow-[2px_2px_0px_#1B1B1B]">
              ▲ +${mockDailyProfit.toLocaleString('en-US')} (+{mockDailyPercent}%) today
            </span>
          </div>
        </div>

        {/* Decorative ambient visual background noise */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-[200px] font-display pointer-events-none select-none">
          $
        </div>
      </div>

      {/* Ticker Cards Horizontal Row / Grid */}
      <div 
        id="asset-ticker-grid"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {assets.map((asset, index) => {
          const isUp = asset.change24h >= 0;
          const rotationClass = index % 2 === 0 ? 'rotate-[-1.5deg]' : 'rotate-[1.5deg]';
          return (
            <div
              key={asset.symbol}
              className={`bg-white dark:bg-ink-light border-3 border-ink dark:border-cream/20 rounded-2xl p-3.5 shadow-[4px_4px_0px_rgba(27,27,27,0.15)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] flex flex-col justify-between hover:rotate-0 hover:translate-y-[-2px] transition-all duration-150 ${rotationClass}`}
            >
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono font-bold block truncate">{asset.name.split(' (')[0]}</span>
                <div className="font-display text-2xl text-ink dark:text-cream leading-tight tracking-wide">{asset.symbol}</div>
              </div>
              <div className="mt-3">
                <div className="font-bold text-lg text-ink dark:text-cream">
                  ${asset.price.toFixed(2)}
                </div>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-ink dark:border-cream mt-1.5 ${isUp ? 'bg-mint/15 text-mint' : 'bg-red/10 text-maroon dark:text-red'}`}>
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{asset.change24h}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target vs Actual Allocation Breakdown */}
      <div 
        id="allocation-comparison-card"
        className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] transition-colors duration-150"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-xs font-bold text-red dark:text-yellow tracking-wider uppercase">
              Portfolio Diagnostics
            </span>
            <h2 className="text-xl font-bold text-ink dark:text-cream">Dynamic Allocation Deviation</h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-red dark:text-yellow animate-spin" style={{ animationDuration: '6s' }} /> Live Drift Re-matching
          </span>
        </div>

        {/* Beautiful visual comparison block */}
        <div className="space-y-4">
          {assets.map((asset) => {
            // Difference between actual and target
            const deviation = asset.allocation - asset.targetAllocation;
            const absDeviation = Math.abs(deviation);
            const deviationLabel = deviation === 0 
              ? 'Balanced' 
              : `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}% Drift`;
            
            return (
              <div 
                key={asset.symbol}
                className="border-2 border-ink dark:border-cream/15 rounded-2xl p-4 bg-cream/10 dark:bg-ink/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Asset Label */}
                <div className="sm:w-1/4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink dark:bg-cream" />
                    <span className="font-bold text-base text-ink dark:text-cream font-sans">{asset.symbol}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono block truncate max-w-[160px]">
                    {asset.name}
                  </span>
                </div>

                {/* Combined visual representation */}
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 font-mono mb-1.5">
                    <span>Target: {asset.targetAllocation}%</span>
                    <span>Actual: {asset.allocation}%</span>
                  </div>
                  
                  {/* Two progress bars layered or dual bar comparison */}
                  <div className="h-5 bg-cream/30 dark:bg-ink border-2 border-ink dark:border-cream/25 rounded-full overflow-hidden relative flex items-center">
                    {/* Target marker flag line */}
                    <div 
                      style={{ left: `${asset.targetAllocation}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-red dark:bg-yellow z-10 border-r border-white dark:border-ink"
                      title="Target Marker"
                    />

                    {/* Actual fill */}
                    <div 
                      style={{ width: `${asset.allocation}%` }}
                      className={`h-full border-r-2 border-ink dark:border-cream transition-all duration-700 ease-out ${
                        absDeviation <= 2 
                          ? 'bg-mint' 
                          : deviation > 0 
                            ? 'bg-yellow' 
                            : 'bg-red/70'
                      }`}
                    />
                  </div>
                </div>

                {/* Status Badges */}
                <div className="sm:w-1/5 text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-ink dark:border-cream/20 ${
                    absDeviation <= 2 
                      ? 'bg-mint/15 text-mint' 
                      : deviation > 0 
                        ? 'bg-yellow/15 text-amber dark:text-yellow' 
                        : 'bg-red/15 text-maroon dark:text-red'
                  }`}>
                    {deviationLabel}
                  </span>
                  <span className="font-mono text-xs font-bold text-ink dark:text-cream">
                    ${asset.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Table List with complete Search, Filters, and Pagination */}
      <div 
        id="assets-detail-table"
        className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] transition-colors duration-150"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-dashed border-ink/10 dark:border-cream/10">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-red dark:text-yellow" />
            <h2 className="text-lg font-bold text-ink dark:text-cream">Tokenized US Equities Holdings</h2>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 bg-cream dark:bg-ink px-2 py-0.5 border border-ink/20 dark:border-cream/20 rounded">
            {filteredAssets.length} of {assets.length} Assets
          </span>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-cream/10 dark:bg-cream/5 border-2 border-ink dark:border-cream/20 rounded-xl text-xs font-sans text-ink dark:text-cream placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red dark:focus:ring-yellow"
            />
          </div>

          {/* Filter Modes */}
          <div className="flex items-center gap-1 border-2 border-ink dark:border-cream/20 rounded-xl p-1 bg-cream/10 dark:bg-cream/5 shrink-0">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'DRIFT', label: 'DRIFT > 1%' },
              { id: 'HIGH_VALUE', label: 'VALUE > $30K' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as any)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                  filterMode === tab.id
                    ? 'bg-red dark:bg-yellow text-white dark:text-ink'
                    : 'text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table content */}
        {paginatedAssets.length === 0 ? (
          <div className="text-center py-8 bg-cream/5 border-2 border-dashed border-ink/15 dark:border-cream/15 rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 font-bold text-xs">No matching holdings found.</p>
            <button 
              onClick={() => { setSearchTerm(''); setFilterMode('ALL'); }}
              className="mt-2 text-red dark:text-yellow text-xs font-bold underline cursor-pointer animate-pulse"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-ink dark:border-cream/15 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-cream/20 dark:bg-ink/55 border-b-2 border-ink dark:border-cream/15 font-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="p-3.5 font-extrabold">Asset</th>
                  <th className="p-3.5 text-right font-extrabold">Price</th>
                  <th className="p-3.5 text-right font-extrabold">Holdings</th>
                  <th className="p-3.5 text-right font-extrabold">Actual Weight</th>
                  <th className="p-3.5 text-right font-extrabold">Target Weight</th>
                  <th className="p-3.5 text-right font-extrabold font-mono">Value (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 dark:divide-cream/10 bg-white/50 dark:bg-ink-light">
                {paginatedAssets.map((asset) => {
                  const deviation = Math.abs(asset.allocation - asset.targetAllocation);
                  return (
                    <tr key={asset.symbol} className="hover:bg-cream/5 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-sm text-ink dark:text-cream">{asset.symbol}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5 truncate max-w-[150px] md:max-w-[200px]" title={asset.name}>
                          {asset.name}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-mono text-sm font-bold text-ink dark:text-cream">${asset.price.toFixed(2)}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-mono text-sm font-bold text-ink dark:text-cream">{asset.quantity.toLocaleString()}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-mono text-sm font-bold text-red dark:text-yellow">{asset.allocation}%</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-mono text-sm font-bold text-gray-600 dark:text-gray-400">{asset.targetAllocation}%</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-mono text-sm font-bold text-ink dark:text-cream">${asset.value.toLocaleString()}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredAssets.length > itemsPerPage && (
          <div className="mt-5 pt-4 border-t border-dashed border-ink/10 dark:border-cream/10 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500">
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
