import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Shield, Calendar, Edit2, Save, X,
  Bell, Eye, Camera, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfileModal({ isOpen, onClose, initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", profile_image: "" });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setFormData({ 
        full_name: initialUser.full_name || "",
        profile_image: initialUser.profile_image || ""
      });
      setProfileImage(initialUser.profile_image || null);
    }
  }, [initialUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setProfileImage(file_url);
        setFormData(prev => ({ ...prev, profile_image: file_url }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await base44.auth.updateMe(formData);
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await base44.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-[#0080FF]/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-[#0080FF]/30"
            dir="rtl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-[#0080FF]/30 via-[#0080FF]/10 to-black relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #0080FF 0%, transparent 50%)'
              }}></div>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6 -mt-16 relative z-10">
              <div className="flex flex-col items-center gap-4 mb-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#0080FF] shadow-2xl shadow-[#0080FF]/50">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0080FF] to-[#0066FF] flex items-center justify-center">
                        <span className="text-5xl font-bold text-white">
                          {getInitials(user.full_name)}
                        </span>
                      </div>
                    )}
                    {editing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer hover:bg-black/70 transition-all">
                        <Camera className="w-6 h-6 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'admin' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-green-500 text-white'
                  }`}>
                    <Shield className="w-3 h-3 inline ml-1" />
                    {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                  </div>
                </div>

                {/* User Info */}
                {editing ? (
                  <div className="w-full space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-2 block">שם מלא</label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="שם מלא"
                        className="bg-black/60 border-[#0080FF]/50 text-white"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSave} className="flex-1 bg-[#0080FF] hover:bg-[#0066FF] text-white font-bold">
                        <Save className="w-4 h-4 ml-2" />
                        שמור
                      </Button>
                      <Button onClick={() => setEditing(false)} variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                        <X className="w-4 h-4 ml-2" />
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    <h2 className="text-3xl font-bold text-white mb-2">{user.full_name}</h2>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-[#0080FF]" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-[#0080FF]" />
                        <span className="text-sm">הצטרף ב-{new Date(user.created_date).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setEditing(true)} 
                      className="bg-[#0080FF] hover:bg-[#0066FF] text-white font-bold"
                    >
                      <Edit2 className="w-4 h-4 ml-2" />
                      ערוך פרופיל
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Settings */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-[#0080FF]/20">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#0080FF]" />
                    <div>
                      <p className="text-white font-medium text-sm">התראות</p>
                      <p className="text-xs text-gray-400">עדכונים על חדשות חמות</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#0080FF]/30 text-[#0080FF]">
                    הפעל
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-[#0080FF]/20">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[#0080FF]" />
                    <div>
                      <p className="text-white font-medium text-sm">פרטיות</p>
                      <p className="text-xs text-gray-400">שלוט בנראות הפרופיל</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#0080FF]/30 text-[#0080FF]">
                    נהל
                  </Button>
                </div>
              </div>

              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="w-full bg-red-600 hover:bg-red-700 font-bold"
              >
                <LogOut className="w-4 h-4 ml-2" />
                התנתק
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}