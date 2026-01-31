import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { 
  User, Mail, Shield, Calendar, Edit2, Save, X,
  Settings, Bell, Eye, Heart, BookMarked, Clock, Upload, Camera, CreditCard, RefreshCw, Zap
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
  const [formData, setFormData] = useState({ full_name: "", profile_image: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadUser();
    logLogin();
  }, []);

  const loadSubscription = async (email) => {
    try {
      const subs = await base44.entities.Subscription.filter(
        { user_email: email, status: "active" },
        "-created_date",
        1
      );
      if (subs && subs.length > 0) {
        setSubscription(subs[0]);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const logLogin = async () => {
    try {
      await base44.functions.invoke('logUserLogin', {});
    } catch (error) {
      console.error('Failed to log login:', error);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({ 
        full_name: userData.full_name || "",
        profile_image: userData.profile_image || ""
      });
      if (userData.profile_image) {
        setProfileImage(userData.profile_image);
      }
      await loadSubscription(userData.email);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

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
      // שלח הודעת עדכון פרופיל
      await base44.integrations.Core.SendEmail({
        to: 'seyorlayla@gmail.com',
        subject: `✏️ עדכון פרופיל - ${formData.full_name}`,
        body: `משתמש עדכן את פרופילו!\n\n📧 אימייל: ${user.email}\n👤 שם חדש: ${formData.full_name}\n🕐 זמן: ${new Date().toLocaleString('he-IL')}`
      });
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Large Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-[#E31E24]/40 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-[#E31E24]/20"
        >
          {/* Background Banner */}
          <div className="h-40 bg-gradient-to-r from-[#E31E24]/30 via-[#E31E24]/10 to-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #E31E24 0%, transparent 50%)'
            }}></div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              {/* Avatar - Large */}
              <div className="relative flex-shrink-0">
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-[#E31E24] shadow-2xl shadow-[#E31E24]/50">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                  )}
                  {editing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer hover:bg-black/70 transition-all">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Camera className="w-8 h-8" />
                        <span className="text-xs font-semibold">שינוי תמונה</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <Badge 
                  className={`absolute -bottom-2 left-0 ${
                    user.role === 'admin' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-green-500 text-white'
                  } px-3 py-1 shadow-lg`}
                >
                  <Shield className="w-3 h-3 ml-1" />
                  {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                </Badge>
              </div>

              {/* User Info - Right Side */}
              <div className="flex-1">
                {editing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-2 block">שם מלא</label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="שם מלא"
                        className="bg-black/60 border-[#E31E24]/50 text-white text-lg"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSave} className="bg-[#E31E24] hover:bg-[#B91C1C] text-white font-bold">
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                      </Button>
                      <Button onClick={() => setEditing(false)} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        <X className="w-4 h-4 ml-2" />
                        ביטול
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-white mb-3">{user.full_name}</h1>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Mail className="w-5 h-5 text-[#E31E24]" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Calendar className="w-5 h-5 text-[#E31E24]" />
                        <span>הצטרף ב-{new Date(user.created_date).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setEditing(true)} 
                      className="bg-[#E31E24] hover:bg-[#B91C1C] text-white font-bold"
                    >
                      <Edit2 className="w-4 h-4 ml-2" />
                      ערוך פרופיל
                    </Button>
                  </>
                )}
              </div>
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
             {/* Subscription Card */}
             {subscription && (
               <Card className="bg-gradient-to-br from-blue-900/40 to-blue-900/20 border-blue-500/40 mb-6">
                 <CardHeader>
                   <CardTitle className="text-blue-300 flex items-center gap-2">
                     <Zap className="w-5 h-5" />
                     מידע המנוי שלך
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid md:grid-cols-2 gap-4">
                     <div className="bg-black/40 p-4 rounded-lg border border-blue-500/30">
                       <p className="text-xs text-gray-400 mb-1">סוג המנוי</p>
                       <p className="text-white font-bold">{subscription.plan_type === 'monthly' ? '💳 חודשי' : '📅 שנתי'}</p>
                     </div>
                     <div className="bg-black/40 p-4 rounded-lg border border-blue-500/30">
                       <p className="text-xs text-gray-400 mb-1">סטטוס</p>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         <p className="text-white font-bold text-green-400">פעיל</p>
                       </div>
                     </div>
                     {subscription.end_date && (
                       <div className="bg-black/40 p-4 rounded-lg border border-blue-500/30">
                         <p className="text-xs text-gray-400 mb-1">תוקף עד</p>
                         <p className="text-white font-bold">{new Date(subscription.end_date).toLocaleDateString('he-IL')}</p>
                       </div>
                     )}
                     <div className="bg-black/40 p-4 rounded-lg border border-blue-500/30">
                       <p className="text-xs text-gray-400 mb-1">חידוש אוטומטי</p>
                       <p className="text-white font-bold">{subscription.auto_renew ? '✅ מופעל' : '❌ מבוטל'}</p>
                     </div>
                   </div>
                   <div className="flex gap-3">
                     <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                       <CreditCard className="w-4 h-4" />
                       עדכן כרטיס אשראי
                     </button>
                     <button className="flex-1 bg-blue-600/50 hover:bg-blue-600/70 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                       <RefreshCw className="w-4 h-4" />
                       חדש עכשיו
                     </button>
                   </div>
                 </CardContent>
               </Card>
             )}

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
                    onClick={async () => {
                      try {
                        // שלח הודעת התנתקות
                        await base44.integrations.Core.SendEmail({
                          to: 'seyorlayla@gmail.com',
                          subject: `👋 התנתקות - ${user.full_name || user.email}`,
                          body: `משתמש התנתק בהצלחה!\n\n📧 אימייל: ${user.email}\n🕐 זמן: ${new Date().toLocaleString('he-IL')}`
                        });
                      } catch (error) {
                        console.error('Failed to send logout email:', error);
                      }
                      // נקה את כל הנתונים המקומיים
                      localStorage.clear();
                      sessionStorage.clear();
                      base44.auth.logout();
                    }}
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