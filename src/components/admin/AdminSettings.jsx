import React from "react";
import { Settings, Database, Bell, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">הגדרות מערכת</h2>
        <p className="text-gray-400">ניהול הגדרות כלליות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">ניהול מסד נתונים</h3>
          </div>
          <p className="text-gray-400 mb-4">ניקוי וגיבוי מסד נתונים</p>
          <Button variant="outline" className="w-full bg-gray-700 border-gray-600">
            גיבוי מסד נתונים
          </Button>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">התראות</h3>
          </div>
          <p className="text-gray-400 mb-4">ניהול התראות מערכת</p>
          <Button variant="outline" className="w-full bg-gray-700 border-gray-600">
            הגדרות התראות
          </Button>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">אבטחה</h3>
          </div>
          <p className="text-gray-400 mb-4">הגדרות אבטחה וגישה</p>
          <Button variant="outline" className="w-full bg-gray-700 border-gray-600">
            הגדרות אבטחה
          </Button>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">ביצועים</h3>
          </div>
          <p className="text-gray-400 mb-4">אופטימיזציה וביצועים</p>
          <Button variant="outline" className="w-full bg-gray-700 border-gray-600">
            אופטימיזציה
          </Button>
        </div>
      </div>
    </div>
  );
}