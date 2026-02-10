import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Cloud, Users, Send, Paperclip, Mic, Loader2, FileText, Image as ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import ReporterChat from "../apps/ReporterChat";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function WeatherForecastAvatar() {
  const [reporterChatOpen, setReporterChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);



  const weatherAgentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_cim3LvE9&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNRGt3TlRBd01qRTROall3TURjMU9ESTBPVFk2TVVsNFJ6Tk5kelJMWmtSWFZHVTNUREJmTjNkMw==";

  return (
    <>
      <ReporterChat 
        externalIsOpen={reporterChatOpen}
        externalSetIsOpen={setReporterChatOpen}
      />
      <div className="w-full bg-gradient-to-br from-[#001a4d]/80 via-[#0033CC]/70 to-[#0080FF]/60 rounded-3xl overflow-hidden shadow-2xl shadow-[#0080FF]/40 border-2 border-[#0080FF]/60">
      {/* Premium Branded Header */}
      <div className="relative bg-gradient-to-r from-[#0066FF] via-[#0080FF]/90 to-[#0066FF] p-4 sm:p-6 border-b-4 border-[#0080FF]/80 shadow-xl shadow-[#0080FF]/40" style={{ direction: 'rtl' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative flex items-center justify-center gap-4" style={{ direction: 'rtl' }}>
          <motion.img 
            src={LOGO_URL}
            alt="הרשת החדשה"
            className="h-10 sm:h-14 w-auto drop-shadow-2xl"
            animate={{ 
              scale: [1, 1.08, 1],
              filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Cloud className="w-6 h-6 text-white drop-shadow-lg" />
              <h2 className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">תחזיתן הרשת</h2>
            </div>
            <p className="text-white/90 text-xs sm:text-sm">תחזיית מזג אוויר חיה</p>
          </div>
        </div>
      </div>

      {/* Main Content - Avatar + Chat */}
      <div className="flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Avatar Section - Left */}
        <div className="flex-1 relative bg-gradient-to-br from-[#001a4d] via-[#0033CC] to-[#0066FF] border-b-4 lg:border-b-0 lg:border-r-4 border-[#0080FF]/40">
          {/* Avatar Label Top Left */}
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#0080FF] to-[#00D4FF] px-4 py-1.5 rounded-full border-2 border-white/30 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-white font-bold text-xs">ON AIR</span>
            </div>
          </div>

          {/* D-ID Agent Iframe */}
          <iframe
            ref={iframeRef}
            src={weatherAgentUrl}
            allow="microphone; camera; autoplay"
            className="w-full h-full border-0"
            title="Weather Forecast Live Chat"
          />
        </div>

        {/* Chat Panel - Right */}
        <div className="w-full lg:w-96 bg-gradient-to-b from-[#001a4d] via-[#0033CC] to-[#001a4d] flex flex-col">
          <Button
            onClick={() => setReporterChatOpen(true)}
            className="w-full m-4 bg-gradient-to-r from-[#0080FF] to-[#00D4FF] hover:from-[#00D4FF] hover:to-[#0080FF] text-white shadow-lg shadow-[#0080FF]/50"
          >
            <Users className="w-5 h-5 ml-2" />
            פתח צ'אט כתבים
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative bg-gradient-to-r from-[#0066FF] via-[#0080FF]/80 to-[#0066FF] p-3 border-t-4 border-[#00D4FF]/60 shadow-lg shadow-[#0080FF]/40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
        <div className="relative flex items-center justify-center gap-2 text-white text-xs font-bold">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          שידור חי • עדכון אחרון: {new Date().toLocaleTimeString('he-IL')}
        </div>
      </div>
    </div>
    </>
  );
}