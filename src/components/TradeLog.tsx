import { useState, useEffect } from 'react';
import { UsageRecord } from '../types';
import { Clipboard, Check, Database, ExternalLink, Filter, Search, FileCode, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TradeLogProps {
  logs: UsageRecord[];
}

export default function TradeLog({ logs }: TradeLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAction]);

  const handleCopy = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.asset.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.rationale.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterAction === 'ALL' || 
      log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div 
      id="trade-log-card"
      className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] text-ink dark:text-cream transition-colors duration-150"
    >
      {/* Table Header / Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b-3 border-ink dark:border-cream/35 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow text-ink text-xs font-bold px-2 py-0.5 rounded border border-ink dark:border-cream/30">
              System Verification Node
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">SYSTEM INTEGRITY REPORT</span>
          </div>
          <h2 className="text-2xl font-bold font-sans mt-1 text-ink dark:text-cream">Verifiable Usage Records Log</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-xl leading-relaxed">
            Autonomous trading logs reflecting rebalances triggered by macro Fed events. Each record acts as a verifiable run log mapping the agent decision loop.
          </p>
        </div>
        
        <div className="bg-cream/15 dark:bg-ink/40 border-2 border-ink dark:border-cream/20 p-3 rounded-2xl flex items-center gap-3 shrink-0">
          <Database className="w-8 h-8 text-red dark:text-yellow" />
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono font-bold leading-none">MOCK BLOCKCHAIN / API</div>
            <div className="text-sm font-bold text-ink dark:text-cream leading-tight font-mono">MitraBGT Bitget Sandbox</div>
            <div className="text-[10px] text-mint font-bold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" /> Active Node Logs (v1.0)
            </div>
          </div>
        </div>
      </div>

      {/* Filtering & Searching Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="log-search-input"
            type="text"
            placeholder="Search assets or rationales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cream/10 dark:bg-cream/5 border-2 border-ink dark:border-cream/20 rounded-xl text-sm font-sans text-ink dark:text-cream placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red dark:focus:ring-yellow focus:bg-white dark:focus:bg-ink-light"
          />
        </div>

        {/* Action Filter Pills */}
        <div className="flex items-center gap-2 border-2 border-ink dark:border-cream/20 rounded-xl p-1 bg-cream/10 dark:bg-cream/5 shrink-0">
          {['ALL', 'BUY', 'SELL'].map((action) => (
            <button
              key={action}
              id={`filter-btn-${action.toLowerCase()}`}
              onClick={() => setFilterAction(action)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filterAction === action 
                  ? 'bg-red dark:bg-yellow text-white dark:text-ink border border-ink dark:border-cream/10' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-cream hover:bg-cream/20 dark:hover:bg-cream/5'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Render Logs */}
      {paginatedLogs.length === 0 ? (
        <div className="text-center py-12 bg-cream/5 border-2 border-dashed border-ink/15 dark:border-cream/10 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 font-bold">No verifiable logs found matching the query.</p>
          <button 
            onClick={() => { setSearchTerm(''); setFilterAction('ALL'); }}
            className="mt-3 text-red dark:text-yellow text-xs font-bold underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedLogs.map((log, index) => {
            const isBuy = log.action === 'BUY';
            const isAbort = log.action === 'SYSTEM_SAFETY_ABORT';
            const isCopied = copiedId === log.id;

            // Extract and parse embedded [AUDIT_RECORD: ...] from rationale to clean up UI rendering
            const isAudit = log.rationale.includes('[AUDIT_RECORD:');
            let parsedAudit: any = null;
            let cleanRationale = log.rationale;
            
            if (isAudit) {
              const startIdx = log.rationale.indexOf('[AUDIT_RECORD:');
              const endIdx = log.rationale.lastIndexOf(']');
              if (startIdx !== -1 && endIdx !== -1) {
                try {
                  const jsonStr = log.rationale.substring(startIdx + 14, endIdx);
                  parsedAudit = JSON.parse(jsonStr);
                  cleanRationale = log.rationale.substring(0, startIdx).trim();
                } catch (e) {
                  console.warn("Failed to parse audit record", e);
                }
              }
            }

            return (
              <div
                key={`${log.id}-${index}`}
                className={`border-2 border-ink dark:border-cream/20 rounded-2xl p-4 bg-white dark:bg-ink-light hover:shadow-[4px_4px_0px_#1B1B1B] dark:hover:shadow-[4px_4px_0px_var(--color-yellow)] hover:translate-y-[-2px] transition-all flex flex-col md:flex-row md:items-start gap-4 ${
                  isAbort ? 'border-amber/60 bg-amber/5 dark:bg-amber/5' : ''
                }`}
              >
                {/* Visual Pill Indicator */}
                <div className="flex items-center md:flex-col gap-2 shrink-0 md:w-28">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border-2 border-ink dark:border-cream font-mono tracking-wider text-center block w-full ${
                    isAbort ? 'bg-amber text-ink' : (isBuy ? 'bg-mint text-white' : 'bg-red text-white')
                  }`}>
                    {isAbort ? 'ABORTED' : log.action}
                  </span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-ink dark:text-cream">{log.asset}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Numeric info row */}
                    <div className="flex items-center gap-4 font-mono text-xs text-ink dark:text-cream">
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Qty:</span> <span className="font-bold">{log.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Price:</span> <span className="font-bold">${log.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Value:</span> <span className="font-bold text-red dark:text-yellow">${log.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 bg-cream/10 dark:bg-ink border border-ink/5 dark:border-cream/5 p-3 rounded-xl italic leading-relaxed">
                    "{cleanRationale}"
                  </p>

                  {/* Hash auditor link */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono border-t border-dashed border-ink/5 dark:border-cream/5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>AUDIT HASH:</span>
                      <span className="text-gray-700 dark:text-gray-300 bg-cream/30 dark:bg-ink border border-ink/15 dark:border-cream/15 px-2 py-0.5 rounded text-[10px]">
                        {log.txHash}
                      </span>
                    </div>

                    <button
                      id={`copy-hash-btn-${log.id}`}
                      onClick={() => handleCopy(log.txHash, log.id)}
                      className="text-red dark:text-yellow hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-mint" />
                          <span className="text-mint">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3 h-3" />
                          <span>Copy API Hash</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interactive Hackathon Verification Accordion */}
                  {parsedAudit && (
                    <div className="pt-2 border-t border-dashed border-ink/5 dark:border-cream/5">
                      <button
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="text-[11px] text-amber hover:text-amber/80 font-bold flex items-center gap-1 font-mono cursor-pointer transition-colors"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        {expandedId === log.id ? 'Hide Hackathon Verifiable JSON Record ▲' : 'View Hackathon Verifiable JSON Record ▼'}
                      </button>
                      
                      {expandedId === log.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 bg-ink dark:bg-ink text-cream font-mono p-4 rounded-xl text-xs border-2 border-ink dark:border-cream overflow-x-auto shadow-inner relative"
                        >
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow/10 border border-yellow/20 px-2 py-0.5 rounded text-[9px] text-yellow font-bold uppercase">
                            SECURE MEMO RECORD
                          </div>
                          <pre className="whitespace-pre-wrap leading-relaxed text-yellow pt-3">
                            {JSON.stringify(parsedAudit, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Footer */}
          {filteredLogs.length > itemsPerPage && (
            <div className="mt-6 pt-4 border-t border-dashed border-ink/10 dark:border-cream/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-400">
                Page {currentPage} of {totalPages} ({filteredLogs.length} matching logs)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 border-2 border-ink dark:border-cream/30 rounded-lg bg-white dark:bg-ink-light text-ink dark:text-cream hover:bg-cream/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 border-2 border-ink dark:border-cream/30 rounded-lg bg-white dark:bg-ink-light text-ink dark:text-cream hover:bg-cream/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
