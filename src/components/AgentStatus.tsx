import { motion } from 'motion/react';
import { Brain, Terminal, Cpu, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { AgentStatusState } from '../types';

interface AgentStatusProps {
  statusState: AgentStatusState;
  onRunDiagnostic: () => void;
}

export default function AgentStatus({ statusState, onRunDiagnostic }: AgentStatusProps) {
  const getStatusColor = () => {
    switch (statusState.status) {
      case 'thinking':
        return 'bg-amber text-ink animate-pulse';
      case 'rebalancing':
        return 'bg-red text-white animate-bounce';
      default:
        return 'bg-ink text-white';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Agent Bubble Card */}
      <div 
        id="agent-status-card"
        className="bg-white dark:bg-ink-light border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] relative overflow-hidden transition-colors duration-150"
      >
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 bg-yellow text-ink border-l-3 border-b-3 border-ink dark:border-cream px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-xl font-display">
          Active MCP Node
        </div>

        <div className="flex items-center gap-3 mb-4 mt-2 sm:mt-0">
          <div className="p-2.5 bg-cream dark:bg-ink border-2 border-ink dark:border-cream/20 rounded-xl">
            <Brain className="w-6 h-6 text-red dark:text-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex flex-wrap items-center gap-2 text-ink dark:text-cream">
              MitraBGT AI Agent
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-ink dark:border-cream/30 ${getStatusColor()}`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${statusState.status === 'thinking' ? 'bg-ink' : statusState.status === 'rebalancing' ? 'bg-yellow' : 'bg-mint'}`} />
                {statusState.status.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: bg-agent-mcp-v1-active</p>
          </div>
        </div>

        {/* Bubble dialog */}
        <div className="bg-cream/40 dark:bg-ink/30 border-3 border-ink dark:border-cream/20 rounded-2xl rounded-bl-md p-5 relative mt-4 shadow-[4px_4px_0px_rgba(27,27,27,0.08)]">
          <div className="flex items-center gap-2 text-amber font-bold text-sm mb-2 font-mono">
            <span className="w-3 h-3 rounded-full bg-amber animate-ping" />
            ARB · AI Agent reasoning:
          </div>
          <p className="text-base text-ink dark:text-cream font-medium leading-relaxed italic">
            "{statusState.lastThought}"
          </p>
        </div>

        {/* Diagnostic CTA */}
        <div className="mt-5 flex gap-3 flex-wrap">
          <button
            id="run-diagnostic-btn"
            onClick={onRunDiagnostic}
            className="flex-1 min-w-[140px] bg-yellow text-ink border-3 border-ink dark:border-cream rounded-full px-5 py-2.5 font-bold hover:translate-y-[-2px] transition-transform active:translate-y-[1px] shadow-[4px_4px_0px_#1B1B1B] dark:shadow-[4px_4px_0px_var(--color-yellow)] text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Cpu className="w-4 h-4" /> Run Agent Self-Test
          </button>
          
          <a
            id="agent-docs-link"
            href="https://github.com/BitgetLimited/agent_hub"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-ink text-ink dark:text-cream border-3 border-ink dark:border-cream/20 rounded-full px-5 py-2.5 font-bold hover:translate-y-[-2px] hover:bg-cream/10 transition-all shadow-[4px_4px_0px_#1B1B1B] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] text-sm flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4" /> SDK Docs
          </a>
        </div>
      </div>

      {/* US Stock Brokerage API Hook Instructions */}
      <div 
        id="brokerage-integration-guide"
        className="bg-maroon text-cream border-3 border-ink dark:border-cream rounded-3xl p-6 shadow-[6px_6px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_var(--color-yellow)] transition-colors duration-150"
      >
        <div className="flex items-center gap-2 text-yellow font-display text-lg mb-3">
          <Cpu className="w-5 h-5 text-yellow" />
          BITGET AGENT HUB GUIDE
        </div>
        <p className="text-sm text-cream/95 leading-relaxed mb-4">
          This dashboard is designed to connect directly with the <span className="text-yellow font-bold">Bitget Agent Hub MCP Server</span>. Hook in your live agent to trade RWA and Crypto assets in 3 easy steps:
        </p>

        {/* Mini Step Flow */}
        <div className="space-y-3.5 text-xs">
          <div className="flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-full bg-yellow text-maroon font-bold flex items-center justify-center shrink-0 border-2 border-ink dark:border-cream/20">
              1
            </div>
            <div>
              <p className="font-bold text-yellow">Initialize Bitget MCP Server</p>
              <p className="text-cream/80">Launch the Bitget Agent Hub MCP Server locally or in a container:</p>
              <div className="mt-1 bg-ink text-white p-2 rounded-lg font-mono border border-cream/20 relative">
                npm install -g @bitget-ai/agent-hub-mcp
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-full bg-yellow text-maroon font-bold flex items-center justify-center shrink-0 border-2 border-ink dark:border-cream/20">
              2
            </div>
            <div>
              <p className="font-bold text-yellow">Set Up Environment Secrets</p>
              <p className="text-cream/80 text-wrap break-all">Provide read/write permissions for Spot trading sub-accounts:</p>
              <div className="mt-1 bg-ink text-white p-2 rounded-lg font-mono border border-cream/20">
                BITGET_API_KEY="..." <br/>
                BITGET_API_SECRET="..."
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-full bg-yellow text-maroon font-bold flex items-center justify-center shrink-0 border-2 border-ink dark:border-cream/20">
              3
            </div>
            <div>
              <p className="font-bold text-yellow">Inject Bitget Agent API Hooks</p>
              <p className="text-cream/80">Connect the Express server endpoints to <code className="text-yellow font-bold bg-ink/50 px-1 py-0.5 rounded font-mono">@bitget-ai/getagent-skill</code> to broadcast live rebalancing events.</p>
            </div>
          </div>
        </div>

        {/* Security Compliance */}
        <div className="mt-4 bg-ink/30 border border-cream/30 rounded-xl p-3 text-xs leading-relaxed text-cream/90 flex gap-2">
          <CheckCircle className="w-4 h-4 text-mint shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-yellow">System Access Mode:</span> Auditable Public Sandbox. Full API binding enabled, routing read/write transactions via secure mock backends for evaluation.
          </div>
        </div>
      </div>
    </div>
  );
}
