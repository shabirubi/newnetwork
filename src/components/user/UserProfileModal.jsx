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
            className="relative bg-black rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            dir="rtl"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 #000' }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header Banner */}
            <div className="h-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
            </div>

            {/* Profile Content */}
            <div className="px-4 pb-4 -mt-10 relative z-10">
              <div className="flex flex-col items-center gap-3 mb-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-xl">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {getInitials(user.full_name)}
                        </span>
                      </div>
                    )}
                    {editing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer hover:bg-black/70 transition-all">
                        <Camera className="w-4 h-4 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
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
                        className="bg-gray-900 border-0 text-white"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSave} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold">
                        <Save className="w-4 h-4 ml-2" />
                        שמור
                      </Button>
                      <Button onClick={() => setEditing(false)} variant="outline" className="flex-1 border-0 text-white hover:bg-gray-900">
                        <X className="w-4 h-4 ml-2" />
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    <h2 className="text-xl font-bold text-white mb-2">{user.full_name}</h2>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">הצטרף ב-{new Date(user.created_date).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(true)} 
                      className="py-2 px-4 rounded-lg font-bold text-white transition-all relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)',
                        backgroundSize: '200% 100%',
                        animation: 'rainbow 8s linear infinite',
                      }}
                    >
                      <Edit2 className="w-4 h-4 inline ml-2" />
                      ערוך פרופיל
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Settings */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-white font-medium text-xs">התראות</p>
                      <p className="text-[10px] text-gray-400">עדכונים חמים</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-0 text-white text-xs h-7 px-2 hover:bg-gray-800">
                    הפעל
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-white font-medium text-xs">פרטיות</p>
                      <p className="text-[10px] text-gray-400">נראות הפרופיל</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-0 text-white text-xs h-7 px-2 hover:bg-gray-800">
                    נהל
                  </Button>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-lg font-bold text-white transition-all relative overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)',
                  backgroundSize: '200% 100%',
                  animation: 'rainbow 8s linear infinite',
                }}
              >
                <LogOut className="w-4 h-4 inline ml-2" />
                התנתק
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}