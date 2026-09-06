import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AiAssistantModal } from "./components/AiAssistantModal";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IdentityPage } from "./pages/IdentityPage";
import { CredentialsPage } from "./pages/CredentialsPage";
import { AssetsPage } from "./pages/AssetsPage";
import { VerificationPage } from "./pages/VerificationPage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { BlockchainPage } from "./pages/BlockchainPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { VerifyAssetPage } from "./pages/VerifyAssetPage";

function MainContent() {
  const { user, loading } = useAuth();
  
  // Initialize tab from pathname (e.g. "/verify-asset" -> "verify-asset")
  const initialTab = window.location.pathname.replace('/', '') || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Sync pathname when activeTab changes
  React.useEffect(() => {
    if (activeTab === "dashboard" && window.location.pathname !== "/") {
      window.history.pushState({}, '', '/');
    } else if (activeTab !== "dashboard" && window.location.pathname !== `/${activeTab}`) {
      // Keep query string if it exists
      window.history.pushState({}, '', `/${activeTab}${window.location.search}`);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? <LoginPage /> : <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08080a] text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar onOpenAiModal={() => setIsAiModalOpen(true)} setActiveTab={setActiveTab} />
      
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <DashboardPage />}
            {activeTab === "identity" && <IdentityPage />}
            {activeTab === "credentials" && <CredentialsPage />}
            {activeTab === "assets" && <AssetsPage />}
            {activeTab === "verify-asset" && <VerifyAssetPage />}
            {activeTab === "verification" && <VerificationPage />}
            {activeTab === "organizations" && <OrganizationsPage />}
            {activeTab === "admin" && <AdminUsersPage />}
            {activeTab === "blockchain" && <BlockchainPage />}
            {activeTab === "audit" && <AuditLogsPage />}
            {activeTab === "profile" && <ProfilePage />}
            {activeTab === "notifications" && <NotificationsPage />}
          </div>
        </main>
      </div>

      <AiAssistantModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
}

import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
