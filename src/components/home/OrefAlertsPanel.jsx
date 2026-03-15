import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Shield, MapPin, Clock, ExternalLink, Zap, Plane, Activity, Biohazard, AlertOctagon, Waves, CheckCircle2, ShieldAlert, X } from "lucide-react";

const ALERT_TYPES = {
    1:   { label: "ירי רקטות וטילים",   color: "#FF0000", Icon: Zap,          bg: "rgba(255,0,0,0.15)",    instruction: "היכנסו למרחב המוגן מיד!" },
    2:   { label: "חדירת כלי טיס עוין", color: "#FF4500", Icon: Plane,        bg: "rgba(255,69,0,0.15)",   instruction: "היכנסו למרחב המוגן מיד!" },
    3:   { label: "רעידת אדמה",          color: "#FF8C00", Icon: Activity,     bg: "rgba(255,140,0,0.15)",  instruction: "הישארו בפנים, הרחקו מחלונות" },
    4:   { label: "חומרים מסוכנים",      color: "#FF6B35", Icon: Biohazard,    bg: "rgba(255,107,53,0.15)", instruction: "הישארו בפנים, סגרו חלונות" },
    5:   { label: "חדירת מחבלים",        color: "#DC143C", Icon: AlertOctagon, bg: "rgba(220,20,60,0.15)",  instruction: "היכנסו למרחב מוגן ונעלו דלתות!" },
    6:   { label: "צונאמי",               color: "#1E90FF", Icon: Waves,        bg: "rgba(30,144,255,0.15)", instruction: "התרחקו מהחוף מיד!" },
    13:  { label: "ביטול התרעה",          color: "#00CC00", Icon: CheckCircle2, bg: "rgba(0,204,0,0.15)",   instruction: "ניתן לצאת מהמרחב המוגן" },
    101: { label: "אירוע חירום",           color: "#FF0000", Icon: ShieldAlert,  bg: "rgba(255,0,0,0.15)",   instruction: "פעלו לפי הנחיות פיקוד העורף" },
};

const FONT = '"Varela Round", "Helvetica Neue", Helvetica, Arial, sans-serif';

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

function getAlertType(cat) {
    return ALERT_TYPES[cat] || { label: "התרעה", color: "#FF0000", Icon: AlertTriangle, bg: "rgba(255,0,0,0.15)", instruction: "היכנסו למרחב המוגן מיד!" };
}

function formatTime(dateStr) {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch { return dateStr; }
}

function OrefLogoSVG({ size = 36 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <path d="M20 2L4 10V22C4 30.8 11.2 38.4 20 40C28.8 38.4 36 30.8 36 22V10L20 2Z" fill="white" />
            <path d="M20 6L7 13V22C7 29.6 12.8 36 20 37.5C27.2 36 33 29.6 33 22V13L20 6Z" fill="#CC0000" />
            <text x="20" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">ע</text>
        </svg>
    );
}

/* Single alert polygon row — TV broadcast style */
function AlertPolygonRow({ alert, isActive = false }) {
    const [tick, setTick] = useState(0);
    const type = getAlertType(alert.cat || alert.category || 1);
    const cities = Array.isArray(alert.data) ? alert.data : (alert.data ? [alert.data] : []);

    useEffect(() => {
        if (!isActive) return;
        const t = setInterval(() => setTick(v => v + 1), 500);
        return () => clearInterval(t);
    }, [isActive]);

    const flash = isActive && tick % 2 === 0;

    return (
        <div
            dir="rtl"
            style={{
                background: isActive
                    ? (flash
                        ? 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)'
                        : 'linear-gradient(135deg, #6B0000 0%, #AA0000 100%)')
                    : 'linear-gradient(135deg, #1a0000 0%, #2d0000 100%)',
                border: isActive ? '3px solid #FF6600' : '2px solid #440000',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'background 0.3s',
                fontFamily: FONT,
                boxShadow: isActive ? '0 0 20px rgba(204,0,0,0.6)' : 'none',
            }}
        >
            {/* Top stripe */}
            <div style={{
                height: '5px',
                background: isActive
                    ? 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 20px, #FF8800 20px, #FF8800 40px)'
                    : '#440000',
            }} />

            <div style={{ padding: '10px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <OrefLogoSVG size={28} />
                        <div>
                            <div style={{ color: 'white', fontSize: '11px', fontWeight: '900', fontFamily: FONT, lineHeight: 1 }}>פיקוד העורף</div>
                            <div style={{ color: isActive ? '#FFD700' : '#FF6666', fontSize: '10px', fontWeight: '700', fontFamily: FONT }}>
                                {isActive ? '🔴 התרעה פעילה' : type.label}
                            </div>
                        </div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: FONT }}>
                        {alert.alertDate ? formatTime(alert.alertDate) : (alert.time || '')}
                    </div>
                </div>

                {/* Alert label */}
                <div style={{
                    color: '#FFD700',
                    fontSize: '18px',
                    fontWeight: '900',
                    fontFamily: FONT,
                    textShadow: '1px 1px 4px rgba(0,0,0,0.9)',
                    marginBottom: '8px',
                }}>
                    🚨 {type.label}
                </div>

                {/* Cities */}
                {cities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {cities.map((city, i) => (
                            <span key={i} style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '1.5px solid rgba(255,255,255,0.5)',
                                borderRadius: '4px',
                                padding: '3px 10px',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: '900',
                                fontFamily: FONT,
                                textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                            }}>
                                {city}
                            </span>
                        ))}
                    </div>
                )}

                {/* Instruction */}
                <div style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '13px',
                    fontWeight: '700',
                    fontFamily: FONT,
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '6px',
                }}>
                    {type.instruction}
                </div>
            </div>

            {/* Bottom stripe */}
            <div style={{
                height: '5px',
                background: isActive
                    ? 'repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 20px, #FF8800 20px, #FF8800 40px)'
                    : '#440000',
            }} />
        </div>
    );
}

/* TV-style city row — alternating orange/yellow like Pikud HaOref broadcast */
function CityRow({ city, index }) {
    const isOrange = index % 2 === 0;
    return (
        <div style={{
            background: isOrange ? '#E8650A' : '#F5A623',
            padding: '7px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
        }}>
            <span style={{
                color: 'white',
                fontSize: '17px',
                fontWeight: '900',
                fontFamily: FONT,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                letterSpacing: '0.01em',
            }}>
                {city}
            </span>
        </div>
    );
}

/* Full-screen popup — TV broadcast style like the real Pikud HaOref */
function AlertsPopup({ activeAlert, history, lastFetch, onClose }) {
    // Collect all cities from history
    const allCities = [];
    history.forEach(alert => {
        const cities = Array.isArray(alert.data) ? alert.data : (alert.data ? alert.data.split(',').map(s => s.trim()) : []);
        cities.forEach(city => { if (city) allCities.push(city); });
    });
    if (activeAlert?.data) {
        const activeCities = Array.isArray(activeAlert.data) ? activeAlert.data : [activeAlert.data];
        activeCities.forEach(city => { if (city && !allCities.includes(city)) allCities.unshift(city); });
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                    width: '320px',
                    maxHeight: '85vh',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                {/* Blue header — exactly like TV broadcast */}
                <div style={{
                    background: '#1565C0',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <OrefLogoSVG size={32} />
                        <div>
                            <div style={{ color: 'white', fontSize: '16px', fontWeight: '900', fontFamily: FONT, lineHeight: 1.1 }}>
                                התרעות פיקוד העורף
                            </div>
                            {lastFetch && (
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: FONT }}>
                                    עודכן: {formatTime(lastFetch)}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Alert type label */}
                <div style={{
                    background: '#1A237E',
                    padding: '6px 14px',
                    borderBottom: '2px solid #E8650A',
                    flexShrink: 0,
                }}>
                    <span style={{
                        color: '#FFD700',
                        fontSize: '13px',
                        fontWeight: '900',
                        fontFamily: FONT,
                        letterSpacing: '0.02em',
                    }}>
                        🚨 ירי רקטות וטילים — היכנסו למרחב המוגן!
                    </span>
                </div>

                {/* City rows — scrollable */}
                <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                    {allCities.length > 0 ? (
                        allCities.map((city, i) => (
                            <CityRow key={i} city={city} index={i} />
                        ))
                    ) : (
                        <div style={{
                            background: '#E8650A',
                            padding: '20px',
                            textAlign: 'center',
                            color: 'white',
                            fontFamily: FONT,
                            fontSize: '14px',
                            fontWeight: '700',
                        }}>
                            אין התרעות פעילות כרגע
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    background: '#1565C0',
                    padding: '6px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <a
                        href="https://www.oref.org.il/heb/alerts-history"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <ExternalLink size={12} />
                        oref.org.il
                    </a>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: FONT }}>
                        {allCities.length} אזורים
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function AlertsPanel() {
    const [activeAlert, setActiveAlert] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popupOpen, setPopupOpen] = useState(false);
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
                <span className="text-red-400 text-sm font-bold" style={{ fontFamily: FONT }}>מחפש התרעות...</span>
            </div>
        );
    }

    return (
        <>
            {/* STATUS BAR — click to open popup */}
            <div
                className="w-full flex items-center justify-between px-3 sm:px-6 py-2 cursor-pointer select-none"
                style={{
                    background: hasActiveNow ? '#1a0000' : '#111',
                    borderBottom: hasActiveNow ? '2px solid #CC0000' : '1px solid #222',
                    borderTop: '3px solid #FF6600',
                    fontFamily: FONT,
                }}
                onClick={() => setPopupOpen(true)}
                dir="rtl"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white rounded px-2 py-0.5">
                        <Shield className="w-3 h-3 text-red-700" />
                        <span className="text-red-800 text-xs font-black" style={{ fontFamily: FONT }}>פיקוד העורף</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${hasActiveNow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className={`text-sm font-bold ${hasActiveNow ? 'text-red-300' : 'text-green-300'}`} style={{ fontFamily: FONT }}>
                        {hasActiveNow ? 'התרעה פעילה! לחץ לפרטים' : 'אין התרעות פעילות — לחץ להיסטוריה'}
                    </span>
                    {lastFetch && (
                        <span className="text-gray-500 text-xs hidden sm:inline" style={{ fontFamily: FONT }}>
                            • עודכן: {formatTime(lastFetch)}
                        </span>
                    )}
                </div>
                <span style={{ color: '#FF6600', fontSize: '12px', fontWeight: '700', fontFamily: FONT }}>▼ פתח</span>
            </div>

            {/* POPUP */}
            <AnimatePresence>
                {popupOpen && (
                    <AlertsPopup
                        activeAlert={activeAlert}
                        history={history}
                        lastFetch={lastFetch}
                        onClose={() => setPopupOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}