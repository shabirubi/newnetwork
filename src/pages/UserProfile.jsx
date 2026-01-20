import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { 
  User, Mail, Shield, Calendar, Edit2, Save, X,
  Settings, Bell, Eye, Heart, BookMarked, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "" });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({ full_name: userData.full_name || "" });
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await base44.auth.updateMe(formData);
      await loadUser();
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">לא מחובר</h2>
          <p className="text-gray-400">נא להתחבר כדי לצפות בפרופיל</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black via-[#E31E24]/20 to-black border border-[#E31E24]/30 rounded-2xl p-8 mb-6 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#E31E24]">
                <AvatarFallback className="text-2xl font-bold bg-[#E31E24] text-white">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <Badge 
                className={`absolute bottom-2 right-2 ${
                  user.role === 'admin' 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-blue-500 text-white'
                }`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {user.role === 'admin' ? 'מנהל' : 'משתמש'}
              </Badge>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-right">
              {editing ? (
                <div className="space-y-4">
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="שם מלא"
                    className="bg-black/60 border-[#E31E24]/30 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-[#E31E24] hover:bg-[#B91C1C]">
                      <Save className="w-4 h-4 mr-2" />
                      שמור
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" className="border-white/20 text-white">
                      <X className="w-4 h-4 mr-2" />
                      ביטול
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.full_name}</h1>
                  <div className="flex flex-col md:flex-row items-center gap-4 text-gray-400 mb-4">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      הצטרף: {new Date(user.created_date).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <Button 
                    onClick={() => setEditing(true)} 
                    className="bg-black/60 border border-white/20 text-white hover:bg-black/80"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    ערוך פרופיל
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-black/60 border border-white/20">
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#E31E24]">
              <Clock className="w-4 h-4 mr-2" />
              פעילות אחרונה
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-[#E31E24]">
              <Heart className="w-4 h-4 mr-2" />
              מועדפים
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#E31E24]">
              <BookMarked className="w-4 h-4 mr-2" />
              שמורים
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#E31E24]">
              <Settings className="w-4 h-4 mr-2" />
              הגדרות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-black/60 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">פעילות אחרונה</CardTitle>
                  <CardDescription className="text-gray-400">
                    היסטוריית הפעילות שלך באתר
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>אין פעילות אחרונה להצגה</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="favorites">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-black/60 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">מועדפים</CardTitle>
                  <CardDescription className="text-gray-400">
                    הכתבות והתכנים שסימנת כמועדפים
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>לא סימנת עדיין פריטים כמועדפים</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="saved">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-black/60 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">שמורים</CardTitle>
                  <CardDescription className="text-gray-400">
                    תכנים ששמרת לקריאה מאוחרת
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-400">
                    <BookMarked className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>אין לך פריטים שמורים</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-black/60 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">הגדרות</CardTitle>
                  <CardDescription className="text-gray-400">
                    נהל את הגדרות החשבון שלך
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#E31E24]" />
                      <div>
                        <p className="text-white font-medium">התראות</p>
                        <p className="text-sm text-gray-400">קבל עדכונים על חדשות חמות</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white">
                      הפעל
                    </Button>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-[#E31E24]" />
                      <div>
                        <p className="text-white font-medium">פרטיות</p>
                        <p className="text-sm text-gray-400">שלוט בנראות הפרופיל שלך</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white">
                      נהל
                    </Button>
                  </div>

                  {/* Logout */}
                  <Button 
                    onClick={() => base44.auth.logout()}
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    התנתק
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}