import React from "react";
import NewsSearch from "../components/apps/NewsSearch";
import LiveStatsApp from "../components/apps/LiveStatsApp";
import NewsQuiz from "../components/apps/NewsQuiz";
import PersonalAlerts from "../components/apps/PersonalAlerts";

export default function TestApps() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          בדיקת אפליקציות
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NewsSearch />
          <LiveStatsApp />
          <NewsQuiz />
          <PersonalAlerts />
        </div>
      </div>
    </div>
  );
}