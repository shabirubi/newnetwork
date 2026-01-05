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

// Professional daily schedules per day
const schedulesByDay = {
  sunday: [
    { start_time: "06:00", end_time: "09:00", title: "חדשות הבוקר", category: "news", host: "רונית שקד ודני לוי", description: "פתיחת השבוע עם כל העדכונים החמים" },
    { start_time: "09:00", end_time: "11:00", title: "מבט ביטחוני", category: "security", host: "רון חיימי", description: "סקירה ביטחונית שבועית" },
    { start_time: "11:00", end_time: "13:00", title: "כלכלה בשידור חי", category: "economy", host: "שירה לוי", description: "פתיחת שבוע המסחר בבורסה" },
    { start_time: "13:00", end_time: "15:00", title: "מהדורת הצהריים", category: "news", host: "נועה כהן", description: "סיכום חצי היום" },
    { start_time: "15:00", end_time: "17:00", title: "פוליטיקה ללא צנזורה", category: "politics", host: "אור רביבו", description: "סקירת הזירה הפוליטית" },
    { start_time: "17:00", end_time: "19:00", title: "חדשות אחר הצהריים", category: "news", host: "עדי מזרחי", description: "עדכונים שוטפים" },
    { start_time: "19:00", end_time: "21:00", title: "מהדורת הערב המרכזית", category: "news", host: "רונית שקד ודני לוי", description: "המהדורה המרכזית" },
    { start_time: "21:00", end_time: "23:00", title: "הסטודיו המרכזי", category: "special", host: "יניב בן דוד", description: "ניתוח מעמיק" },
    { start_time: "23:00", end_time: "01:00", title: "מהדורת הלילה", category: "news", host: "מיכל אבני", description: "סיכום היום" },
  ],
  monday: [
    { start_time: "06:00", end_time: "09:00", title: "חדשות הבוקר", category: "news", host: "רונית שקד", description: "כל העדכונים מהלילה והבוקר" },
    { start_time: "09:00", end_time: "11:00", title: "טכנולוגיה וחדשנות", category: "technology", host: "תומר דוד", description: "החידושים הטכנולוגיים בעולם" },
    { start_time: "11:00", end_time: "13:00", title: "בריאות בשידור חי", category: "special", host: "מיכל אבני", description: "מומחים עונים על שאלות בריאות" },
    { start_time: "13:00", end_time: "15:00", title: "מהדורת הצהריים", category: "news", host: "נועה כהן", description: "עדכונים מהשטח" },
    { start_time: "15:00", end_time: "17:00", title: "כלכלה יומית", category: "economy", host: "שירה לוי", description: "סיכום יום המסחר" },
    { start_time: "17:00", end_time: "19:00", title: "חדשות אחר הצהריים", category: "news", host: "עדי מזרחי", description: "עדכונים שוטפים" },
    { start_time: "19:00", end_time: "21:00", title: "מהדורת הערב המרכזית", category: "news", host: "דני לוי", description: "כל החדשות היומיות" },
    { start_time: "21:00", end_time: "23:00", title: "ריאיון מיוחד", category: "special", host: "יניב בן דוד", description: "ראיון עומק עם אורח מיוחד" },
    { start_time: "23:00", end_time: "01:00", title: "מהדורת הלילה", category: "news", host: "מיכל אבני", description: "סיכום היום" },
  ],
  tuesday: [
    { start_time: "06:00", end_time: "09:00", title: "חדשות הבוקר", category: "news", host: "רונית שקד ודני לוי", description: "פתיחת הבוקר" },
    { start_time: "09:00", end_time: "11:00", title: "מבט ביטחוני מורחב", category: "security", host: "רון חיימי", description: "ניתוח אירועי השבוע" },
    { start_time: "11:00", end_time: "13:00", title: "ספורט בוקר", category: "sports", host: "יואב שמעון", description: "סיכום ספורט וסקירות" },
    { start_time: "13:00", end_time: "15:00", title: "מהדורת הצהריים", category: "news", host: "נועה כהן", description: "עדכוני צהריים" },
    { start_time: "15:00", end_time: "17:00", title: "עולם ומדינה", category: "politics", host: "רותם אלון", description: "חדשות מהעולם" },
    { start_time: "17:00", end_time: "19:00", title: "חדשות אחר הצהריים", category: "news", host: "עדי מזרחי", description: "עדכונים שוטפים" },
    { start_time: "19:00", end_time: "21:00", title: "מהדורת הערב המרכזית", category: "news", host: "רונית שקד ודני לוי", description: "המהדורה המרכזית" },
    { start_time: "21:00", end_time: "23:00", title: "תחקיר מיוחד", category: "special", host: "אור רביבו", description: "חשיפות בלעדיות" },
    { start_time: "23:00", end_time: "01:00", title: "מהדורת הלילה", category: "news", host: "מיכל אבני", description: "סיכום היום" },
  ],
  wednesday: [
    { start_time: "06:00", end_time: "09:00", title: "חדשות הבוקר", category: "news", host: "רונית שקד", description: "בוקר חדשותי" },
    { start_time: "09:00", end_time: "11:00", title: "כלכלה גלובלית", category: "economy", host: "שירה לוי", description: "שווקים עולמיים" },
    { start_time: "11:00", end_time: "13:00", title: "טכנולוגיה ומדע", category: "technology", host: "תומר דוד", description: "חידושים מדעיים" },
    { start_time: "13:00", end_time: "15:00", title: "מהדורת הצהריים", category: "news", host: "נועה כהן", description: "חדשות הצהריים" },
    { start_time: "15:00", end_time: "17:00", title: "פאנל פוליטי", category: "politics", host: "אור רביבו", description: "דיון עם פוליטיקאים" },
    { start_time: "17:00", end_time: "19:00", title: "חדשות אחר הצהריים", category: "news", host: "עדי מזרחי", description: "עדכונים שוטפים" },
    { start_time: "19:00", end_time: "21:00", title: "מהדורת הערב המרכזית", category: "news", host: "דני לוי", description: "חדשות הערב" },
    { start_time: "21:00", end_time: "23:00", title: "הסטודיו המרכזי", category: "special", host: "יניב בן דוד", description: "ניתוח השבוע" },
    { start_time: "23:00", end_time: "01:00", title: "מהדורת הלילה", category: "news", host: "מיכל אבני", description: "סיכום היום" },
  ],
  thursday: [
    { start_time: "06:00", end_time: "09:00", title: "חדשות הבוקר", category: "news", host: "רונית שקד ודני לוי", description: "פתיחת הבוקר" },
    { start_time: "09:00", end_time: "11:00", title: "מבט ביטחוני", category: "security", host: "רון חיימי", description: "סקירה ביטחונית" },
    { start_time: "11:00", end_time: "13:00", title: "ספורט ישראלי", category: "sports", host: "יואב שמעון", description: "לקראת סוף השבוע הספורטיבי" },
    { start_time: "13:00", end_time: "15:00", title: "מהדורת הצהריים", category: "news", host: "נועה כהן", description: "עדכוני צהריים" },
    { start_time: "15:00", end_time: "17:00", title: "כלכלה ושוק ההון", category: "economy", host: "שירה לוי", description: "סיכום שבועי" },
    { start_time: "17:00", end_time: "19:00", title: "חדשות אחר הצהריים", category: "news", host: "עדי מזרחי", description: "עדכונים שוטפים" },
    { start_time: "19:00", end_time: "21:00", title: "מהדורת הערב המרכזית", category: "news", host: "רונית שקד ודני לוי", description: "המהדורה המרכזית" },
    { start_time: "21:00", end_time: "23:00", title: "סיכום שבועי", category: "special", host: "יניב בן דוד", description: "סקירת אירועי השבוע" },
    { start_time: "23:00", end_time: "01:00", title: "מהדורת הלילה", category: "news", host: "מיכל אבני", description: "סיכום היום" },
  ],
  friday: [
    { start_time: "06:00", end_time: "09:00", title: "חדשות הבוקר", category: "news", host: "רונית שקד", description: "בוקר יום שישי" },
    { start_time: "09:00", end_time: "11:00", title: "מבט שבועי", category: "special", host: "יניב בן דוד", description: "סיכום השבוע" },
    { start_time: "11:00", end_time: "13:00", title: "ספורט סוף שבוע", category: "sports", host: "יואב שמעון", description: "לקראת המשחקים" },
    { start_time: "13:00", end_time: "15:00", title: "מהדורת הצהריים", category: "news", host: "נועה כהן", description: "חדשות לפני שבת" },
    { start_time: "15:00", end_time: "17:00", title: "תרבות ובידור", category: "entertainment", host: "עדי מזרחי", description: "מה עושים בסופ\"ש" },
    { start_time: "17:00", end_time: "19:00", title: "מהדורה מקוצרת", category: "news", host: "דני לוי", description: "עדכונים אחרונים" },
    { start_time: "19:00", end_time: "22:00", title: "שידורי שבת", category: "special", host: "שידור אוטומטי", description: "תכנים מיוחדים" },
  ],
  saturday: [
    { start_time: "08:00", end_time: "10:00", title: "בוקר שבת", category: "special", host: "שידור מוקלט", description: "תכנים מיוחדים לשבת" },
    { start_time: "10:00", end_time: "12:00", title: "דוקומנטרי", category: "special", host: "", description: "סרט תיעודי מיוחד" },
    { start_time: "12:00", end_time: "14:00", title: "ספורט בינלאומי", category: "sports", host: "יואב שמעון", description: "ליגות מובילות" },
    { start_time: "14:00", end_time: "16:00", title: "סרטים", category: "entertainment", host: "", description: "קולנוע ישראלי" },
    { start_time: "16:00", end_time: "18:00", title: "תרבות ואומנות", category: "entertainment", host: "עדי מזרחי", description: "אירועי תרבות" },
    { start_time: "18:00", end_time: "20:00", title: "מוצ\"ש חדשות", category: "news", host: "נועה כהן", description: "חזרה לשגרה" },
    { start_time: "20:00", end_time: "22:00", title: "מהדורת הערב", category: "news", host: "רונית שקד", description: "סיכום סוף השבוע" },
    { start_time: "22:00", end_time: "00:00", title: "הסטודיו", category: "special", host: "יניב בן דוד", description: "הכנה לשבוע החדש" },
  ],
};

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

  // Filter schedule by day - use database or fallback to local schedules
  const daySchedule = schedule.filter(s => s.day_of_week === selectedDay);
  const displaySchedule = daySchedule.length > 0 ? daySchedule : (schedulesByDay[selectedDay] || schedulesByDay.sunday);

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
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex-wrap h-auto gap-1">
            {daysOfWeek.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className={`rounded-xl px-5 py-2.5 transition-all duration-300 data-[state=active]:bg-[#E31E24] data-[state=active]:text-white data-[state=active]:shadow-lg dark:text-gray-300 ${
                  day.id === todayId ? "font-bold ring-2 ring-[#E31E24]/30" : ""
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{day.label}</span>
                  {day.id === todayId && (
                    <span className="text-[10px] opacity-80">(היום)</span>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Selected Day Indicator */}
      <motion.div 
        key={selectedDay}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4" />
          לוח שידורים ליום {daysOfWeek.find(d => d.id === selectedDay)?.label}
          {selectedDay !== todayId && " (לא היום)"}
        </span>
      </motion.div>

      {/* Schedule List */}
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-3">
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