import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tv, Search, Filter, Globe, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const countryLabels = {
  israel: "ישראל",
  russia: "רוסיה",
  usa: "ארצות הברית",
  uk: "בריטניה",
  france: "צרפת",
  other: "אחר"
};

const countryFlags = {
  israel: "🇮🇱",
  russia: "🇷🇺",
  usa: "🇺🇸",
  uk: "🇬🇧",
  france: "🇫🇷",
  other: "🌍"
};

export default function Channels() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['live-channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, '-created_date', 100),
    initialData: []
  });

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || channel.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white">ספריית ערוצי טלוויזיה חיים</h1>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          אוסף של {channels.length} ערוצי טלוויזיה חיים מכל רחבי העולם - צפו חינם בשידור חי באיכות גבוהה
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש ערוץ..."
              className="pr-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="כל המדינות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המדינות</SelectItem>
                {Object.entries(countryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {countryFlags[key]} {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link to={createPageUrl("ChannelsLoader")}>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 w-full md:w-auto">
              <Globe className="w-5 h-5 mr-2" />
              טען ערוצים חדשים
            </Button>
          </Link>
        </div>
      </div>

      {/* Channels Grid */}
      {filteredChannels.length === 0 ? (
        <div className="text-center py-20">
          <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">אין עדיין ערוצים במערכת</h3>
          <p className="text-gray-500 mb-6">טען ערוצי טלוויזיה חיים מכל העולם</p>
          <Link to={createPageUrl("ChannelsLoader")}>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
              <Tv className="w-5 h-5 mr-2" />
              טען 30 ערוצים עכשיו
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`ChannelPlayer?id=${channel.id}`)}>
                <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">
                          {countryFlags[channel.country || 'other']}
                        </div>
                        <Tv className="w-12 h-12 text-gray-600 mx-auto" />
                      </div>
                    </div>
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center">
                        <Play className="w-8 h-8 text-white mr-[-4px]" fill="white" />
                      </div>
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center gap-1 bg-[#E31E24] text-white px-2 py-1 rounded-full text-xs font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        LIVE
                      </div>
                    </div>

                    {/* Country Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {countryLabels[channel.country || 'other']}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-[#E31E24] transition-colors dark:text-white line-clamp-1">
                      {channel.name}
                    </h3>
                    {channel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {channel.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        שידור חי
                      </div>
                      <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                        פעיל
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">
          {filteredChannels.length} ערוצים זמינים
        </h2>
        <p className="text-red-100">
          כל הערוצים בשידור חי וחינמיים לצפייה
        </p>
      </div>
    </div>
  );
}