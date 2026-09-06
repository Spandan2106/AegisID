import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api/client";
import { ShieldCheck, Activity, Cpu, Server, Link, Database, Terminal, CheckCircle2, RefreshCw, Copy, Check, ShieldAlert, Filter } from "lucide-react";
import { TamperSimulationModal } from "../components/TamperSimulationModal";
import { NetworkVisualizer } from "../components/NetworkVisualizer";
import { NetworkNodeGraph } from "../components/NetworkNodeGraph";

export function BlockchainPage() {
  const [status, setStatus] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const load = async () => {
    setIsRefreshing(true);
    try {
      const [s, t] = await Promise.all([
        api.get("/blockchain/status"),
        api.get("/blockchain/transactions")
      ]);
      setStatus(s);
      setTxs(t);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTxs = useMemo(() => {
    if (!txs) return [];
    if (filterType === "ALL") return txs;
    return txs.filter(t => t.entityType?.toUpperCase() === filterType.toUpperCase());
  }, [txs, filterType]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Blockchain Explorer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AegisID EVM Smart Contract & Immutable Anchor Ledger</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSimulationOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all text-sm font-semibold"
            title="Run Integrity Tamper Simulation"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Run Tamper Simulation</span>
          </button>
          <button
            onClick={load}
            disabled={isRefreshing}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Network Status"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Network Live</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <NetworkVisualizer txs={txs} />
        <NetworkNodeGraph txs={txs} />
      </div>

      {status && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Network</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">{status.network}</span>
          </div>

          <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20"></div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                <Link className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chain ID</span>
            </div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono relative z-10">{status.chainId}</span>
          </div>

          <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latest Block</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono relative z-10">#{status.blockNumber}</span>
          </div>

          <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</span>
            </div>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 relative z-10 flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6" />
              <span>{status.status}</span>
            </span>
          </div>
        </div>
      )}

      {/* Visual Block Chain */}
      <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm overflow-hidden">
        <div className="flex items-center space-x-3 mb-8">
          <Cpu className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Block Finality</h3>
        </div>
        
        <div className="flex items-center justify-start space-x-2 overflow-x-auto pb-4 hide-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className={`shrink-0 flex flex-col justify-between p-4 rounded-2xl border ${i === 0 ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'} w-40 h-32 relative`}>
                {i === 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Block</p>
                  <p className={`font-mono font-bold ${i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    #{status ? status.blockNumber - i : 1849320 - i}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Hash</p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-500 truncate">0x{Math.random().toString(16).slice(2, 12)}...{Math.random().toString(16).slice(2, 6)}</p>
                </div>
              </div>
              {i < 5 && (
                <div className="w-8 shrink-0 h-0.5 bg-slate-200 dark:bg-slate-800 relative">
                  <div className={`absolute top-0 left-0 h-full bg-blue-500 ${i === 0 ? 'animate-[pulse_1s_infinite]' : 'opacity-30'}`} style={{ width: '100%' }}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Window */}
        <div className="lg:col-span-1 bg-[#0a0a0c] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-[#18181b] px-4 py-3 flex items-center space-x-2 border-b border-slate-800">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-4 text-[10px] font-mono text-slate-500">contract-interface.sh</span>
          </div>
          <div className="p-6 font-mono text-xs text-slate-300 space-y-4 flex-1">
            <div>
              <span className="text-emerald-400">root@aegis-node:~$</span> <span className="text-slate-100">cat config/contract.json</span>
            </div>
            <div className="text-blue-300 pl-4">
              <p>{'{'}</p>
              <p className="pl-4">"contract": "AegisIDRegistry",</p>
              <p className="pl-4">"version": "v2.1.0",</p>
              <p className="pl-4">"address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",</p>
              <p className="pl-4">"compiler": "solc-0.8.19",</p>
              <p className="pl-4">"gas_optimized": true</p>
              <p>{'}'}</p>
            </div>
            <div>
              <span className="text-emerald-400">root@aegis-node:~$</span> <span className="text-slate-100">tail -f /var/log/geth.log</span>
            </div>
            <div className="text-slate-500 space-y-1">
              <p>[INFO] Imported new block headers count=1</p>
              <p>[INFO] Chain head was updated number={status?.blockNumber || '...'}</p>
              <p className="text-amber-500/50">[WARN] P2P network peer count low (14)</p>
              <p className="animate-pulse text-slate-400">Listening for new blocks...</p>
            </div>
          </div>
        </div>

        {/* Ledger with Category Filter */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Terminal className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Anchor Ledger</h3>
                <p className="text-xs text-slate-500">Immutable anchoring transactions across smart contract registries</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-semibold">
              {["ALL", "IDENTITY", "CREDENTIAL", "ASSET"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                    filterType === tab
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 border-b border-slate-200 dark:border-white/5">Operation</th>
                  <th className="p-4 border-b border-slate-200 dark:border-white/5">Entity Category</th>
                  <th className="p-4 border-b border-slate-200 dark:border-white/5">Tx Hash</th>
                  <th className="p-4 border-b border-slate-200 dark:border-white/5">Block</th>
                  <th className="p-4 border-b border-slate-200 dark:border-white/5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Syncing ledger...</td></tr>
                ) : filteredTxs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">No transactions found for filter "{filterType.toLowerCase()}".</td></tr>
                ) : (
                  filteredTxs.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.blockchainOperation}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.entityType?.toUpperCase() === 'IDENTITY' 
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                            : t.entityType?.toUpperCase() === 'CREDENTIAL'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        }`}>
                          {t.entityType} #{t.entityId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 group/copy cursor-pointer" onClick={() => handleCopy(t.transactionHash)}>
                          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 truncate max-w-[140px] transition-colors">{t.transactionHash}</span>
                          <button className="text-slate-400 opacity-0 group-hover/copy:opacity-100 transition-opacity hover:text-slate-600 dark:hover:text-white">
                            {copiedHash === t.transactionHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">#{t.blockNumber}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <TamperSimulationModal 
        isOpen={isSimulationOpen} 
        onClose={() => setIsSimulationOpen(false)} 
        latestTx={txs && txs.length > 0 ? txs[0] : null} 
      />
    </div>
  );
}

