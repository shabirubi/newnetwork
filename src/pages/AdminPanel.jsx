import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, DollarSign, Video, Newspaper, 
  Settings, TrendingUp, AlertCircle, Loader2
} from "lucide-react";
import { motion } from "framer-motion";

import AdminDashboard from "../components/admin/AdminDashboard";
import AdminUsers from "../components/admin/AdminUsers";
import AdminFinance from "../components/admin/AdminFinance";
import AdminContent from "../components/admin/AdminContent";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminSettings from "../components/admin/AdminSettings";
import AdminNotes from "../components/admin/AdminNotes";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check admin authentication from localStorage
        const adminAuth = localStorage.getItem('admin_authenticated');
        const authTime = localStorage.getItem('admin_auth_time');
        
        // Session expires after 24 hours
        const isSessionValid = adminAuth === 'true' && 
          authTime && 
          (Date.now() - parseInt(authTime)) < 24 * 60 * 60 * 1000;
        
        if (!isSessionValid) {
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_auth_time');
          window.location.href = '/';
          return;
        }

        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_auth_time');
          window.location.href = '/';
          return;
        }
        setUser(userData);
      } catch {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { id: 'users', label: 'משתמשים', icon: Users },
    { id: 'finance', label: 'כספים', icon: DollarSign },
    { id: 'content', label: 'תוכן', icon: Video },
    { id: 'analytics', label: 'אנליטיקס', icon: TrendingUp },
    { id: 'notes', label: 'הערות מנהלים', icon: AlertCircle },
    { id: 'settings', label: 'הגדרות', icon: Settings },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <AdminUsers />;
      case 'finance': return <AdminFinance />;
      case 'content': return <AdminContent />;
      case 'analytics': return <AdminAnalytics />;
      case 'notes': return <AdminNotes />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-black/50 backdrop-blur-xl border-l border-gray-800 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">פאנל ניהול</h1>
            <p className="text-gray-400 text-sm">{user?.full_name}</p>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#E31E24] text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}