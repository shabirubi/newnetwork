import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, Calendar, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import LivePlayer from "../components/news/LivePlayer";
import ScheduleCard from "../components/news/ScheduleCard";

export default function Live() {
  const [selectedChannel, setSelectedChannel] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedChannel') || 'all';
    }
    return 'all';
  });

  React.useEffect(() => {
    const handleChannelChange = (e) => {
      setSelectedChannel(e.detail);
    };
    window.addEventListener('channelChange', handleChannelChange);
    return () => window.removeEventListener('channelChange', handleChannelChange);
  }, []);

  const { data: liveStream } = useQuery({
    queryKey: ['live-stream'],
    queryFn: () => base44.entities.LiveStream.filter({ is_active: true }),
    initialData: []
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }),
    initialData: []
  });

  const { data: schedule = [] } = useQuery({
    queryKey: ['broadcast-schedule'],
    queryFn: () => base44.entities.BroadcastSchedule.list('start_time', 20),
    initialData: []
  });

  const defaultStreamUrl = "https://ok.ru/video/10508051226319";
  const activeLive = liveStream[0];
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const channelStreamUrl = currentChannel?.stream_url || (selectedChannel === 'all' ? defaultStreamUrl : null);
  const currentHour = new Date().getHours();

  // Daily schedule based on the document
  const dailySchedule = [
    { time: "09:00", title: "חדשות עכשיו - מהדורת הבוקר", category: "news", isLive: currentHour >= 9 && currentHour < 11 },
    { time: "11:00", title: "פוליטיקה ודרמה", category: "politics", isLive: currentHour >= 11 && currentHour < 13 },
    { time: "13:00", title: "כלכלה ועסקים", category: "economy", isLive: currentHour >= 13 && currentHour < 16 },
    { time: "16:00", title: "ביטחון ומדיניות", category: "security", isLive: currentHour >= 16 && currentHour < 18 },
    { time: "18:00", title: "רשת ותרבות", category: "entertainment", isLive: currentHour >= 18 && currentHour < 21 },
    { time: "21:00", title: "חדשות עכשיו - מהדורת הערב", category: "news", isLive: currentHour >= 21 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">שידור חי</h1>
        </motion.div>
        <p className="text-gray-600 max-w-xl mx-auto">
          צפו בשידורים החיים של הרשת החדשה - חדשות, ניתוחים ותוכניות מיוחדות 24/7
        </p>
      </div>

      {/* Main Live Player */}
      <section className="max-w-5xl mx-auto">
        <LivePlayer 
          title={currentChannel?.name || activeLive?.title || "הרשת החדשה - שידור חי"}
          isLive={true}
          viewerCount={activeLive?.viewer_count || 2847}
          streamUrl={channelStreamUrl}
        />
        
        {/* Live Info Bar */}
        <div className="bg-white rounded-xl p-4 mt-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <Badge className="bg-[#E31E24] text-white mb-2 flex items-center gap-1 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              משודר עכשיו
            </Badge>
            <h2 className="text-xl font-bold">{activeLive?.title || "חדשות עכשיו"}</h2>
          </div>
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>{(activeLive?.viewer_count || 2847).toLocaleString()} צופים</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>שידור רציף</span>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold">לוח שידורים יומי</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <ScheduleCard 
                key={item.id} 
                schedule={item}
                index={index}
              />
            ))
          ) : (
            dailySchedule.map((item, index) => (
              <ScheduleCard 
                key={index} 
                schedule={{
                  title: item.title,
                  start_time: item.time,
                  category: item.category,
                  is_live: item.isLive
                }}
                isActive={item.isLive}
                index={index}
              />
            ))
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "שידור HD",
            description: "איכות תמונה גבוהה במיוחד",
            icon: "📺"
          },
          {
            title: "צפייה מכל מכשיר",
            description: "טלפון, טאבלט או מחשב",
            icon: "📱"
          },
          {
            title: "ללא פרסומות",
            description: "חוויית צפייה נקייה",
            icon: "✨"
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 text-center shadow-sm"
          >
            <span className="text-4xl mb-4 block">{feature.icon}</span>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}