import React, { useEffect, useState } from 'react';
import { Database, Cpu, Layers, Terminal, ShieldCheck, Lock, Activity } from 'lucide-react';

interface NetworkVisualizerProps {
  txs: any[];
}

export function NetworkVisualizer({ txs }: NetworkVisualizerProps) {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Initializing AegisID Hybrid Architecture...",
    "[SYSTEM] Connecting to EVM Smart Contract...",
    "[OK] RPC Connection Established."
  ]);

  // Simulate a live terminal stream based on actual transaction data
  useEffect(() => {
    if (!txs || txs.length === 0) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      const tx = txs[currentIndex % txs.length];
      const time = new Date().toLocaleTimeString([], { hour12: false });
      
      const hashShort = tx.transactionHash ? `${tx.transactionHash.substring(0, 10)}...` : '0x...';

      const sequence = [
        `[${time}] [Aegis API] Received ${tx.entityType} #${tx.entityId} metadata`,
        `[${time}] [CRYPTO] Hashing payload (SHA-256)...`,
        `[${time}] [EVM] Verifying on-chain anchor ${hashShort}`,
        `[${time}] [OK] Match confirmed in Block #${tx.blockNumber}`
      ];

      setLogs(prev => {
        const updated = [...sequence, ...prev];
        return updated.slice(0, 16); // Keep last 16 logs
      });
      
      currentIndex++;
    }, 4500); // Run sequence every 4.5s

    return () => clearInterval(interval);
  }, [txs]);

  return (
    <div className="bg-[#0b0b0e] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative text-slate-300 flex flex-col lg:flex-row">
      <style>{`
        @keyframes stream {
          0% { left: 0%; opacity: 0; transform: scale(0.5); }
          10% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px 2px rgba(59, 130, 246, 0.8); }
          90% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px 2px rgba(59, 130, 246, 0.8); }
          100% { left: 100%; opacity: 0; transform: scale(0.5); }
        }
        .data-particle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background-color: #3b82f6;
          border-radius: 50%;
          animation: stream 2.5s infinite linear;
          z-index: 10;
        }
        .data-particle-delayed {
          animation-delay: 1.25s;
        }
        .scanline {
          width: 100%;
          height: 100px;
          background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(59,130,246,0.1) 50%, rgba(0,0,0,0) 100%);
          opacity: 0.1;
          position: absolute;
          bottom: 100%;
          animation: scanline 8s linear infinite;
          pointer-events: none;
        }
        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }
      `}</style>
      
      <div className="scanline"></div>

      {/* Left: Architecture Diagram */}
      <div className="flex-1 p-8 lg:border-r border-slate-800 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Hybrid Architecture Map</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Real-time Sync</span>
          </span>
        </div>

        <div className="flex items-center justify-between relative mt-12 mb-6">
          
          {/* Node 1: Off-chain */}
          <div className="flex flex-col items-center relative z-20 w-1/3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] mb-3">
              <Database className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-white mb-1">MySQL DB</span>
            <span className="text-[10px] text-slate-500 text-center uppercase tracking-wider">Off-Chain Metadata<br/>(PII & Assets)</span>
          </div>

          {/* Connection 1 */}
          <div className="absolute left-1/6 right-1/2 top-7 h-[2px] bg-slate-800 -z-10">
            <div className="data-particle"></div>
          </div>

          {/* Node 2: Crypto Engine */}
          <div className="flex flex-col items-center relative z-20 w-1/3">
            <div className="w-14 h-14 rounded-2xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] mb-3">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-400 mb-1">Aegis Engine</span>
            <span className="text-[10px] text-blue-400/60 text-center uppercase tracking-wider">SHA-256 Hashing<br/>Zero-Knowledge</span>
          </div>

          {/* Connection 2 */}
          <div className="absolute left-1/2 right-1/6 top-7 h-[2px] bg-slate-800 -z-10">
            <div className="data-particle data-particle-delayed"></div>
          </div>

          {/* Node 3: On-chain */}
          <div className="flex flex-col items-center relative z-20 w-1/3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
              <Layers className="w-6 h-6 text-emerald-400 relative z-10" />
            </div>
            <span className="text-xs font-bold text-emerald-400 mb-1">EVM Ledger</span>
            <span className="text-[10px] text-emerald-400/60 text-center uppercase tracking-wider">Smart Contract<br/>Immutable Anchor</span>
          </div>

        </div>
        
        <div className="mt-10 bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">How it works:</strong> Sensitive identity and asset data remains securely off-chain in MySQL. Only deterministic cryptographic hashes are anchored to the blockchain, ensuring GDPR compliance while providing mathematically verifiable tamper-evident proofs.
        </div>
      </div>

      {/* Right: Live Terminal */}
      <div className="flex-1 bg-black p-6 font-mono text-[11px] leading-relaxed flex flex-col relative">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-slate-500">
            <Terminal className="w-4 h-4" />
            <span className="uppercase tracking-widest font-bold">Node Output</span>
          </div>
          <Lock className="w-3.5 h-3.5 text-slate-600" />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 h-64 lg:h-auto custom-scrollbar flex flex-col-reverse">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className={`
                ${i === 0 ? 'text-white font-bold opacity-100' : 'opacity-70'}
                ${log.includes('[ERROR]') ? 'text-red-400' : ''}
                ${log.includes('[OK]') ? 'text-emerald-400' : ''}
                ${log.includes('[HASH]') || log.includes('[CRYPTO]') ? 'text-blue-400' : ''}
                ${log.includes('[EVM]') ? 'text-purple-400' : ''}
                transition-all duration-300
              `}
            >
              {log}
            </div>
          ))}
        </div>
        
        {/* Faded overlay at top of terminal for smooth scrolling effect */}
        <div className="absolute top-[60px] left-0 right-0 h-12 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
