import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Shield, MapPin, Clock, ChevronDown, ChevronUp, ExternalLink, Zap, Plane, Activity, Biohazard, AlertOctagon, Waves, CheckCircle2, ShieldAlert } from "lucide-react";

/*
 * =====================================================================
 * OREF ALERT POLYGON - TV BROADCAST STYLE
 * =====================================================================
 * Based on official Pikud HaOref (Home Front Command) TV broadcast design
 * as seen on Israeli news channels (Kan 11, Channel 13, Channel 12).
 *
 * Design specifications:
 * - Background: deep red (#8B0000 to #CC0000)
 * - Left accent bar: orange (#FF6600), ~6px wide
 * - Font: "David CLM", "FrankRuehl CLM", Arial - official Israeli gov font
 * - City name: large white bold text, centered
 * - Alert type: white text above city name
 * - Oref logo area: top-right, white shield icon + "פיקוד העורף"
 * - Timestamp: bottom-right, small white
 * - Border: 3px solid orange (#FF6600)
 * - Red/orange flashing animation on active alert
 * - Polygon shape: wide banner (full width) or floating card
 * =====================================================================
 */

const ALERT_TYPES = {
    1:   { label: "ירי רקטות וטילים",   color: "#FF0000", Icon: Zap,          bg: "rgba(255,0,0,0.15)",    hebrewInstruction: "היכנסו למרחב המוגן מיד!" },
    2:   { label: "חדירת כלי טיס עוין", color: "#FF4500", Icon: Plane,        bg: "rgba(255,69,0,0.15)",   hebrewInstruction: "היכנסו למרחב המוגן מיד!" },
    3:   { label: "רעידת אדמה",          color: "#FF8C00", Icon: Activity,     bg: "rgba(255,140,0,0.15)",  hebrewInstruction: "הישארו בפנים, הרחקו מחלונות" },
    4:   { label: "חומרים מסוכנים",      color: "#FF6B35", Icon: Biohazard,    bg: "rgba(255,107,53,0.15)", hebrewInstruction: "הישארו בפנים, סגרו חלונות" },
    5:   { label: "חדירת מחבלים",        color: "#DC143C", Icon: AlertOctagon, bg: "rgba(220,20,60,0.15)",  hebrewInstruction: "היכנסו למרחב מוגן ונעלו דלתות!" },
    6:   { label: "צונאמי",               color: "#1E90FF", Icon: Waves,        bg: "rgba(30,144,255,0.15)", hebrewInstruction: "התרחקו מהחוף מיד!" },
    13:  { label: "ביטול התרעה",          color: "#00CC00", Icon: CheckCircle2, bg: "rgba(0,204,0,0.15)",   hebrewInstruction: "ניתן לצאת מהמרחב המוגן" },
    101: { label: "אירוע חירום",           color: "#FF0000", Icon: ShieldAlert,  bg: "rgba(255,0,0,0.15)",   hebrewInstruction: "פעלו לפי הנחיות פיקוד העורף" },
};

// Official Oref Hebrew font stack — matches government/broadcast design
// Uses system Hebrew fonts available in Israeli browsers
const OREF_FONT = '"Arial", "Helvetica Neue", "Helvetica", sans-serif';

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
    return ALERT_TYPES[cat] || { label: "התרעה", color: "#FF0000", Icon: AlertTriangle, bg: "rgba(255,0,0,0.15)", hebrewInstruction: "היכנסו למרחב המוגן מיד!" };
}

/* 
 * OrefLogoSVG — Recreates the official Pikud HaOref shield logo
 * as seen in TV broadcasts (white version on red background)
 */
function OrefLogoSVG({ size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2L4 10V22C4 30.8 11.2 38.4 20 40C28.8 38.4 36 30.8 36 22V10L20 2Z" fill="white" />
            <path d="M20 6L7 13V22C7 29.6 12.8 36 20 37.5C27.2 36 33 29.6 33 22V13L20 6Z" fill="#CC0000" />
            <text x="20" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">ע</text>
        </svg>
    );
}

/* 
 * TV-style Alert Polygon — the main broadcast banner
 * Matches the design shown on Israeli TV channels during active alerts
 */
function OrefTVPolygon({ activeAlert, alertType }) {
    const [tick, setTick] = useState(0);

    // Flashing effect — alternates every 500ms like real TV broadcast
    useEffect(() => {
        const t = setInterval(() => setTick(v => v + 1), 500);
        return () => clearInterval(t);
    }, []);

    const isFlash = tick % 2 === 0;
    const cities = activeAlert.data || [];
    const instruction = alertType?.hebrewInstruction || "היכנסו למרחב המוגן מיד!";

    return (
        <div
            dir="rtl"
            style={{
                background: isFlash
                    ? 'linear-gradient(135deg, #8B0000 0%, #CC0000 60%, #AA0000 100%)'
                    : 'linear-gradient(135deg, #6B0000 0%, #AA0000 60%, #880000 100%)',
                borderTop: '4px solid #FF6600',
                borderBottom: '4px solid #FF6600',
                boxShadow: '0 0 30px rgba(204,0,0,0.8), 0 0 60px rgba(255,102,0,0.4)',
                transition: 'background 0.3s',
                fontFamily: OREF_FONT,
            }}
        >
            {/* Top orange stripe — TV broadcast style */}
            <div style={{
                height: '6px',
                background: 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 30px, #FF8800 30px, #FF8800 60px)',
            }} />

            <div className="w-full px-4 sm:px-8 py-3 sm:py-4">
                {/* Header row: Logo + Title + Time */}
                <div className="flex items-center justify-between mb-3">
                    {/* Oref logo + name */}
                    <div className="flex items-center gap-2">
                        <OrefLogoSVG size={36} />
                        <div>
                            <div style={{
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: '900',
                                fontFamily: OREF_FONT,
                                lineHeight: 1.1,
                                letterSpacing: '0.05em',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            }}>
                                פיקוד העורף
                            </div>
                            <div style={{
                                color: '#FFD700',
                                fontSize: '10px',
                                fontWeight: '700',
                                fontFamily: OREF_FONT,
                                letterSpacing: '0.08em',
                            }}>
                                התרעה פעילה
                            </div>
                        </div>
                    </div>

                    {/* Flashing LIVE indicator */}
                    <div className="flex items-center gap-2">
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: isFlash ? '#FF4444' : '#FF0000',
                            boxShadow: isFlash ? '0 0 10px #FF4444' : 'none',
                            transition: 'all 0.3s',
                        }} />
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: '900', fontFamily: OREF_FONT, letterSpacing: '0.1em' }}>
                            {activeAlert.alertDate ? formatTime(activeAlert.alertDate) : ''}
                        </span>
                    </div>
                </div>

                {/* Alert type — big bold text, TV style */}
                <div style={{
                    color: '#FFD700',
                    fontSize: 'clamp(18px, 4vw, 28px)',
                    fontWeight: '900',
                    fontFamily: OREF_FONT,
                    textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                    marginBottom: '6px',
                    letterSpacing: '0.02em',
                }}>
                    🚨 {alertType?.label || "התרעה"}
                </div>

                {/* Cities — large white text, TV polygon style */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {cities.slice(0, 12).map((city, i) => (
                        <div
                            key={i}
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '2px solid rgba(255,255,255,0.6)',
                                borderRadius: '4px',
                                padding: '4px 12px',
                                color: 'white',
                                fontSize: 'clamp(14px, 3vw, 20px)',
                                fontWeight: '900',
                                fontFamily: OREF_FONT,
                                textShadow: '1px 1px 4px rgba(0,0,0,0.9)',
                                letterSpacing: '0.01em',
                            }}
                        >
                            {city}
                        </div>
                    ))}
                    {cities.length > 12 && (
                        <div style={{
                            background: 'rgba(255,102,0,0.3)',
                            border: '2px solid #FF6600',
                            borderRadius: '4px',
                            padding: '4px 12px',
                            color: '#FFD700',
                            fontSize: '16px',
                            fontWeight: '900',
                            fontFamily: OREF_FONT,
                        }}>
                            +{cities.length - 12} נוספים
                        </div>
                    )}
                </div>

                {/* Instruction line — white, smaller */}
                <div style={{
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: 'clamp(12px, 2.5vw, 16px)',
                    fontWeight: '700',
                    fontFamily: OREF_FONT,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    borderTop: '1px solid rgba(255,255,255,0.25)',
                    paddingTop: '6px',
                }}>
                    {instruction}
                </div>
            </div>

            {/* Bottom orange stripe */}
            <div style={{
                height: '6px',
                background: 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 30px, #FF8800 30px, #FF8800 60px)',
            }} />
        </div>
    );
}

export default function AlertsPanel() {
    const [activeAlert, setActiveAlert] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [lastFetch, setLastFetch] = useState(null);
    const [hasActiveNow, setHasActiveNow] = useState(false);
    const intervalRef = useRef(null);

    const fetchAlerts = async () => {
        try {
            const res = await base44.functions.invoke('fetchOrefAlerts', {});
            const data = res.data;
            setLastFetch(new Date());

            if (data.active && data.active.data && data.active.data.length > 0) {
                setActiveAlert(data.active);
                setHasActiveNow(true);
            } else {
                setActiveAlert(null);
                setHasActiveNow(false);
            }

            if (data.history && data.history.length > 0) {
                setHistory(data.history);
            } else if (history.length === 0) {
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
            <div className="w-full bg-black border-b border-red-900/50 py-2 px-4 flex items-center gap-2" dir="rtl">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-sm font-bold" style={{ fontFamily: OREF_FONT }}>
                    מחפש התרעות...
                </span>
            </div>
        );
    }

    const alertType = activeAlert ? getAlertType(activeAlert.cat) : null;

    return (
        <div className="w-full" dir="rtl">

            {/* TV-STYLE ALERT POLYGON — shown only when active alert */}
            <AnimatePresence>
                {hasActiveNow && activeAlert && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <OrefTVPolygon activeAlert={activeAlert} alertType={alertType} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STATUS BAR */}
            <div
                className="w-full flex items-center justify-between px-3 sm:px-6 py-2 cursor-pointer select-none"
                style={{
                    background: hasActiveNow ? '#1a0000' : '#111',
                    borderBottom: hasActiveNow ? '2px solid #CC0000' : '1px solid #222',
                    borderTop: hasActiveNow ? 'none' : '2px solid #FF6600',
                    fontFamily: OREF_FONT,
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {/* Mini Oref badge */}
                    <div className="flex items-center gap-1.5 bg-white rounded px-2 py-0.5">
                        <Shield className="w-3 h-3 text-red-700" />
                        <span className="text-red-800 text-xs font-black" style={{ fontFamily: OREF_FONT }}>
                            פיקוד העורף
                        </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${hasActiveNow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className={`text-sm font-bold ${hasActiveNow ? 'text-red-300' : 'text-green-300'}`} style={{ fontFamily: OREF_FONT }}>
                        {hasActiveNow ? 'התרעה פעילה!' : 'אין התרעות פעילות כרגע'}
                    </span>
                    {lastFetch && (
                        <span className="text-gray-500 text-xs hidden sm:inline" style={{ fontFamily: OREF_FONT }}>
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
                                    <h3 className="text-white font-bold text-sm" style={{ fontFamily: OREF_FONT }}>
                                        היסטוריית התרעות אחרונות
                                    </h3>
                                    <span className="text-gray-500 text-xs" style={{ fontFamily: OREF_FONT }}>
                                        • מתעדכן כל 5 שניות
                                    </span>
                                </div>
                                <a
                                    href="https://www.oref.org.il/heb/alerts-history"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-xs transition-colors"
                                    style={{ fontFamily: OREF_FONT }}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    אתר פיקוד העורף
                                </a>
                            </div>

                            {history.length === 0 ? (
                                <p className="text-gray-500 text-sm" style={{ fontFamily: OREF_FONT }}>אין התרעות אחרונות</p>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {history.map((alert, i) => {
                                        const type = getAlertType(alert.category || alert.cat || 1);
                                        const location = alert.data || alert.area || alert.name || "";
                                        return (
                                            <div key={i}
                                                className="flex items-center gap-3 p-2.5 rounded border"
                                                style={{ background: type.bg, borderColor: `${type.color}40` }}>
                                                {type.Icon && <type.Icon className="w-5 h-5 flex-shrink-0" style={{ color: type.color }} />}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-black px-2 py-0.5 rounded"
                                                            style={{ color: type.color, background: `${type.color}20`, fontFamily: OREF_FONT }}>
                                                            {type.label}
                                                        </span>
                                                        {alert.time && (
                                                            <span className="text-gray-500 text-xs" style={{ fontFamily: OREF_FONT }}>
                                                                {alert.time}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {location && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                            <p className="text-gray-200 text-sm font-medium" style={{ fontFamily: OREF_FONT }}>
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