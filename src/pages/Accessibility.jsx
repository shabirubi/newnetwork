import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { AccessibilityIcon, Volume2, Eye, Keyboard, Zap, Users, ArrowRight, CheckCircle, Vibrate } from "lucide-react";
import { motion } from "framer-motion";
import { useHapticFeedback } from "../components/utils/useHapticFeedback";

export default function Accessibility() {
  const { isEnabled, setIsEnabled, tap } = useHapticFeedback();
  const features = [
    {
      icon: Eye,
      title: "ניגודיות גבוהה",
      description: "כל הטקסט חומר בניגודיות גבוהה כדי להיות קל לקריאה",
      items: ["WCAG AA מומלץ", "תאימות Dark Mode", "גדלי טקסט גמישים"]
    },
    {
      icon: Keyboard,
      title: "ניווט מלא עם מקלדת",
      description: "השתמש בפלטפורמה שלנו באופן מלא ללא עכבר",
      items: ["Tab לניווט", "Enter להפעלה", "Escape לסגירה", "קיצורי מקלדת"]
    },
    {
      icon: Volume2,
      title: "טקסט לדיבור",
      description: "השמע את החדשות בקול אנושי באמצעות AI",
      items: ["קול איכותי", "מהירויות מתכווננות", "בחירת שפות", "תיקונים אוטומטיים"]
    },
    {
      icon: Users,
      title: "שפה פשוטה",
      description: "טקסט ברור וקל להבנה לכל המשתמשים",
      items: ["מונחים מופשטים מוסברים", "משפטים קצרים", "אין סלנג מבלבל", "כותרות ברורות"]
    },
    {
      icon: Zap,
      title: "ניווט מהיר",
      description: "דלג בקלות בין חלקי הדף",
      items: ["Skip links", "Landmarks ARIA", "Focus visible", "מבנה הגיוני"]
    },
    {
      icon: AccessibilityIcon,
      title: "תמיכה במסכנים",
      description: "תאימות מלאה למסכנים ויישומי סיוע נגישות",
      items: ["NVDA תומך", "JAWS תומך", "VoiceOver תומך", "תיוגי ARIA"]
    },
    {
      icon: Vibrate,
      title: "חוויה לנייד",
      description: "רטט וצלילים על מכשירים ניידים לחוויה טובה יותר",
      items: ["רטט משוב", "צלילי הודעה", "ניתן להשבית", "עובד על כל הנייד"]
    }
  ];

  const improvements = [
    {
      category: "ויז'ואליות",
      items: [
        "טקסט גדול וברור",
        "צבעים בניגודיות גבוהה",
        "אפשרות שינוי רקע",
        "הסרת התנועות המטשטשות"
      ]
    },
    {
      category: "שמע וקול",
      items: [
        "כתוביות לוידאו",
        "תעתוקים של תוכניות",
        "פקדים לשימוש קול",
        "התאמת עוצמה קול"
      ]
    },
    {
      category: "תנועה ודקדקוק",
      items: [
        "ניווט מלא ללא עכבר",
        "זמן מספיק לעבודה",
        "דלגים בחזרה אל תוכן",
        "אפשרות להשהות התוכן"
      ]
    },
    {
      category: "קוגניטיבי",
      items: [
        "מבנה עמוד ברור",
        "סימני כותרות הגיוניים",
        "טקסט פשוט וברור",
        "עזרה בהקשר"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
              <AccessibilityIcon className="w-12 h-12" />
              הצהרת נגישות
            </h1>
            <p className="text-lg text-blue-100">הרשת החדשה מחויבת לשימושיות מלאה וגישה שווה לכל</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Haptic Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 mb-12 shadow-lg border-l-4 border-purple-600"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Vibrate className="w-6 h-6 text-purple-600" />
              חוויה מנייד
            </h2>
            <button
              onClick={() => {
                setIsEnabled(!isEnabled);
                tap();
              }}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            כאשר מופעל, תחוש רטט וצלילים קטנים כשתלחץ על כפתורים ויסתיים פעולות.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => tap()}
              disabled={!isEnabled}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              נסה רטט
            </button>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-12 shadow-lg border-l-4 border-blue-600"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">מחויבותנו לנגישות</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
            אנו מאמינים שהחדשות חייבות להיות נגישות לכולם, ללא קשר ליכולותיהם. 
            הרשת החדשה עומדת ללעמוד בתקנים הגבוהים ביותר של נגישות דיגיטלית.
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            אנו מתמיד לעמוד ברמת AA של WCAG 2.1 ובתקנים נוספים של נגישות אתרים.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Improvements by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">שיפורים לנגישות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {improvements.map((section, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
                  {section.category}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testing & Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-8 mb-12 border border-blue-200 dark:border-blue-800"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">בדיקה ו-Compliance</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            אנו בודקים את הנגישות שלנו באמצעות:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "בדיקות אוטומטיות שבועיות",
              "ביקורות ידניות חודשיות",
              "בדיקות עם משתמשים ממשיים",
              "עדכון קבוע לתקנים חדשים",
              "מעקב אחר תלונות משתמשים",
              "הדרכה צוות על נגישות"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-12 border-l-4 border-blue-600"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">דווח על בעיות נגישות</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            אם נתקלת בבעיות נגישות, אנא צור קשר איתנו כדי שנוכל לתקן את הבעיה בהקדם האפשרי.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">
              📧 accessibility@hareshet.co.il
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              זמן תגובה רגיל: 2-3 ימים עסקיים
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            אנא כלול תיאור של הבעיה, את הדפדפן שלך וכל פרט רלוונטי אחר.
          </p>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">זכותך לנגישות</h3>
          <p className="text-blue-100 mb-6">
            כולנו ראויים לגישה שווה למידע וללא מכשולים. אם יש משהו שאנחנו יכולים לשפר, אנא אמר לנו.
          </p>
          <Link
            to={createPageUrl("Home")}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
          >
            חזור לדף הבית
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}