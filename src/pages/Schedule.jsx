import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ScheduleCard from "../components/news/ScheduleCard";

const daysOfWeek = [
  { id: "sunday", label: "ראשון" },
  { id: "monday", label: "שני" },
  { id: "tuesday", label: "שלישי" },
  { id: "wednesday", label: "רביעי" },
  { id: "thursday", label: "חמישי" },
  { id: "friday", label: "שישי" },
  { id: "saturday", label: "שבת" }
];

// Default schedule based on the documents
const defaultSchedule = [
  { start_time: "09:00", end_time: "11:00", title: "חדשות עכשיו - מהדורת הבוקר", category: "news", description: "פיגוע/אירוע ביטחוני, החלטה דרמטית, אירוס חדש, מהפכה דיווחים של היום שהיה" },
  { start_time: "11:00", end_time: "13:00", title: "פוליטיקה ודרמה", category: "politics", description: "מאבקי כח, אלימות/פשיעה, פרשות שחיתות, תיקים בתפקיד, סיפורים אנושיים קשים" },
  { start_time: "13:00", end_time: "16:00", title: "כלכלה ועסקים", category: "economy", description: "עליית מחירים, קניות, בנקים, אוכל, השקעות ונכסים" },
  { start_time: "16:00", end_time: "18:00", title: "ביטחון ומדיניות", category: "security", description: "צה\"ל, פיגועים, החלטות ממשלה, מתיחות ביטחונית, כנסת וחקיקה, הצמת מזה\"ת" },
  { start_time: "18:00", end_time: "21:00", title: "רשת ותרבות", category: "entertainment", description: "בדיקת שמועות/פייק, ביקורות השקריים, טכנולוגיה ומדע" },
  { start_time: "21:00", end_time: "23:00", title: "חדשות עכשיו - מהדורת הערב", category: "news", description: "סיכום היום בישראל ובעולם" }
];

export default function Schedule() {
  const today = new Date().getDay();
  const todayId = daysOfWeek[today].id;
  const [selectedDay, setSelectedDay] = useState(todayId);

  const { data: schedule = [] } = useQuery({
    queryKey: ['full-schedule'],
    queryFn: () => base44.entities.BroadcastSchedule.list('start_time', 100),
    initialData: []
  });

  const currentHour = new Date().getHours();
  const isToday = selectedDay === todayId;

  // Filter schedule by day or use default
  const daySchedule = schedule.filter(s => s.day_of_week === selectedDay);
  const displaySchedule = daySchedule.length > 0 ? daySchedule : defaultSchedule;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">לוח שידורים</h1>
        </div>
        <p className="text-gray-600 max-w-xl mx-auto">
          לוח השידורים השבועי של הרשת החדשה - צפו בתוכניות שלנו לאורך כל היום
        </p>
      </motion.div>

      {/* Day Selector */}
      <div className="flex justify-center">
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="bg-gray-100 p-1 rounded-full flex-wrap h-auto">
            {daysOfWeek.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className={`rounded-full px-4 py-2 data-[state=active]:bg-[#E31E24] data-[state=active]:text-white ${
                  day.id === todayId ? "font-bold" : ""
                }`}
              >
                {day.label}
                {day.id === todayId && (
                  <span className="mr-1 text-xs">(היום)</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Schedule List */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {displaySchedule.map((item, index) => {
            const startHour = parseInt(item.start_time.split(':')[0]);
            const endHour = item.end_time ? parseInt(item.end_time.split(':')[0]) : startHour + 2;
            const isActive = isToday && currentHour >= startHour && currentHour < endHour;

            return (
              <ScheduleCard 
                key={item.id || index} 
                schedule={item}
                isActive={isActive}
                index={index}
              />
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-100 rounded-2xl p-6 text-center">
        <Clock className="w-10 h-10 text-[#E31E24] mx-auto mb-4" />
        <h3 className="font-bold text-lg mb-2">שידורים 24/7</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          הרשת החדשה משדרת לכם חדשות, ניתוחים ותוכניות מיוחדות לאורך כל היום, כל יום
        </p>
      </div>
    </div>
  );
}