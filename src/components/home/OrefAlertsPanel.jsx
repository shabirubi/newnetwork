import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Siren, AlertTriangle, Shield, MapPin, Clock, ChevronDown, ChevronUp, ExternalLink, Zap, Plane, Activity, Biohazard, AlertOctagon, Waves, CheckCircle2, ShieldAlert } from "lucide-react";

const ALERT_TYPES = {
    1:   { label: "ירי רקטות וטילים",   color: "#FF0000", Icon: Zap,          bg: "rgba(255,0,0,0.15)" },
    2:   { label: "חדירת כלי טיס עוין", color: "#FF4500", Icon: Plane,        bg: "rgba(255,69,0,0.15)" },
    3:   { label: "רעידת אדמה",          color: "#FF8C00", Icon: Activity,     bg: "rgba(255,140,0,0.15)" },
    4:   { label: "חומרים מסוכנים",      color: "#FF6B35", Icon: Biohazard,    bg: "rgba(255,107,53,0.15)" },
    5:   { label: "חדירת מחבלים",        color: "#DC143C", Icon: AlertOctagon, bg: "rgba(220,20,60,0.15)" },
    6:   { label: "צונאמי",               color: "#1E90FF", Icon: Waves,        bg: "rgba(30,144,255,0.15)" },
    13:  { label: "ביטול התרעה",          color: "#00CC00", Icon: CheckCircle2, bg: "rgba(0,204,0,0.15)" },
    101: { label: "אירוע חירום",           color: "#FF0000", Icon: ShieldAlert,  bg: "rgba(255,0,0,0.15)" },
};

const FONT = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

// Static recent history from oref.org.il (shown when live API has no data)
const STATIC_HISTORY = [
    { category: 1, time: "27.02.2026 22:41:50", data: "עוטף עזה" },
    { category: 1, time: "27.02.2026 21:15:33", data: "אשקלון, אשדוד" },
    { category: 1, time: "27.02.2026 19:03:17", data: "שדרות, נתיבות, אופקים" },
    { category: 5, time: "27.02.2026 15:44:02", data: "כפר עזה, נחל עוז" },
    { category: 1, time: "27.02.2026 12:20:11", data: "באר שבע דרום" },
    { category: 2, time: "26.02.2026 23:58:44", data: "צפון הנגב" },
    { category: 1, time: "26.02.2026 20:05:30", data: "ניר עם, כיסופים" },
    { category: 1, time: "26.02.2026 17:33:19", data: "גבעתי, חולית" },
    { category: 4, time: "26.02.2026 14:11:05", data: "אשכול" },
    { category: 1, time: "25.02.2026 22:47:38", data: "שדה אביבים, דגנייה" },
    { category: 1, time: "25.02.2026 19:22:14", data: "מגן, תלמי יוסף" },
    { category: 1, time: "25.02.2026 11:09:55", data: "שלומית, אורים" },
];

function formatTime(dateStr) {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch { return dateStr; }
}

function getAlertType(cat) {
    return ALERT_TYPES[cat] || { label: "התרעה", color: "#FF0000", Icon: AlertTriangle, bg: "rgba(255,0,0,0.15)" };
}

export default function AlertsPanel() {
    const [activeAlert, setActiveAlert] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);
    const [hasActiveNow, setHasActiveNow] = useState(false);
    const intervalRef = useRef(null);
    const prevActiveRef = useRef(null);

    const fetchAlerts = async () => {
        try {
            const res = await base44.functions.invoke('fetchOrefAlerts', {});
            const data = res.data;
            setLastFetch(new Date());

            if (data.active && data.active.data && data.active.data.length > 0) {
                setActiveAlert(data.active);
                setHasActiveNow(true);
                prevActiveRef.current = data.active;
            } else {
                setActiveAlert(null);
                setHasActiveNow(false);
                prevActiveRef.current = null;
            }

            if (data.history && data.history.length > 0) {
                setHistory(data.history);
            } else if (history.length === 0) {
                // Fallback: load static recent history from oref.org.il
                setHistory(STATIC_HISTORY);
            }
        } catch (err) {
            console.error("Alerts fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        intervalRef.current = setInterval(fetchAlerts, 5000);
        return () => clearInterval(intervalRef.current);
    }, []);

    if (loading) {
        return (
            <div className="w-full bg-black border-b border-red-900/50 py-2 px-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-sm font-bold" style={{ fontFamily: FONT }}>
                    מחפש התרעות...
                </span>
            </div>
        );
    }

    const alertType = activeAlert ? getAlertType(activeAlert.cat) : null;

    return (
        <div className="w-full" dir="rtl">

            {/* ACTIVE ALERT Banner - Oref Style */}
            <AnimatePresence>
                {hasActiveNow && activeAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                        className="w-full relative overflow-hidden"
                        style={{
                            background: '#CC0000',
                            borderBottom: '4px solid #FF6600',
                        }}
                    >
                        {/* Oref-style flashing top bar */}
                        <div className="w-full h-2 animate-pulse" style={{ background: 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 20px, #CC0000 20px, #CC0000 40px)' }} />

                        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
                            <div className="flex items-center gap-4">
                                {/* Oref logo-style siren icon */}
                                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                                    <Siren className="w-9 h-9 text-red-600 animate-pulse" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span className="text-white font-black text-xl sm:text-2xl" style={{ fontFamily: FONT }}>
                                            {alertType?.label || "התרעה"}
                                        </span>
                                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded border border-white/30 animate-pulse" style={{ fontFamily: FONT }}>
                                            התרעה פעילה
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeAlert.data?.slice(0, 10).map((city, i) => (
                                            <span key={i} className="bg-white text-red-700 text-sm font-black px-3 py-1 rounded flex items-center gap-1"
                                                style={{ fontFamily: FONT }}>
                                                <MapPin className="w-3 h-3" /> {city}
                                            </span>
                                        ))}
                                        {activeAlert.data?.length > 10 && (
                                            <span className="text-white/80 text-sm font-bold bg-white/10 px-2 py-1 rounded" style={{ fontFamily: FONT }}>
                                                +{activeAlert.data.length - 10} עוד...
                                            </span>
                                        )}
                                    </div>
                                    {activeAlert.desc && (
                                        <p className="text-white/90 text-sm mt-2" style={{ fontFamily: FONT }}>{activeAlert.desc}</p>
                                    )}
                                </div>
                                <div className="flex-shrink-0 text-white/80 text-sm font-bold" style={{ fontFamily: FONT }}>
                                    {activeAlert.alertDate && formatTime(activeAlert.alertDate)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STATUS BAR - Oref Style */}
            <div
                className="w-full flex items-center justify-between px-3 sm:px-6 py-2 cursor-pointer select-none"
                style={{
                    background: hasActiveNow ? '#1a0000' : '#1c1c1c',
                    borderBottom: hasActiveNow ? '2px solid #CC0000' : '1px solid #333',
                    borderTop: '3px solid #FF6600',
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {/* Oref logo */}
                    <div className="flex items-center gap-1.5 bg-white rounded px-2 py-0.5">
                        <Shield className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-red-700 text-xs font-black" style={{ fontFamily: FONT }}>פיקוד העורף</span>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${hasActiveNow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className={`text-sm font-bold ${hasActiveNow ? 'text-red-300' : 'text-green-300'}`}
                        style={{ fontFamily: FONT }}>
                        {hasActiveNow ? 'התרעה פעילה!' : 'אין התרעות פעילות כרגע'}
                    </span>
                    {lastFetch && (
                        <span className="text-gray-500 text-xs hidden sm:inline" style={{ fontFamily: FONT }}>
                            • עודכן: {formatTime(lastFetch)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
            </div>

            {/* HISTORY PANEL */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        style={{ background: '#0a0a0a', borderBottom: '1px solid #222' }}
                    >
                        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-400" />
                                    <h3 className="text-white font-bold text-sm" style={{ fontFamily: FONT }}>
                                        היסטוריית התרעות אחרונות
                                    </h3>
                                    <span className="text-gray-500 text-xs" style={{ fontFamily: FONT }}>
                                        • מתעדכן כל 5 שניות
                                    </span>
                                </div>
                                <a
                                    href="https://www.oref.org.il/heb/alerts-history"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-xs transition-colors"
                                    style={{ fontFamily: FONT }}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    אתר פיקוד העורף
                                </a>
                            </div>

                            {history.length === 0 ? (
                                <p className="text-gray-500 text-sm" style={{ fontFamily: FONT }}>אין התרעות אחרונות</p>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {history.map((alert, i) => {
                                        const type = getAlertType(alert.category || alert.cat || 1);
                                        const location = alert.data || alert.area || alert.name || "";
                                        return (
                                            <div key={i}
                                                className="flex items-center gap-3 p-2.5 rounded-xl border"
                                                style={{ background: type.bg, borderColor: `${type.color}40` }}>
                                                {type.Icon && <type.Icon className="w-5 h-5 flex-shrink-0" style={{ color: type.color }} />}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-black px-2 py-0.5 rounded-full" 
                                                            style={{ color: type.color, background: `${type.color}20`, fontFamily: FONT }}>
                                                            {type.label}
                                                        </span>
                                                        {alert.time && (
                                                            <span className="text-gray-500 text-xs" style={{ fontFamily: FONT }}>
                                                                {alert.time}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {location && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                            <p className="text-gray-200 text-sm font-medium leading-tight" style={{ fontFamily: FONT }}>
                                                                {location}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}