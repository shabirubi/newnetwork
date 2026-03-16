import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, ChevronLeft, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import ShareButtons from "../shared/ShareButtons";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

const categoryLabels = {
  breaking: "חדשות חמות",
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות"
};

const categoryColors = {
  breaking: "bg-[#E31E24] text-white",
  security: "bg-[#222] text-white border border-gray-700",
  economy: "bg-[#222] text-white border border-gray-700",
  politics: "bg-[#222] text-white border border-gray-700",
  technology: "bg-[#222] text-white border border-gray-700",
  sports: "bg-[#222] text-white border border-gray-700",
  entertainment: "bg-[#222] text-white border border-gray-700",
  world: "bg-[#222] text-white border border-gray-700",
  health: "bg-[#222] text-white border border-gray-700"
};

export default function NewsCard({ article, variant, index }) {
  const safeVariant = variant || "default";
  const safeIndex = index || 0;
  const articleData = article || {};
  const articleId = articleData.id;
  const title = articleData.title;
  const subtitle = articleData.subtitle;
  const category = articleData.category;
  const image_url = articleData.image_url;
  const video_url = articleData.video_url;
  const is_breaking = articleData.is_breaking;
  const created_date = articleData.created_date;

  if (safeVariant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: safeIndex * 0.1 }}
        className="group relative overflow-hidden rounded-lg sm:rounded-2xl bg-black border border-[#222] hover:border-[#444] transition-all duration-300"
      >
        <Link to={`/Article?id=${articleId}`} className="block active:scale-[0.98] transition-transform">
          <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gray-900">
            {video_url ? (
              <>
                <video
                  src={video_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => e.target.pause()}
                />
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[#E31E24] text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1">
                  <Play size={10} fill="white" />
                  וידאו
                </div>
              </>
            ) : image_url ? (
              <img src={image_url} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-[#111] flex items-center justify-center">
                <span className="text-gray-700 text-5xl sm:text-6xl font-bold">📺</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/70 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <img src={LOGO_URL} alt="הרשת החדשה" className="h-7 w-auto" />
              <span className="text-white text-sm font-bold">הרשת החדשה</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                {is_breaking && (
                  <Badge className="bg-[#E31E24] text-white flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={14} />
                    חדשות חמות
                  </Badge>
                )}
                <Badge className={categoryColors[category]}>{categoryLabels[category]}</Badge>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-[#FF6600] mb-3 group-hover:text-[#FF8C00] transition-colors">{title}</h2>
              {subtitle && <p className="text-gray-300 text-lg md:text-xl mb-4 line-clamp-2">{subtitle}</p>}
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {moment(created_date).fromNow()}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (safeVariant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: safeIndex * 0.05 }}
        className="group"
      >
        <Link to={`/Article?id=${articleId}`} className="flex items-start gap-4 p-4 rounded-2xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors active:scale-[0.98]">
          <span className="text-3xl font-bold text-gray-200 group-hover:text-white transition-colors">
            {String(safeIndex + 1).padStart(2, '0')}
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-white transition-colors line-clamp-2">{title}</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Badge variant="secondary" className="text-xs">{categoryLabels[category]}</Badge>
              <span>{moment(created_date).fromNow()}</span>
            </div>
          </div>
          <ChevronLeft size={20} className="text-gray-400 group-hover:text-white transition-colors shrink-0" />
        </Link>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: safeIndex * 0.1 }}
      className="group bg-[#181818] rounded-xl sm:rounded-2xl overflow-hidden border border-[#282828] hover:border-[#FF6600]/50 transition-all duration-300 active:scale-95 sm:active:scale-[0.98]"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
    >
      <Link to={`/Article?id=${articleId}`} className="block">
        <div className="relative aspect-[4/5] sm:aspect-video overflow-hidden bg-gray-900">
          {video_url ? (
            <>
              <video src={video_url} className="w-full h-full object-cover" muted loop playsInline autoPlay preload="metadata" onError={() => {}} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 bg-[#E31E24] text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                <Play size={10} fill="white" />
                וידאו
              </div>
            </>
          ) : image_url ? (
            <>
              <img src={image_url} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-[#111] flex items-center justify-center">
              <span className="text-gray-700 text-3xl sm:text-4xl font-bold">{categoryLabels[category]?.[0] || '📰'}</span>
            </div>
          )}
          {is_breaking && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-[#E31E24] text-white text-[10px] sm:text-xs font-bold py-0.5 px-2 animate-pulse">🔴 חם</Badge>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/70 rounded-xl px-3 py-1.5 backdrop-blur-sm">
            <img src={LOGO_URL} alt="הרשת החדשה" className="h-7 w-auto" />
            <span className="text-white text-sm font-bold">הרשת החדשה</span>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <Badge className={`${categoryColors[category]} text-[10px] sm:text-xs mb-2 rounded-full px-2.5 py-1 inline-block`}>
            {categoryLabels[category]}
          </Badge>
          <h3 className="font-bold text-sm sm:text-base text-[#FF6600] group-hover:text-[#FF8C00] transition-colors line-clamp-2 mb-1.5 leading-snug">{title}</h3>
          {subtitle && <p className="text-gray-400 text-[11px] sm:text-sm line-clamp-1 sm:line-clamp-2 mb-2">{subtitle}</p>}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs flex-1">
              <Clock size={10} />
              {moment(created_date).fromNow()}
            </span>
            <div onClick={(e) => e.preventDefault()} className="flex-shrink-0">
              <ShareButtons
                url={`${window.location.origin}${createPageUrl(`Article?id=${articleId}`)}`}
                title={title}
                size="small"
                showLabel={false}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}