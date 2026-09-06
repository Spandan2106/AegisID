import React, { useState, useEffect } from "react";
import { digitalAssetApi } from "../services/digitalAssetApi";
import { api } from "../api/client";
import { Search, CheckCircle2, XCircle, FileText, Folder, Check, Copy, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";

export function VerifyAssetPage() {
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  // Initialize from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("assetId");
    if (idParam) {
      setAssetId(idParam);
      handleSearchById(idParam);
    }
  }, []);

  const handleSearchById = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setVerificationResult(null);
    try {
      const data = await digitalAssetApi.getDigitalAsset(id);
      setResult(data);
    } catch (err: any) {
      if (err.message.includes("404") || err.message.toLowerCase().includes("not found")) {
        setError("Not Found");
      } else {
        setError(err.message || "An error occurred while verifying the asset.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchById(assetId);
  };

  const handleVerifyIntegrity = async () => {
    if (!result) return;
    try {
      const vResult = await digitalAssetApi.verifyDigitalAsset(result.assetId || result.id);
      setVerificationResult(true);
    } catch (err: any) {
      setVerificationResult(false);
    }
  };

  const handlePreview = () => {
    if (!result) return;
    const fileUrl = digitalAssetApi.getDigitalAssetFileUrl(result.assetId || result.id);
    window.open(fileUrl, '_blank');
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verify Digital Asset</h1>
        <p className="text-slate-500 dark:text-slate-400">Enter an Asset ID to locate and verify a registered digital asset.</p>
      </div>

      <div className="bg-white dark:bg-[#0d0d0f] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              required
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              disabled={loading}
              placeholder="e.g. AST-2026-8F42K91"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !assetId.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search Asset</span>
              </>
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Searching for asset...</p>
        </div>
      )}

      {error === "Not Found" && (
        <div className="bg-white dark:bg-[#0d0d0f] rounded-3xl p-12 text-center border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in zoom-in-95">
          <XCircle className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Asset Not Found</h2>
          <p className="text-slate-500 mb-6">No registered asset was found for this Asset ID.</p>
          <button
            onClick={() => { setError(null); setAssetId(""); }}
            className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {error && error !== "Not Found" && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-[#0d0d0f] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Asset Found</h2>
                <p className="text-sm text-slate-500">Asset successfully located in the registry.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center space-x-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Asset ID</p>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{result.assetId || result.id}</p>
              </div>
              <button 
                onClick={() => handleCopy(result.assetId || result.id, 'id')}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                title="Copy Asset ID"
              >
                {copied === 'id' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Asset Name</h4>
                <p className="text-base font-medium text-slate-900 dark:text-white">{result.assetName || "Unknown"}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Asset Type</h4>
                <p className="text-base font-medium text-slate-900 dark:text-white">{result.assetType || "Unknown"}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Status</h4>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-block border ${
                  result.status === "ACTIVE" || result.status === "REGISTERED"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                }`}>
                  {result.status || "REGISTERED"}
                </span>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Created</h4>
                <p className="text-base font-medium text-slate-900 dark:text-white">
                  {result.createdAt ? new Date(result.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' }) : "Unknown"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-[#1a1a1f] rounded-2xl p-5 border border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4" />
                    <h4 className="text-sm font-bold">File Details</h4>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">
                    {result.fileFormat || "FILE"}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">File Name</h5>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{result.fileName || "-"}</p>
                </div>
                <div>
                  <h5 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Format</h5>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{result.fileFormat || "-"}</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-200 dark:border-white/5">
                  <button
                    onClick={handlePreview}
                    className="flex-1 py-2.5 px-4 bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-2 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Preview File</span>
                  </button>
                  <button
                    onClick={handleVerifyIntegrity}
                    className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Integrity</span>
                  </button>
                </div>
                
                {verificationResult === true && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-start space-x-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Integrity Verified</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400/80">The digital asset matches the original cryptographic hash on record.</p>
                    </div>
                  </div>
                )}
                
                {verificationResult === false && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start space-x-2 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-900 dark:text-red-300">Integrity Check Failed</p>
                      <p className="text-xs text-red-700 dark:text-red-400/80">The file has been modified or is missing. The current hash does not match the original record.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex justify-end space-x-3">
             <button
               onClick={() => { setResult(null); setAssetId(""); }}
               className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all"
             >
               Verify Another
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
