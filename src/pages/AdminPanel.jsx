import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, DollarSign, Video, Newspaper, 
  Settings, TrendingUp, AlertCircle, Loader2, Sparkles,
  Film, Clapperboard, Wand2, MessageCircle, Camera
} from "lucide-react";
import DIDLiveChat from "../components/avatar/DIDLiveChat";
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
  const [didChatOpen, setDidChatOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (err) {
        // If not authenticated, create a mock admin user
        setUser({ full_name: 'מנהל', role: 'admin' });
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
    { id: 'didchat', label: 'צ\'אט D-ID לייב', icon: MessageCircle, isAction: true },
    { id: 'creator', label: 'יוצר AI', icon: Sparkles, isExternal: true, url: '/VideoCreator' },
    { id: 'editor', label: 'עורך מתקדם', icon: Film, isExternal: true, url: '/VideoEditor' },
    { id: 'luma', label: 'Luma AI', icon: Clapperboard, isExternal: true, url: '/LumaStudio' },
    { id: 'tomoviee', label: 'ToMoviee', icon: Video, isExternal: true, url: '/ToMovieeStudio' },
    { id: 'design', label: 'AI Design', icon: Wand2, isExternal: true, url: '/AIDesignStudio' },
    { id: 'avatar', label: 'Avatar Studio', icon: Camera, isExternal: true, url: '/AvatarStudio' },
    { id: 'animation', label: 'אנימציה', icon: Film, isExternal: true, url: '/AnimationStudio' },
    { id: 'broadcast', label: 'אולפן שידור', icon: Video, isExternal: true, url: '/BroadcastStudio' },
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
              
              if (tab.isAction) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDidChatOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-green-400 hover:bg-green-600/20 transition-all border border-green-500/30"
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              }
              
              if (tab.isExternal) {
                return (
                  <a
                    key={tab.id}
                    href={tab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-purple-400 hover:bg-purple-600/20 transition-all border border-purple-500/30"
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </a>
                );
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#00D4FF] text-black shadow-lg'
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

      {/* D-ID Live Chat */}
      <DIDLiveChat isOpen={didChatOpen} onClose={() => setDidChatOpen(false)} />
    </div>
  );
}