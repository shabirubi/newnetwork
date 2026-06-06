import React, { useState, useEffect, useRef } from "react";
import VODSubscriptionModal from "../vod/VODSubscriptionModal";
import VODModal from "../vod/VODModal";
import { Tv as TvIcon } from "lucide-react";
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
                border: isActive ? '3px solid #0057B8' : '2px solid #440000',
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
                    ? 'repeating-linear-gradient(90deg, #0057B8 0px, #0057B8 20px, #1a6fd4 20px, #1a6fd4 40px)'
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
                    ? 'repeating-linear-gradient(90deg, #0057B8 0px, #0057B8 20px, #1a6fd4 20px, #1a6fd4 40px)'
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

/* Parse cities from data field — can be string or array */
function parseCities(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(Boolean);
    return data.split(',').map(s => s.trim()).filter(Boolean);
}

/* Full-screen popup — TV broadcast style like the real Pikud HaOref */
function AlertsPopup({ activeAlert, history, lastFetch, onClose }) {
    const allAlerts = [];
    // Active alert first
    if (activeAlert?.data) {
        allAlerts.push({ ...activeAlert, isActive: true });
    }
    // Then history
    history.forEach(a => allAlerts.push({ ...a, isActive: false }));

    const totalCities = allAlerts.reduce((acc, a) => acc + parseCities(a.data).length, 0);

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
                    width: '360px',
                    maxHeight: '88vh',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                {/* Blue header */}
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
                                    עודכן: {lastFetch.toLocaleTimeString('he-IL')}
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0,
                    }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable alert list */}
                <div style={{ overflowY: 'auto', flexGrow: 1, background: '#0d0d0d' }}>
                    {allAlerts.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'white', fontFamily: FONT }}>
                            אין נתונים זמינים
                        </div>
                    ) : allAlerts.map((alert, idx) => {
                        const cities = parseCities(alert.data);
                        const type = getAlertType(alert.cat || alert.category || 1);
                        return (
                            <div key={idx} style={{
                                borderBottom: '2px solid #1a1a1a',
                                background: alert.isActive ? '#2a0000' : (idx % 2 === 0 ? '#111' : '#161616'),
                            }}>
                                {/* Alert header row */}
                                <div style={{
                                    background: alert.isActive ? '#CC0000' : '#1565C0',
                                    padding: '4px 12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: '900', fontFamily: FONT }}>
                                        {alert.isActive ? '🔴 ' : ''}🚨 {type.label}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: FONT }}>
                                        {alert.time || alert.alertDate || ''}
                                    </span>
                                </div>
                                {/* Cities */}
                                {cities.map((city, ci) => (
                                    <CityRow key={ci} city={city} index={ci} />
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    background: '#1565C0', padding: '6px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
                }}>
                    <a href="https://www.oref.org.il/heb/alerts-history" target="_blank" rel="noopener noreferrer"
                        style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} />
                        oref.org.il
                    </a>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: FONT }}>
                        {allAlerts.length} התרעות | {totalCities} אזורים
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}

const TICKER_TYPES = [
    { label: 'מבזק', color: '#cc0000' },
    { label: 'סרטון', color: '#0057B8' },
    { label: 'עדכון', color: '#E87722' },
    { label: 'כתבה', color: '#1565C0' },
];

function BreakingTicker({ items }) {
    const [idx, setIdx] = useState(0);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        const t = setInterval(() => {
            setIdx(i => (i + 1) % items.length);
            setAnimKey(k => k + 1);
        }, 4000);
        return () => clearInterval(t);
    }, [items.length]);

    if (!items.length) return null;

    const item = items[idx];
    const typeInfo = TICKER_TYPES[idx % TICKER_TYPES.length];
    const isVideo = !!item.video_url || !!item.thumbnail_url;

    const handleClick = (e) => {
        e.stopPropagation();
        if (isVideo) {
            window.dispatchEvent(new CustomEvent('openReels'));
        } else {
            window.location.href = `/Article?id=${item.id}`;
        }
    };

    return (
        <div className="flex items-center gap-2 flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Type badge - animated */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`badge-${animKey}`}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                    className="flex-shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-white text-[10px] font-black"
                    style={{ background: typeInfo.color, fontFamily: FONT }}
                >
                    <span>{typeInfo.label}</span>
                </motion.div>
            </AnimatePresence>

            {/* Title - slides in from bottom */}
            <div className="flex-1 overflow-hidden h-5 relative">
                <AnimatePresence mode="wait">
                    <motion.button
                        key={`title-${animKey}`}
                        onClick={handleClick}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="absolute inset-0 text-xs font-bold truncate flex items-center hover:underline cursor-pointer text-right w-full"
                        style={{ fontFamily: FONT, color: '#1e3a5f' }}
                    >
                        {item.title}
                    </motion.button>
                </AnimatePresence>
            </div>

            {/* Thumbnail preview if video */}
            {isVideo && item.thumbnail_url && (
                <AnimatePresence mode="wait">
                    <motion.button
                        key={`thumb-${animKey}`}
                        onClick={handleClick}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 w-8 h-6 rounded overflow-hidden border border-blue-300 hover:border-blue-500 transition-colors"
                    >
                        <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                </AnimatePresence>
            )}


        </div>
    );
}

export default function AlertsPanel() {
    const [activeAlert, setActiveAlert] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);
    const [hasActiveNow, setHasActiveNow] = useState(false);
    const [tickerItems, setTickerItems] = useState([]);
    const [vodSubOpen, setVodSubOpen] = useState(false);
    const [vodModalOpen, setVodModalOpen] = useState(false);
    const intervalRef = useRef(null);
    const [colorPhase, setColorPhase] = useState(false);

    // Pulsing color cycle: red ↔ blue
    useEffect(() => {
        const t = setInterval(() => setColorPhase(p => !p), 1200);
        return () => clearInterval(t);
    }, []);

    // Check if user already subscribed (via URL param after payment)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("vod_subscribed") === "true") {
            // Remove param and open VOD
            window.history.replaceState({}, "", "/");
            setVodModalOpen(true);
        }
    }, []);

    useEffect(() => {
        setLoading(false);
        // Fetch latest articles + videos for the ticker
        Promise.all([
            base44.entities.NewsArticle.list('-created_date', 4),
            base44.entities.UserVideo.list('-created_date', 3),
        ]).then(([articles, videos]) => {
            const items = [
                ...(articles || []).map(a => ({ ...a, _type: 'article' })),
                ...(videos || []).map(v => ({ ...v, _type: 'video', title: v.title, video_url: v.video_url, thumbnail_url: v.thumbnail_url })),
            ].sort(() => Math.random() - 0.5).slice(0, 6);
            setTickerItems(items);
        }).catch(() => {});
    }, []);

    return (
        <>
            {/* STATUS BAR — click to open popup */}
            <motion.div
                className="w-full flex items-center justify-between px-3 sm:px-6 py-2 cursor-pointer select-none"
                animate={{
                    background: hasActiveNow
                        ? '#1a0000'
                        : colorPhase
                            ? 'linear-gradient(135deg, #fde8e8 0%, #fca5a5 40%, #f87171 70%, #ef4444 100%)'
                            : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 70%, #38bdf8 100%)',
                    borderTopColor: colorPhase ? '#E31E24' : '#0057B8',
                }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                style={{
                    borderBottom: hasActiveNow ? '2px solid #CC0000' : '1px solid rgba(0,0,0,0.1)',
                    borderTop: '3px solid',
                    fontFamily: FONT,
                }}
                onClick={() => setPopupOpen(true)}
                dir="rtl"
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <motion.div
                        animate={{
                            background: colorPhase
                                ? 'linear-gradient(135deg, #E31E24, #b91c1c)'
                                : 'linear-gradient(135deg, #0057B8, #1976D2)',
                            boxShadow: colorPhase
                                ? '0 0 14px rgba(227,30,36,0.7)'
                                : '0 0 14px rgba(0,87,184,0.7)',
                        }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                        className="flex items-center gap-1.5 rounded px-2 py-0.5 flex-shrink-0 cursor-pointer"
                        onClick={() => setPopupOpen(true)}
                    >
                        <Shield className="w-3 h-3 text-white" />
                        <span className="text-white text-xs font-black" style={{ fontFamily: FONT }}>פיקוד העורף</span>
                    </motion.div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasActiveNow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    {hasActiveNow ? (
                        <span className="text-sm font-bold" style={{ fontFamily: FONT, color: '#fca5a5' }}>
                            התרעה פעילה! לחץ לפרטים
                        </span>
                    ) : tickerItems.length > 0 ? (
                        <BreakingTicker items={tickerItems} />
                    ) : (
                        <span className="text-sm font-bold" style={{ fontFamily: FONT, color: '#1e3a5f' }}>
                            אין התרעות פעילות
                        </span>
                    )}
                </div>
                <motion.button
                    onClick={e => { e.stopPropagation(); setVodSubOpen(true); }}
                    animate={{
                        background: colorPhase
                            ? 'linear-gradient(135deg, #E31E24, #b91c1c)'
                            : 'linear-gradient(135deg, #0057B8, #1976D2)',
                        boxShadow: colorPhase
                            ? '0 0 16px rgba(227,30,36,0.7)'
                            : '0 0 16px rgba(0,87,184,0.7)',
                    }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-white text-xs font-black active:scale-95"
                    style={{ fontFamily: FONT }}
                >
                    <TvIcon className="w-3.5 h-3.5" />
                    VOD
                </motion.button>
            </motion.div>

            {/* Oref POPUP */}
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

            {/* VOD Subscription Modal */}
            <VODSubscriptionModal
                isOpen={vodSubOpen}
                onClose={() => setVodSubOpen(false)}
                onSubscribed={() => { setVodSubOpen(false); setVodModalOpen(true); }}
            />

            {/* VOD Content Modal */}
            <VODModal
                isOpen={vodModalOpen}
                onClose={() => setVodModalOpen(false)}
            />
        </>
    );
}