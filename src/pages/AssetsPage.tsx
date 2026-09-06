import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api/client";
import { digitalAssetApi } from "../services/digitalAssetApi";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Box, Plus, ShieldCheck, Trash2, PauseCircle, PlayCircle, Send, Copy, Check, Info, CheckCircle2, Filter, Calendar, Eye, FileBadge } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { BlockchainProofModal } from "../components/BlockchainProofModal";
import { FilePreview } from "../components/FilePreview";
import { AssetMetadataEditor, MetadataEntry } from "../components/AssetMetadataEditor";

export function AssetsPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<any | null>(null);
  const [transferUserId, setTransferUserId] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  const [proofModal, setProofModal] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  
  const [form, setForm] = useState({ userId: "", assetName: "", assetDescription: "", assetType: "IntellectualProperty" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataEntry[]>([]);
  const [createdAssetId, setCreatedAssetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  const canManageAssets = ["SUPER_ADMIN", "ADMIN", "ISSUER"].includes(user?.role || "");

  async function loadAssets() {
    try {
      const data = await digitalAssetApi.getDigitalAssets();
      setAssets(data);
    } catch (err: any) {
      showNotification("error", "Failed to Load", err.message || "Could not load assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      // Filter by type
      if (filterType !== "ALL" && a.assetType !== filterType) return false;
      
      // Filter by date
      if (dateRange.start) {
        if (new Date(a.createdAt) < new Date(dateRange.start)) return false;
      }
      if (dateRange.end) {
        // add 1 day to end date to include the whole day
        const endDate = new Date(dateRange.end);
        endDate.setDate(endDate.getDate() + 1);
        if (new Date(a.createdAt) >= endDate) return false;
      }
      
      return true;
    });
  }, [assets, filterType, dateRange]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(type);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showNotification("error", "File Required", "Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    showNotification("info", "Uploading Asset...", "Preparing digital asset for registry.");
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("assetName", form.assetName);
      formData.append("description", form.assetDescription);
      formData.append("assetType", form.assetType);
      formData.append("ownerId", String(form.userId));
      
      const data = await digitalAssetApi.uploadDigitalAsset(formData);
      
      setCreatedAssetId(data.assetId || data.id || "AST-UNKNOWN");
      setForm({ userId: "", assetName: "", assetDescription: "", assetType: "IntellectualProperty" });
      setSelectedFile(null);
      setMetadata([]);
      await loadAssets();
      showNotification("success", "Asset Registered", "Digital asset has been successfully created.");
    } catch (err: any) {
      showNotification("error", "Registration Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: number, action: string, data?: any) => {
    setActionLoading(id);
    try {
      await api.put(`/assets/${id}/${action}`, data);
      await loadAssets();
      if (action === "transfer") {
        setShowTransferModal(false);
        setTransferUserId("");
        setSelectedAssetId(null);
      } else if (action === "delete") {
        setSelectedAssetDetails(null);
      }
      showNotification("success", "Action Successful", `Successfully performed ${action} on asset #${id}.`);
    } catch (err: any) {
      showNotification("error", "Action Failed", `Failed to ${action} asset: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const chartData = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    const now = new Date();
    const thirtyDaysAgo = startOfDay(subDays(now, 30));
    
    const dateCounts: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      dateCounts[format(subDays(now, i), 'MMM dd')] = 0;
    }
    
    assets.forEach(asset => {
      const date = new Date(asset.createdAt);
      if (isAfter(date, thirtyDaysAgo)) {
        const formatted = format(date, 'MMM dd');
        if (dateCounts[formatted] !== undefined) {
          dateCounts[formatted]++;
        }
      }
    });

    return Object.keys(dateCounts).map(date => ({
      date,
      count: dateCounts[date]
    }));
  }, [assets]);

  const assetTypeDistribution = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    
    const typeCounts: Record<string, number> = {};
    assets.forEach(asset => {
      const type = asset.assetType || "Unknown";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
    
    return Object.keys(typeCounts).map((type, index) => ({
      name: type.replace(/([A-Z])/g, ' $1').trim(), // Add spaces before capital letters
      value: typeCounts[type],
      color: COLORS[index % COLORS.length]
    }));
  }, [assets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Digital Asset Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Secure ownership tracking, asset hashing, and blockchain anchoring</p>
        </div>
        {canManageAssets && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Digital Asset</span>
          </button>
        )}
      </div>

      {/* Analytics Dashboard */}
      {(assets.length > 0 || canManageAssets) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">
              {canManageAssets ? "Asset Issuance" : "Asset Activity"} (Last 30 Days)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" className="dark:opacity-20" opacity={0.5} vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--tw-colors-slate-900)', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} name="Assets Issued" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Asset Distribution</h2>
            <div className="h-64 w-full">
              {assetTypeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetTypeDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--tw-colors-slate-900)', borderColor: '#334155', color: '#fff', borderRadius: '12px', border: 'none' }}
                      itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
                  No assets available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Asset List & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">Filter Assets</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                title="Start Date"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                title="End Date"
              />
            </div>
            
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="IntellectualProperty">Intellectual Property</option>
              <option value="FinancialInstrument">Financial Instrument</option>
              <option value="DigitalIP">Digital IP</option>
              <option value="IdentityRecord">Identity Record</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Asset ID</th>
                  <th className="p-4">Asset Name</th>
                  <th className="p-4">File / Format</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500 flex items-center justify-center space-x-2">Loading assets...</td></tr>
                ) : filteredAssets.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No digital assets match your criteria.</td></tr>
                ) : (
                  filteredAssets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">{a.assetId || `AST-${a.id}`}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{a.assetName}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-300">{a.fileName || "-"}</span>
                        {a.fileFormat && (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider w-fit mt-1">{a.fileFormat}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        a.status === "ACTIVE" || a.status === "REGISTERED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                          : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      }`}>
                        {a.status || "REGISTERED"}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(a.assetId || `AST-${a.id}`, `table-${a.id}`) }}
                        title="Copy ID"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 rounded-lg transition-colors inline-flex border border-transparent"
                      >
                        {copiedHash === `table-${a.id}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          try {
                            const details = await digitalAssetApi.getDigitalAsset(a.assetId || a.id);
                            setSelectedAssetDetails(details);
                          } catch(err) {
                            showNotification("error", "Error", "Could not fetch asset details");
                          }
                        }}
                        title="View Asset"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 rounded-lg transition-colors inline-flex border border-transparent"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          window.location.href = `/verify-asset?assetId=${a.assetId || `AST-${a.id}`}`;
                        }}
                        title="Verify Asset"
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-colors inline-flex border border-transparent"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Register Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)}></div>
          <div className="relative bg-white dark:bg-[#1a1a1f] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {createdAssetId ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Asset Created Successfully</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your digital asset has been securely registered.</p>
                
                <div className="bg-slate-50 dark:bg-[#0d0d0f] rounded-xl p-4 border border-slate-200 dark:border-white/10 mt-6">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Asset ID</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{createdAssetId}</p>
                    <button 
                      onClick={() => handleCopy(createdAssetId, 'createdAssetId')}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 shadow-sm flex items-center space-x-2"
                    >
                      {copiedHash === 'createdAssetId' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs font-semibold">{copiedHash === 'createdAssetId' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => { setShowModal(false); setCreatedAssetId(null); }}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Register Digital Asset</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create a new digital asset in the registry.</p>
                
                <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Owner User ID</label>
                    <input
                      type="number"
                      required
                      disabled={isSubmitting}
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Asset Name / Title</label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={form.assetName}
                      onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="Enterprise IP Deed #109"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                    <textarea
                      disabled={isSubmitting}
                      value={form.assetDescription}
                      onChange={(e) => setForm({ ...form, assetDescription: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 resize-none h-20"
                      placeholder="Detailed description of the asset..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Asset Type</label>
                    <select
                      required
                      disabled={isSubmitting}
                      value={form.assetType}
                      onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                    >
                      <option value="IntellectualProperty">Intellectual Property</option>
                      <option value="FinancialInstrument">Financial Instrument</option>
                      <option value="DigitalIP">Digital IP</option>
                      <option value="IdentityRecord">Identity Record</option>
                      <option value="Certificate">Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Digital File</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex-1 cursor-pointer bg-slate-50 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 border-dashed rounded-xl px-4 py-4 text-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
                          {selectedFile ? selectedFile.name : "Click to select a file"}
                        </span>
                        {!selectedFile && (
                          <span className="block text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                            JPG, PNG, PDF, DOC (Max 10MB)
                          </span>
                        )}
                      </label>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <AssetMetadataEditor metadata={metadata} onChange={setMetadata} />
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting ? "Uploading..." : "Register Asset"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Transfer Asset Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTransferModal(false)}></div>
          <div className="relative bg-white dark:bg-[#1a1a1f] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Transfer Digital Asset</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Transfer ownership of this asset to another user identity.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); if (selectedAssetId) handleAction(selectedAssetId, "transfer", { newUserId: transferUserId }) }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">New Owner User ID</label>
                <input
                  type="number"
                  required
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0d0d0f] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="New User ID e.g. 6"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowTransferModal(false); setTransferUserId(""); setSelectedAssetId(null); }}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Details Slide-Over */}
      {selectedAssetDetails && (
        <div className="fixed inset-0 z-[60] flex justify-end p-4 sm:p-0 pointer-events-none">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedAssetDetails(null)}></div>
          <div className="relative bg-white dark:bg-[#0d0d0f] w-full sm:w-[450px] h-full sm:h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-white/10 pointer-events-auto">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Asset Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{selectedAssetDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Core Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Asset Name</h4>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedAssetDetails.assetName}</p>
                </div>
                
                {(selectedAssetDetails.id || selectedAssetDetails.assetId) && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Asset ID</h4>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                      <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{selectedAssetDetails.assetId || selectedAssetDetails.id}</p>
                      <button onClick={() => handleCopy(String(selectedAssetDetails.assetId || selectedAssetDetails.id), 'id')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        {copiedHash === 'id' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Type</h4>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAssetDetails.assetType}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Owner</h4>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">User #{selectedAssetDetails.userId}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Status</h4>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-block mt-1 border ${
                        selectedAssetDetails.status === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                          : "bg-amber-50 text-amber-600 dark:text-amber-400 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20"
                      }`}>
                    {selectedAssetDetails.status}
                  </span>
                </div>
              </div>

              {/* File and Storage Information */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Storage Information</h4>
                
                {selectedAssetDetails.fileName && (
                  <div className="mb-4">
                    <FilePreview
                      fileName={selectedAssetDetails.fileName}
                      fileFormat={selectedAssetDetails.fileFormat}
                      className="w-full h-32"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">File Name</h5>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedAssetDetails.fileName || "-"}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">Format</h5>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAssetDetails.fileFormat || "-"}</p>
                  </div>
                </div>
              </div>

              {selectedAssetDetails.customMetadata && selectedAssetDetails.customMetadata.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-white/5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Custom Metadata</h4>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 space-y-2">
                    {selectedAssetDetails.customMetadata.map((meta: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{meta.key}:</span>
                        <span className="text-slate-900 dark:text-white font-semibold text-right">{meta.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Data / Cryptographic Proof */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Verification Data</span>
                  </h4>
                  <button
                    onClick={() => setProofModal({ isOpen: true, id: selectedAssetDetails.id })}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Verify Proof</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Asset Validation Payload</h4>
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 overflow-x-auto shadow-inner">
                    <pre className="text-[10px] sm:text-xs text-emerald-400 font-mono break-all whitespace-pre-wrap">
{JSON.stringify({
  id: selectedAssetDetails.assetId || selectedAssetDetails.id,
  owner: `User #${selectedAssetDetails.userId}`,
  assetType: selectedAssetDetails.assetType,
  timestamp: selectedAssetDetails.createdAt,
  metadata: selectedAssetDetails.customMetadata || []
}, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Verification Hash (SHA-256)</h4>
                  <div className="bg-slate-50 dark:bg-[#1a1a1f] p-3.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between group">
                    <p className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate mr-3">{selectedAssetDetails.assetHash}</p>
                    <button onClick={() => handleCopy(selectedAssetDetails.assetHash, 'hash')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0">
                      {copiedHash === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Blockchain Transaction Hash</h4>
                  <div className="bg-slate-50 dark:bg-[#1a1a1f] p-3.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between group">
                    <p className="font-mono text-xs text-blue-600 dark:text-blue-400 truncate mr-3">{selectedAssetDetails.blockchainTxHash}</p>
                    <button onClick={() => handleCopy(selectedAssetDetails.blockchainTxHash, 'tx')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0">
                      {copiedHash === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lifecycle Info */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lifecycle History</h4>
                
                <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[7px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  <div className="relative">
                    <div className="absolute -left-[23px] w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#0d0d0f] top-1"></div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Anchored to Blockchain</p>
                    <p className="text-xs font-medium text-slate-500">{new Date(selectedAssetDetails.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[23px] w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-[#0d0d0f] top-1"></div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Asset Registration Initiated</p>
                    <p className="text-xs font-medium text-slate-500">By User #{selectedAssetDetails.userId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {proofModal.isOpen && proofModal.id && (
        <BlockchainProofModal 
          isOpen={proofModal.isOpen} 
          onClose={() => setProofModal({ isOpen: false, id: null })} 
          entityType="asset" 
          entityId={proofModal.id} 
        />
      )}
    </div>
  );
}
