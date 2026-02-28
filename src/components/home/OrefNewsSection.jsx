import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Shield, Clock, RefreshCw, ChevronDown, ChevronUp, Loader2, Zap } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

const FONT = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

// Static war news – Israel / Iran / USA / Gaza
const WAR_ARTICLES = [
    {
        title: "ישראל ואמריקה מסכמות: מתקפה מקומית על מתקני הגרעין של איראן",
        content: "גורמים בכירים בממשל האמריקאי ובממשלת ישראל מסרו הלילה כי השתיים הגיעו להסכמה עקרונית לפעולה משותפת נגד מתקני הגרעין האיראניים. הבית הלבן ממתין לאישור הסנאט.",
        category: "ביטחון",
        date: "עכשיו",
        is_urgent: true,
        prompt: "Israel USA joint military operation fighter jets Middle East dramatic sky cinematic photo no text"
    },
    {
        title: "איראן: נפעיל 3,000 טיל באם תהיה תקיפה – הגנת הביניים תופעל",
        content: "דובר משמרות המהפכה האיראניות הזהיר הלילה כי כל מתקפה ישראלית-אמריקאית תגרור ירי של אלפי טילים לכיוון ישראל, לרבות פגיעה בנמלי תעופה ובתחנות כוח.",
        category: "אזהרה",
        date: "לפני שעה",
        is_urgent: true,
        prompt: "Iran missiles launch dramatic night sky military threat no text cinematic"
    },
    {
        title: "צבא ישראל מוכן לסבב נוסף – כ-40 אלף מגויסים בכוננות גבוהה",
        content: "המטכ\"ל הורה על העברת אוגדות שריון וחי\"ר לאזורי כינוס לקראת התרחיש הצפוי. פקודת מבצע תינתן בהחלטת הקבינט המדיני-ביטחוני.",
        category: "צבא",
        date: "לפני שעתיים",
        is_urgent: false,
        prompt: "Israel army tanks IDF soldiers ready for battle dramatic desert landscape no text"
    },
    {
        title: "נשיא ארה\"ב: 'לא נאפשר לאיראן נשק גרעיני – זו קו אדום'",
        content: "בנאום שנישא בבית הלבן הצהיר הנשיא האמריקאי כי ארצות הברית מחויבת לעצור את התפתחות הנשק הגרעיני האיראני בכל האמצעים הנדרשים, לרבות צבאיים.",
        category: "דיפלומטיה",
        date: "לפני 3 שעות",
        is_urgent: false,
        prompt: "US president White House podium dramatic lighting speech no text"
    },
    {
        title: "חיזבאללה מפעיל מחדש חוליות מחבלים בצפון – הצבא בכוננות",
        content: "מודיעין צבאי מצביע על חזרה לפעילות מבצעית של חיזבאללה בדרום לבנון. כוחות צה\"ל חיזקו עמדות בגבול ואוכלוסיות היישובים הצפוניים קיבלו הנחיות מעודכנות.",
        category: "ביטחון",
        date: "לפני 4 שעות",
        is_urgent: false,
        prompt: "Hezbollah Lebanon border Israel military night dramatic no text"
    },
    {
        title: "ישראל מדממת כלכלית: עלות המלחמה עלתה ל-300 מיליארד שקל",
        content: "בנק ישראל פרסם היום דו\"ח מיוחד לפיו העלות הישירה של המלחמה לכלכלה הישראלית הגיעה ל-300 מיליארד שקל, כולל נזק לתשתיות, ירידה בתיירות ועצירת השקעות.",
        category: "כלכלה",
        date: "הבוקר",
        is_urgent: false,
        prompt: "Israel economy financial crisis war cost dramatic graph money no text"
    },
    {
        title: "רוסיה מספקת טכנולוגיה לאיראן – ישראל מגיבה בחריפות",
        content: "ישראל מחתה בפני מוסקבה על העברת טכנולוגיה טילית מתקדמת לאיראן. שר החוץ הישראלי הזמין את השגריר הרוסי לשיחת מחאה רשמית.",
        category: "דיפלומטיה",
        date: "אתמול",
        is_urgent: false,
        prompt: "Russia Iran military technology deal diplomacy dramatic meeting no text"
    },
    {
        title: "חמאס וישראל: שבוע לסיום שלב א' – מה יקרה אחר כך?",
        content: "שבוע לפני תום שלב א' של הסכם החטופים, עדיין לא הושגה הסכמה על תנאי שלב ב'. מקורות דיפלומטיים: 'הפער עדיין גדול, אך ניהול משא ומתן נמשך'.",
        category: "ביטחון",
        date: "אתמול",
        is_urgent: false,
        prompt: "Gaza hostage deal negotiation dramatic Israel flags meeting no text"
    },
    {
        title: "אמריקה מזיזה נושאת מטוסים נוסף למזרח התיכון",
        content: "הפנטגון אישר העברה של נושאת מטוסים שנייה לאזור הים התיכון, לצד קבוצת המכה הקיימת. הצעד נתפס כמסר ישיר לאיראן ולגורמים פרוקסי באזור.",
        category: "צבא",
        date: "אתמול",
        is_urgent: false,
        prompt: "US Navy aircraft carrier Mediterranean sea dramatic aerial photo no text"
    },
];

const CATEGORY_STYLES = {
    "ביטחון":    { color: "#FF4444", bg: "#1a0505", border: "#FF444440", icon: "🚀" },
    "אזהרה":    { color: "#FF2222", bg: "#1a0303", border: "#FF222250", icon: "⚠️" },
    "צבא":      { color: "#FF8C00", bg: "#1a0e00", border: "#FF8C0040", icon: "🪖" },
    "דיפלומטיה":{ color: "#00BFFF", bg: "#00111a", border: "#00BFFF35", icon: "🌐" },
    "כלכלה":    { color: "#FFD700", bg: "#1a1500", border: "#FFD70035", icon: "💰" },
};

function getCatStyle(cat) {
    return CATEGORY_STYLES[cat] || { color: "#AAAAAA", bg: "#111", border: "#AAAAAA25", icon: "📰" };
}

const imageCache = {};

export default function WarNewsSection() {
    const [images, setImages] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const [expanded, setExpanded] = useState(null);

    const generateImage = async (i, prompt) => {
        const key = `war-${i}`;
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
            // fallback gradient
        } finally {
            setLoadingImages(prev => ({ ...prev, [key]: false }));
        }
    };

    useEffect(() => {
        // Generate images in batches to avoid overload
        WAR_ARTICLES.forEach((article, i) => {
            setTimeout(() => generateImage(i, article.prompt), i * 800);
        });
    }, []);

    return (
        <section className="w-full px-2 sm:px-4 py-6" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                    <img src={LOGO_URL} alt="הרשת החדשה" className="h-10 w-auto drop-shadow-xl" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-3xl font-black text-white" style={{ fontFamily: FONT }}>
                                חדשות המלחמה
                            </h2>
                            <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                                <Zap className="w-3 h-3" /> חי
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs" style={{ fontFamily: FONT }}>
                            ישראל · ארה"ב · איראן · עזה | הרשת החדשה
                        </p>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {WAR_ARTICLES.map((article, i) => {
                        const style = getCatStyle(article.category);
                        const imgKey = `war-${i}`;
                        const imgUrl = images[imgKey];
                        const imgLoading = loadingImages[imgKey];
                        const isExpanded = expanded === i;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="rounded-2xl overflow-hidden cursor-pointer group"
                                style={{
                                    background: style.bg,
                                    border: `1.5px solid ${style.border}`,
                                    boxShadow: isExpanded ? `0 0 30px ${style.color}25` : '0 2px 12px rgba(0,0,0,0.5)'
                                }}
                                onClick={() => setExpanded(isExpanded ? null : i)}
                            >
                                {/* Image */}
                                <div className="relative h-44 overflow-hidden">
                                    {imgLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                                            style={{ background: `linear-gradient(135deg, ${style.bg}, #000)` }}>
                                            <Loader2 className="w-7 h-7 animate-spin text-gray-500" />
                                            <span className="text-gray-600 text-xs" style={{ fontFamily: FONT }}>
                                                מייצר תמונה...
                                            </span>
                                        </div>
                                    )}
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : !imgLoading ? (
                                        <div className="absolute inset-0 flex items-center justify-center"
                                            style={{ background: `linear-gradient(135deg, ${style.bg}, #000)` }}>
                                            <span className="text-6xl opacity-20">{style.icon}</span>
                                        </div>
                                    ) : null}

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0"
                                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.85) 100%)' }} />

                                    {/* Urgent badge */}
                                    {article.is_urgent && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full animate-pulse shadow-lg"
                                                style={{ fontFamily: FONT }}>
                                                🔴 דחוף
                                            </span>
                                        </div>
                                    )}

                                    {/* Category */}
                                    <div className="absolute top-3 left-3">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{
                                                background: `${style.color}25`,
                                                color: style.color,
                                                border: `1px solid ${style.color}50`,
                                                fontFamily: FONT,
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                            {style.icon} {article.category}
                                        </span>
                                    </div>

                                    {/* LOGO watermark bottom left */}
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 rounded-lg px-2 py-1 backdrop-blur-sm">
                                        <img src={LOGO_URL} alt="הרשת החדשה" className="h-4 w-auto" />
                                        <span className="text-white text-[10px] font-bold" style={{ fontFamily: FONT }}>
                                            הרשת החדשה
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex items-center gap-1 mb-2 text-gray-500 text-xs" style={{ fontFamily: FONT }}>
                                        <Clock className="w-3 h-3" />
                                        {article.date}
                                    </div>

                                    <h3 className="text-white font-black text-sm sm:text-base leading-snug mb-3"
                                        style={{ fontFamily: FONT }}>
                                        {article.title}
                                    </h3>

                                    <p className="text-gray-300 text-sm leading-relaxed"
                                        style={{
                                            fontFamily: FONT,
                                            display: '-webkit-box',
                                            WebkitLineClamp: isExpanded ? 'unset' : 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: isExpanded ? 'visible' : 'hidden'
                                        }}>
                                        {article.content}
                                    </p>

                                    <button
                                        className="mt-3 flex items-center gap-1 text-xs font-bold"
                                        style={{ color: style.color, fontFamily: FONT }}
                                    >
                                        {isExpanded ? 'הסתר' : 'קרא עוד'}
                                        {isExpanded
                                            ? <ChevronUp className="w-3.5 h-3.5" />
                                            : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}