import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Shield, Clock, Zap, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";
const FONT = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

// Fallback Unsplash images shown immediately, replaced by AI images once loaded
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=600&q=80",
    "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=600&q=80",
    "https://images.unsplash.com/photo-1597733336794-db7de7a4c9f5?w=600&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=600&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=600&q=80",
    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&q=80",
    "https://images.unsplash.com/photo-1548502499-ef49d09e3185?w=600&q=80",
];

// Static war articles — shown immediately with Unsplash images, then AI images replace them (cached 24h)
const WAR_ARTICLES_BASE = [
    {
        title: "ישראל ואמריקה מסכמות: מתקפה מתואמת על מתקני הגרעין של איראן",
        content: "גורמים בכירים בממשל האמריקאי ובממשלת ישראל מסרו הלילה כי השתיים הגיעו להסכמה עקרונית לפעולה משותפת נגד מתקני הגרעין האיראניים. הבית הלבן ממתין לאישור הסנאט.",
        category: "SECURITY", label: "ביטחון", color: "#FF6600", border: "#FF660040", bg: "#1a0e00", is_urgent: true, date: "עכשיו",
    },
    {
        title: "איראן: נפעיל 3,000 טיל — הגנת הביניים תופעל מיידית",
        content: "דובר משמרות המהפכה האיראניות הזהיר הלילה כי כל מתקפה ישראלית-אמריקאית תגרור ירי של אלפי טילים לכיוון ישראל, לרבות פגיעה בנמלי תעופה ובתחנות כוח.",
        category: "ALERT", label: "אזהרה", color: "#FF6600", border: "#FF660050", bg: "#1a0e00", is_urgent: true, date: "לפני שעה",
    },
    {
        title: "צבא ישראל: 40,000 מגויסים בכוננות גבוהה לקראת התרחיש הצפוי",
        content: "המטכ\"ל הורה על העברת אוגדות שריון וחי\"ר לאזורי כינוס. פקודת מבצע תינתן בהחלטת הקבינט המדיני-ביטחוני.",
        category: "MILITARY", label: "צבאי", color: "#FF8C00", border: "#FF8C0040", bg: "#1a0e00", is_urgent: false, date: "לפני שעתיים",
    },
    {
        title: "נשיא ארה\"ב: 'לא נאפשר לאיראן נשק גרעיני — זו קו אדום'",
        content: "בנאום שנישא בבית הלבן הצהיר הנשיא האמריקאי כי ארצות הברית מחויבת לעצור את התפתחות הנשק הגרעיני האיראני בכל האמצעים הנדרשים.",
        category: "DIPLOMACY", label: "דיפלומטיה", color: "#00BFFF", border: "#00BFFF35", bg: "#00111a", is_urgent: false, date: "לפני 3 שעות",
    },
    {
        title: "חיזבאללה מפעיל מחדש חוליות בצפון — צה\"ל מחזק את הגבול",
        content: "מודיעין צבאי מצביע על חזרה לפעילות מבצעית של חיזבאללה בדרום לבנון. כוחות צה\"ל חיזקו עמדות ואוכלוסיות הצפון קיבלו הנחיות מעודכנות.",
        category: "SECURITY", label: "ביטחון", color: "#FF6600", border: "#FF660040", bg: "#1a0e00", is_urgent: false, date: "לפני 4 שעות",
    },
    {
        title: "עלות המלחמה עלתה ל-300 מיליארד שקל — בנק ישראל מזהיר",
        content: "בנק ישראל פרסם דו\"ח מיוחד לפיו העלות הישירה של המלחמה לכלכלה הישראלית הגיעה ל-300 מיליארד שקל, כולל נזק לתשתיות, ירידה בתיירות ועצירת השקעות.",
        category: "ECONOMY", label: "כלכלה", color: "#FFD700", border: "#FFD70035", bg: "#1a1500", is_urgent: false, date: "הבוקר",
    },
    {
        title: "רוסיה מספקת טכנולוגיה טילית לאיראן — ישראל מוחה בחריפות",
        content: "ישראל מחתה בפני מוסקבה על העברת טכנולוגיה מתקדמת לאיראן. שר החוץ הישראלי הזמין את השגריר הרוסי לשיחת מחאה רשמית.",
        category: "DIPLOMACY", label: "דיפלומטיה", color: "#00BFFF", border: "#00BFFF35", bg: "#00111a", is_urgent: false, date: "אתמול",
    },
    {
        title: "חמאס וישראל: שבוע לסיום שלב א' — המו\"מ על שלב ב' נמשך",
        content: "שבוע לפני תום שלב א' של הסכם החטופים, עדיין לא הושגה הסכמה על תנאי שלב ב'. מקורות דיפלומטיים: 'הפער עדיין גדול, אך המשא ומתן נמשך'.",
        category: "SECURITY", label: "ביטחון", color: "#FF6600", border: "#FF660040", bg: "#1a0e00", is_urgent: false, date: "אתמול",
    },
    {
        title: "אמריקה מזיזה נושאת מטוסים שנייה לים התיכון — מסר לאיראן",
        content: "הפנטגון אישר העברה של נושאת מטוסים שנייה לאזור הים התיכון. הצעד נתפס כמסר ישיר לאיראן ולגורמים פרוקסי באזור.",
        category: "MILITARY", label: "צבאי", color: "#FF8C00", border: "#FF8C0040", bg: "#1a0e00", is_urgent: false, date: "אתמול",
    },
];

const CACHE_KEY = 'war_news_images';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCachedImages() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const { images, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) return null;
        return images;
    } catch {
        return null;
    }
}

function setCachedImages(images) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ images, timestamp: Date.now() }));
    } catch {}
}

function NewsCard({ article, index, isAlert = false }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl overflow-hidden cursor-pointer group"
            style={{
                background: article.bg,
                border: `1.5px solid ${article.border}`,
                boxShadow: isAlert ? `0 0 40px ${article.color}40` : '0 2px 12px rgba(0,0,0,0.5)'
            }}
            onClick={() => setExpanded(e => !e)}
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.85) 100%)' }} />

                {/* Urgent / Alert badge */}
                {(article.is_urgent || isAlert) && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded tracking-widest animate-pulse shadow-lg"
                            style={{ fontFamily: FONT, letterSpacing: '0.12em' }}>
                            BREAKING
                        </span>
                    </div>
                )}

                {/* Category tag */}
                <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded tracking-widest"
                        style={{
                            background: `${article.color}20`,
                            color: article.color,
                            border: `1px solid ${article.color}60`,
                            fontFamily: FONT,
                            letterSpacing: '0.12em',
                            backdropFilter: 'blur(8px)'
                        }}>
                        {article.category}
                    </span>
                </div>

                {/* Logo watermark */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/70 rounded-xl px-3 py-1.5 backdrop-blur-sm">
                    <img src={LOGO_URL} alt="הרשת החדשה" className="h-7 w-auto" />
                    <span className="text-white text-sm font-bold" style={{ fontFamily: FONT }}>
                        הרשת החדשה
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-gray-500 text-xs" style={{ fontFamily: FONT }}>
                        <Clock className="w-3 h-3" /> {article.date}
                    </div>
                    {/* Waving Israeli Flag SVG */}
                    <style>{`
                        @keyframes wave1 { 0%,100%{d:path("M0,8 Q13,4 26,8 Q39,12 52,8 L52,14 Q39,18 26,14 Q13,10 0,14 Z")} 50%{d:path("M0,10 Q13,6 26,10 Q39,14 52,10 L52,16 Q39,20 26,16 Q13,12 0,16 Z")} }
                        @keyframes wave2 { 0%,100%{d:path("M0,20 Q13,16 26,20 Q39,24 52,20 L52,26 Q39,30 26,26 Q13,22 0,26 Z")} 50%{d:path("M0,18 Q13,14 26,18 Q39,22 52,18 L52,24 Q39,28 26,24 Q13,20 0,24 Z")} }
                        @keyframes wavePath {
                            0%   { transform: translateY(0px) scaleY(1); }
                            25%  { transform: translateY(-3px) scaleY(0.94); }
                            50%  { transform: translateY(0px) scaleY(1); }
                            75%  { transform: translateY(3px) scaleY(0.94); }
                            100% { transform: translateY(0px) scaleY(1); }
                        }
                        .flag-wave { animation: wavePath 1.2s ease-in-out infinite; transform-origin: left center; }
                        .flag-wave-delay { animation: wavePath 1.2s ease-in-out infinite 0.4s; transform-origin: left center; }
                    `}</style>
                    <svg width="60" height="38" viewBox="0 0 60 38" xmlns="http://www.w3.org/2000/svg">
                        {/* Transparent background */}
                        <rect width="60" height="38" fill="transparent"/>
                        {/* Top blue stripe - thin */}
                        <rect className="flag-wave" y="7" width="60" height="4" fill="#009EE0" opacity="0.9"/>
                        {/* Bottom blue stripe - thin */}
                        <rect className="flag-wave-delay" y="27" width="60" height="4" fill="#009EE0" opacity="0.9"/>
                        {/* Star of David */}
                        <g transform="translate(30,19)">
                            <polygon points="0,-6 5.2,3 -5.2,3" fill="none" stroke="#009EE0" strokeWidth="1.5"/>
                            <polygon points="0,6 -5.2,-3 5.2,-3" fill="none" stroke="#009EE0" strokeWidth="1.5"/>
                        </g>
                    </svg>
                </div>
                <h3 className="text-white font-black text-sm sm:text-base leading-snug mb-3" style={{ fontFamily: FONT }}>
                    {article.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed"
                    style={{
                        fontFamily: FONT,
                        display: '-webkit-box',
                        WebkitLineClamp: expanded ? 'unset' : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: expanded ? 'visible' : 'hidden'
                    }}>
                    {article.content}
                </p>
                <button className="mt-3 flex items-center gap-1 text-xs font-bold"
                    style={{ color: article.color, fontFamily: FONT }}>
                    {expanded ? 'הסתר' : 'קרא עוד'}
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>
        </motion.div>
    );
}

export default function WarNewsSection() {
    const [alertCard, setAlertCard] = useState(null);
    const [generatingAlert, setGeneratingAlert] = useState(false);
    const [lastAlertId, setLastAlertId] = useState(null);
    const [articles, setArticles] = useState(() => {
        // Try loading from cache immediately, else use Unsplash fallbacks
        const cached = getCachedImages();
        return WAR_ARTICLES_BASE.map((a, i) => ({
            ...a,
            image: (cached && cached[i]) || FALLBACK_IMAGES[i] || ''
        }));
    });

    // Load AI images once — from cache or via backend function
    useEffect(() => {
        const cached = getCachedImages();
        if (cached) return; // already loaded from cache, Unsplash shown until AI ready

        base44.functions.invoke('generateWarNewsImages', {})
            .then(res => {
                const images = res?.data?.images || [];
                if (images.some(Boolean)) {
                    setCachedImages(images);
                    setArticles(WAR_ARTICLES_BASE.map((a, i) => ({
                        ...a,
                        image: images[i] || FALLBACK_IMAGES[i] || ''
                    })));
                }
            })
            .catch(() => {}); // silently ignore, Unsplash fallbacks remain
    }, []);

    // Poll for real OREF alerts — only generates ONE card per new alert
    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const res = await base44.functions.invoke('fetchOrefAlerts', {});
                const alerts = res?.data?.alerts;
                if (!alerts || alerts.length === 0) return;

                const latest = alerts[0];
                const alertId = latest.id || latest.title;
                if (alertId === lastAlertId) return; // same alert, skip

                setLastAlertId(alertId);
                setGeneratingAlert(true);

                // Generate ONE AI image for this specific alert
                try {
                    const imgRes = await base44.integrations.Core.GenerateImage({
                        prompt: `Israel emergency alert ${latest.title || latest.area}, dramatic news photo, cinematic, no text`
                    });

                    setAlertCard({
                        title: latest.title || latest.area || "התראה חדשה",
                        content: latest.description || latest.instructions || "",
                        category: "LIVE ALERT",
                        label: "התראה חיה",
                        color: "#FF0000",
                        border: "#FF000060",
                        bg: "#1a0000",
                        is_urgent: true,
                        date: "עכשיו",
                        image: imgRes?.url || ""
                    });
                } catch {
                    // If image gen fails, show card without image
                    setAlertCard({
                        title: latest.title || latest.area || "התראה חדשה",
                        content: latest.description || latest.instructions || "",
                        category: "LIVE ALERT",
                        label: "התראה חיה",
                        color: "#FF0000",
                        border: "#FF000060",
                        bg: "#1a0000",
                        is_urgent: true,
                        date: "עכשיו",
                        image: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=600&q=80"
                    });
                } finally {
                    setGeneratingAlert(false);
                }
            } catch {
                // silently ignore
            }
        };

        checkAlerts();
        const interval = setInterval(checkAlerts, 60 * 1000); // every 60s
        return () => clearInterval(interval);
    }, [lastAlertId]);

    return (
        <section className="w-full px-2 sm:px-4 py-6" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* BBC-style Header Bar */}
                <div className="rounded-xl overflow-hidden mb-6 shadow-2xl">
                    {/* Top red bar */}
                    <div className="bg-[#FF6600] px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={LOGO_URL} alt="הרשת החדשה" className="h-9 w-auto drop-shadow-xl" />
                            <div className="w-px h-8 bg-white/30" />
                            <h2 style={{
                                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#fff',
                                letterSpacing: '-0.01em'
                            }}>
                                חדשות המלחמה
                            </h2>
                        </div>
                        <span className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-black px-3 py-1 rounded animate-pulse"
                            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: '0.08em' }}>
                            <Zap className="w-3 h-3" /> LIVE
                        </span>
                    </div>
                    {/* Bottom subtitle bar */}
                    <div className="bg-[#1A1A1A] px-5 py-2 flex items-center gap-2">
                        <span className="text-gray-400 text-xs" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                            ישראל · ארה"ב · איראן · עזה
                        </span>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-500 text-xs" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                            הרשת החדשה — עדכון שוטף
                        </span>
                    </div>
                </div>

                {/* Live Alert Card — shown only when real OREF alert exists */}
                <AnimatePresence>
                    {generatingAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 rounded-2xl border-2 border-red-500 bg-red-950/40 p-5 flex items-center gap-3"
                        >
                            <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                            <span className="text-red-300 font-bold text-sm" style={{ fontFamily: FONT }}>
                                מעבד התראה חדשה...
                            </span>
                        </motion.div>
                    )}
                    {alertCard && !generatingAlert && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded animate-pulse" style={{ fontFamily: FONT }}>
                                    התראה בזמן אמת
                                </span>
                            </div>
                            <NewsCard article={alertCard} index={0} isAlert={true} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Static War News Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.map((article, i) => (
                        <NewsCard key={i} article={article} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}