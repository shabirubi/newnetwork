import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Shield, AlertTriangle, Clock, RefreshCw, ExternalLink, ChevronLeft, Zap, Info, BookOpen } from "lucide-react";

const CATEGORY_STYLES = {
    "ביטחון":   { color: "#FF4444", bg: "rgba(255,68,68,0.12)", icon: "🚀", border: "#FF444440" },
    "הוראות":  { color: "#FF8C00", bg: "rgba(255,140,0,0.12)", icon: "📋", border: "#FF8C0040" },
    "אזהרה":   { color: "#FF0000", bg: "rgba(255,0,0,0.15)",   icon: "⚠️", border: "#FF000050" },
    "עדכון":   { color: "#00BFFF", bg: "rgba(0,191,255,0.10)", icon: "📡", border: "#00BFFF40" },
    "כללי":    { color: "#AAAAAA", bg: "rgba(170,170,170,0.08)", icon: "ℹ️", border: "#AAAAAA30" },
};

function getCategoryStyle(cat) {
    return CATEGORY_STYLES[cat] || CATEGORY_STYLES["כללי"];
}

export default function OrefNewsSection() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const fetchNews = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await base44.functions.invoke('fetchOrefNews', {});
            const data = res.data;
            if (data.articles && data.articles.length > 0) {
                setArticles(data.articles);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("Error fetching oref news:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // Refresh every 3 minutes
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
                            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                                ידיעות פיקוד העורף
                            </h2>
                            <p className="text-xs text-gray-400">עדכונים רשמיים מ-oref.org.il</p>
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
                        <a
                            href="https://www.oref.org.il/heb"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl transition-all"
                        >
                            לאתר <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-gray-900 rounded-2xl p-4 animate-pulse">
                                <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                                <div className="h-5 bg-gray-800 rounded w-full mb-2" />
                                <div className="h-5 bg-gray-800 rounded w-4/5 mb-3" />
                                <div className="h-16 bg-gray-800 rounded w-full" />
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
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setExpandedId(isExpanded ? null : i)}
                                        className="relative rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99]"
                                        style={{
                                            background: style.bg,
                                            border: `1.5px solid ${style.border}`,
                                            boxShadow: isExpanded ? `0 0 20px ${style.color}30` : 'none'
                                        }}
                                    >
                                        {/* Urgent badge */}
                                        {article.is_urgent && (
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                                    דחוף
                                                </span>
                                            </div>
                                        )}

                                        {/* Category + Icon */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{style.icon}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: `${style.color}25`, color: style.color }}>
                                                {article.category || "עדכון"}
                                            </span>
                                            {article.date && (
                                                <span className="text-gray-500 text-xs flex items-center gap-1 mr-auto">
                                                    <Clock className="w-3 h-3" /> {article.date}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-white font-bold text-sm sm:text-base leading-snug mb-2 line-clamp-2">
                                            {article.title}
                                        </h3>

                                        {/* Content - truncated or expanded */}
                                        <p className={`text-gray-300 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                                            {article.content}
                                        </p>

                                        {/* Read more toggle */}
                                        <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: `1px solid ${style.border}` }}>
                                            <span className="text-xs font-bold flex items-center gap-1" style={{ color: style.color }}>
                                                {isExpanded ? 'הסתר' : 'קרא עוד'}
                                                <ChevronLeft className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </span>
                                            <span className="text-gray-600 text-[10px]">פיקוד העורף</span>
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
                        <p className="text-gray-500">לא נטענו ידיעות, נסה לרענן</p>
                        <button
                            onClick={() => fetchNews(true)}
                            className="mt-4 px-6 py-2 bg-red-700/40 border border-red-500/40 text-red-300 rounded-xl text-sm font-bold hover:bg-red-700/60 transition-all"
                        >
                            רענן
                        </button>
                    </div>
                )}

                {/* Source credit */}
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-xs">
                    <Info className="w-3 h-3" />
                    <span>המידע נלקח ישירות מאתר פיקוד העורף הרשמי</span>
                    <a href="https://www.oref.org.il" target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 underline">oref.org.il</a>
                </div>
            </div>
        </section>
    );
}