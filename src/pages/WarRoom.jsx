import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, Shield, Siren, MapPin, Clock, 
  Radio, Bell, AlertCircle, Target, Users, 
  TrendingUp, Activity, Volume2, VolumeX,
  ChevronRight, RefreshCw, Flame, Zap, Play, Pause, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Mock real-time alerts
const mockAlerts = [
  { id: 1, type: "rocket", location: "אשקלון, שדרות", time: "12:34", severity: "critical", status: "active" },
  { id: 2, type: "infiltration", location: "גבול עזה", time: "12:20", severity: "high", status: "active" },
  { id: 3, type: "drone", location: "גליל עליון", time: "12:15", severity: "medium", status: "resolved" },
  { id: 4, type: "earthquake", location: "צפון הארץ", time: "11:45", severity: "low", status: "resolved" },
];

const alertTypes = {
  rocket: { icon: Siren, label: "אזעקת רקטות", color: "bg-red-500" },
  infiltration: { icon: AlertTriangle, label: "חדירה", color: "bg-orange-500" },
  drone: { icon: Target, label: "כטב\"מ", color: "bg-yellow-500" },
  earthquake: { icon: Activity, label: "רעידת אדמה", color: "bg-purple-500" },
  fire: { icon: Flame, label: "שריפה", color: "bg-orange-600" },
  flood: { icon: AlertCircle, label: "הצפה", color: "bg-blue-500" },
};

const severityColors = {
  critical: "bg-red-600 text-white animate-pulse",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
};

export default function WarRoom() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setActiveCount(alerts.filter(a => a.status === "active").length);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [alerts]);

  const refreshAlerts = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 to-red-900 dark:from-black dark:to-red-950 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-pulse">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">חדר מלחמה</h1>
              <p className="text-red-200">מרכז התראות ואזעקות בזמן אמת</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-white/30 text-white hover:bg-white/10"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAlerts}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw size={18} className="ml-2" />
              רענון
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4 text-center">
              <Siren className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{activeCount}</p>
              <p className="text-sm text-red-700 dark:text-red-300">התראות פעילות</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">3</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">אזורים מאוימים</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">12</p>
              <p className="text-sm text-green-700 dark:text-green-300">אירועים שנוטרלו</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1.2M</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">אזרחים מעודכנים</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Alerts */}
      <Card className="border-red-300 dark:border-red-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Siren className="w-5 h-5 animate-pulse" />
              התראות בזמן אמת
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-red-100">
              <Clock size={14} />
              עודכן: {lastUpdate.toLocaleTimeString('he-IL')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AnimatePresence>
            {alerts.map((alert, index) => {
              const alertType = alertTypes[alert.type] || alertTypes.rocket;
              const AlertIcon = alertType.icon;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 border-b dark:border-gray-700 last:border-0 ${
                    alert.status === "active" ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${alertType.color} flex items-center justify-center ${
                    alert.status === "active" ? "animate-pulse" : "opacity-60"
                  }`}>
                    <AlertIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">{alertType.label}</span>
                      <Badge className={severityColors[alert.severity]}>
                        {alert.severity === "critical" ? "קריטי" : 
                         alert.severity === "high" ? "גבוה" :
                         alert.severity === "medium" ? "בינוני" : "נמוך"}
                      </Badge>
                      {alert.status === "active" && (
                        <Badge className="bg-red-600 text-white animate-pulse">פעיל</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Safety Instructions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              הנחיות לאזרחים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-800 dark:text-yellow-300">אזעקת רקטות</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">היכנסו למרחב מוגן תוך 15-90 שניות לפי אזור</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <p className="font-bold text-orange-800 dark:text-orange-300">חשד לחדירה</p>
                <p className="text-sm text-orange-700 dark:text-orange-400">הישארו בבתים, נעלו דלתות וחלונות</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-bold text-blue-800 dark:text-blue-300">הישארו מעודכנים</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">עקבו אחרי עדכונים בערוץ והקשיבו להנחיות פיקוד העורף</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Bell className="w-5 h-5 text-[#E31E24]" />
              קווים חמים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="font-bold text-red-800 dark:text-red-300">מוקד חירום</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">100</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="font-bold text-orange-800 dark:text-orange-300">פיקוד העורף</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">104</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="font-bold text-blue-800 dark:text-blue-300">משטרה</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">100</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-bold text-green-800 dark:text-green-300">מד"א</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">101</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}