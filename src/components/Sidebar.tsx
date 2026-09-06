import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Fingerprint, 
  Award, 
  Box, 
  CheckCircle2, 
  Building2, 
  Users, 
  ShieldCheck, 
  FileText,
  Search
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "identity", label: "Identity (DID)", icon: Fingerprint },
    { id: "credentials", label: "Verifiable Credentials", icon: Award },
    { id: "assets", label: "Digital Assets", icon: Box },
    { id: "verify-asset", label: "Verify Asset", icon: Search },
    { id: "verification", label: "Unified Verification", icon: CheckCircle2 },
    { id: "organizations", label: "Organizations", icon: Building2 },
    ...(isAdmin ? [{ id: "admin", label: "User Management", icon: Users }] : []),
    { id: "blockchain", label: "Blockchain Ledger", icon: ShieldCheck },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0d0d0f] border-r border-slate-200 dark:border-white/10 flex flex-col min-h-[calc(100vh-5rem)] p-4 space-y-2">
      <div className="p-2 mb-2">
        <h1 className="text-2xl font-serif italic text-slate-900 dark:text-white tracking-tight">Aegis<span className="text-blue-500">ID</span></h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-white/40 mt-1 font-semibold">Blockchain Registry</p>
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-white/30 px-3 py-1 font-semibold">
        Navigation
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                : "text-slate-900 dark:text-white/60 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" : "bg-slate-200 dark:bg-white/10"}`}></div>
            <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-900 dark:text-white/40"}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="pt-6 mt-auto">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs text-slate-900 dark:text-white/50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-900 dark:text-white/40 uppercase tracking-widest">Node Status</span>
            <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-full bg-emerald-500/50 shadow-[0_0_8px_#10b981]"></div>
          </div>
          <p className="text-[11px] text-slate-900 dark:text-white/40 pt-1">Spring Boot + MySQL + EVM</p>
        </div>
      </div>
    </aside>
  );
}
