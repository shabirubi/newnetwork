import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Shield, Clock, RefreshCw, ChevronLeft, Info, Loader2 } from "lucide-react";

const CATEGORY_STYLES = {
    "ביטחון":  { color: "#FF4444", bg: "rgba(255,68,68,0.10)",   icon: "🚀", border: "#FF444435" },
    "הוראות": { color: "#FF8C00", bg: "rgba(255,140,0,0.10)",   icon: "📋", border: "#FF8C0035" },
    "אזהרה":  { color: "#FF2222", bg: "rgba(255,34,34,0.12)",   icon: "⚠️", border: "#FF222240" },
    "עדכון":  { color: "#00BFFF", bg: "rgba(0,191,255,0.08)",   icon: "📡", border: "#00BFFF30" },
    "כללי":   { color: "#AAAAAA", bg: "rgba(120,120,120,0.07)", icon: "ℹ️", border: "#AAAAAA20" },
};

const IMAGE_PROMPTS = {
    "ביטחון":  "dramatic military security alert Israel sky at night with red warning lights, dark cinematic photo, no text",
    "הוראות": "emergency guidance civilian safety shelter Israel, dramatic lighting, photorealistic, no text",
    "אזהרה":  "emergency siren red alert urban Israel city night, dramatic cinematic sky, no text",
    "עדכון":  "Israel news update broadcast room dramatic light blue glow, modern studio, no text",
    "כללי":   "Israel news broadcast studio modern dramatic lighting, no text",
};

function getCategoryStyle(cat) {
    return CATEGORY_STYLES[cat] || CATEGORY_STYLES["כללי"];
}

function getImagePrompt(cat, title) {
    const base = IMAGE_PROMPTS[cat] || IMAGE_PROMPTS["כללי"];
    return `${base}, related to: ${title}`;
}

// Cache generated images per article title to avoid regenerating
const imageCache = {};

export default function SecurityNewsSection() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [images, setImages] = useState({});
    const [loadingImages, setLoadingImages] = useState({});

    const generateImage = async (key, prompt) => {
        if (imageCache[key]) {
            setImages(prev => ({ ...prev, [key]: imageCache[key] }));
            return;
        }
        setLoadingImages(prev => ({ ...prev, [key]: true }));
        try {
            const res = await base44.integrations.Core.GenerateImage({ prompt });
            if (res?.url) {
                imageCache[key] = res.url;
                setImages(prev => ({ ...prev, [key]: res.url }));
            }
        } catch (e) {
            // silently fail, show fallback gradient
        } finally {
            setLoadingImages(prev => ({ ...prev, [key]: false }));
        }
    };

    const fetchNews = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await base44.functions.invoke('fetchOrefNews', {});
            const data = res.data;
            if (data.articles && data.articles.length > 0) {
                setArticles(data.articles);
                setLastUpdated(new Date());
                // Generate images for each article asynchronously
                data.articles.forEach((article, i) => {
                    const key = `${i}-${article.title}`;
                    if (!imageCache[key]) {
                        generateImage(key, getImagePrompt(article.category, article.title));
                    } else {
                        setImages(prev => ({ ...prev, [key]: imageCache[key] }));
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching security news:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(() => fetchNews(true), 3 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full px-2 sm:px-4 py-4 sm:py-6" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative">
                            <Shield className="w-7 h-7 sm:w-9 sm:h-9 text-red-500" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight"
                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                עדכוני ביטחון ומצב
                            </h2>
                            <p className="text-xs text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                עדכונים שוטפים מהרשת החדשה
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-red-900/30 border border-red-500/40 rounded-full px-2.5 py-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-400 text-xs font-bold">חי</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {lastUpdated && (
                            <span className="text-gray-600 text-xs hidden sm:inline">
                                {lastUpdated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <button
                            onClick={() => fetchNews(true)}
                            disabled={refreshing}
                            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-40 bg-gray-800" />
                                <div className="p-4">
                                    <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                                    <div className="h-5 bg-gray-800 rounded w-full mb-2" />
                                    <div className="h-5 bg-gray-800 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Articles Grid */}
                {!loading && articles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <AnimatePresence>
                            {articles.map((article, i) => {
                                const style = getCategoryStyle(article.category);
                                const isExpanded = expandedId === i;
                                const imgKey = `${i}-${article.title}`;
                                const imgUrl = images[imgKey];
                                const imgLoading = loadingImages[imgKey];

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : i); }}
                                        className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99]"
                                        style={{
                                            background: '#111',
                                            border: `1.5px solid ${style.border}`,
                                            boxShadow: isExpanded ? `0 0 24px ${style.color}30` : 'none'
                                        }}
                                    >
                                        {/* AI Generated Image */}
                                        <div className="relative h-40 overflow-hidden">
                                            {imgLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center"
                                                    style={{ background: style.bg }}>
                                                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                                                </div>
                                            )}
                                            {imgUrl && !imgLoading && (
                                                <img
                                                    src={imgUrl}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover"
                                                    style={{ opacity: 0.85 }}
                                                />
                                            )}
                                            {!imgUrl && !imgLoading && (
                                                <div className="absolute inset-0"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${style.bg}, #000)`,
                                                    }}>
                                                    <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                                                        {style.icon}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0"
                                                style={{
                                                    background: 'linear-gradient(to bottom, transparent 30%, #111 100%)'
                                                }} />

                                            {/* Badges on image */}
                                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: `${style.color}30`, color: style.color, border: `1px solid ${style.color}50`, fontFamily: 'system-ui, sans-serif' }}>
                                                    {style.icon} {article.category || "עדכון"}
                                                </span>
                                            </div>
                                            {article.is_urgent && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse"
                                                        style={{ fontFamily: 'system-ui, sans-serif' }}>
                                                        דחוף
                                                    </span>
                                                </div>
                                            )}
                                            {/* Network branding watermark */}
                                            <div className="absolute bottom-2 left-2 opacity-60">
                                                <span className="text-white text-[9px] font-bold bg-black/50 px-1.5 py-0.5 rounded"
                                                    style={{ fontFamily: 'system-ui, sans-serif' }}>
                                                    הרשת החדשה
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {article.date && (
                                                <span className="text-gray-500 text-xs flex items-center gap-1 mb-2"
                                                    style={{ fontFamily: 'system-ui, sans-serif' }}>
                                                    <Clock className="w-3 h-3" /> {article.date}
                                                </span>
                                            )}

                                            <h3 className="text-white font-bold text-sm sm:text-base leading-snug mb-2"
                                                style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
                                                {article.title}
                                            </h3>

                                            <p className="text-gray-400 text-sm leading-relaxed"
                                                style={{
                                                    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isExpanded ? 'none' : 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: isExpanded ? 'visible' : 'hidden'
                                                }}>
                                                {article.content}
                                            </p>

                                            <div className="flex items-center justify-between mt-3 pt-2"
                                                style={{ borderTop: `1px solid ${style.border}` }}>
                                                <span className="text-xs font-bold flex items-center gap-1"
                                                    style={{ color: style.color, fontFamily: 'system-ui, sans-serif' }}>
                                                    {isExpanded ? 'הסתר' : 'קרא עוד'}
                                                    <ChevronLeft className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty state */}
                {!loading && articles.length === 0 && (
                    <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            לא נטענו ידיעות, נסה לרענן
                        </p>
                        <button
                            onClick={() => fetchNews(true)}
                            className="mt-4 px-6 py-2 bg-red-700/40 border border-red-500/40 text-red-300 rounded-xl text-sm font-bold hover:bg-red-700/60 transition-all"
                        >
                            רענן
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}