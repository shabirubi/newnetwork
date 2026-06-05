import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, ChevronLeft, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import ShareButtons from "../shared/ShareButtons";

const LOGO_URL = "https://media.base44.com/images/public/695b39080025f4d38a586978/e50cb05b1_unnamed5.jpg";

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

  // Mobile-first card
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: safeIndex * 0.1 }}
      className="group bg-[#181818] rounded-lg overflow-hidden border border-[#282828] hover:border-[#0057B8]/50 transition-all duration-300 active:scale-95"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
    >
      <Link to={`/Article?id=${articleId}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
          {video_url ? (
            <>
              <video src={video_url} className="w-full h-full object-cover" muted loop playsInline autoPlay preload="metadata" onError={() => {}} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 bg-[#E31E24] text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <Play size={8} fill="white" />
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
              <span className="text-gray-700 text-3xl font-bold">{categoryLabels[category]?.[0] || '📰'}</span>
            </div>
          )}
          {is_breaking && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-[#E31E24] text-white text-[9px] font-bold py-0.5 px-1.5 animate-pulse">🔴 חם</Badge>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/70 rounded-lg px-2 py-1 backdrop-blur-sm">
            <img src={LOGO_URL} alt="הרשת החדשה" className="h-5 w-auto" />
            <span className="text-white text-[10px] font-bold">הרשת החדשה</span>
          </div>
        </div>
        <div className="p-3">
          <Badge className={`${categoryColors[category]} text-[9px] mb-2 rounded-full px-2 py-1 inline-block font-semibold`}>
            {categoryLabels[category]}
          </Badge>
          <h3 className="font-bold text-sm text-[#0057B8] group-hover:text-[#1a6fd4] transition-colors line-clamp-2 mb-2 leading-snug">{title}</h3>
          {subtitle && <p className="text-gray-400 text-[11px] line-clamp-1 mb-2">{subtitle}</p>}
          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1 text-gray-500 text-[10px] flex-1">
              <Clock size={10} />
              {moment(created_date).fromNow()}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}