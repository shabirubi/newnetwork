import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowRight, Shield, FileText, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Terms() {
  const sections = [
    {
      id: "definitions",
      title: "הגדרות",
      icon: FileText,
      content: [
        "השירות: הרשת החדשה - ערוץ חדשות דיגיטלי",
        "המשתמש: כל אדם המשתמש בפלטפורמה",
        "תוכן: כל חומר המוצג בפלטפורמה (טקסט, תמונות, וידאו)",
        "הודעה: כל תוכן שהמשתמש יוצר או שמשגר"
      ]
    },
    {
      id: "usage",
      title: "תנאי השימוש",
      icon: AlertCircle,
      content: [
        "השימוש בפלטפורמה הוא לשימוש אישי בלבד",
        "אסור להשתמש בתוכן לחומר מסחרי ללא רשות",
        "אסור להעתיק, להפיץ או לשנות תוכן ללא רשות",
        "אסור לפרסם תוכן המפר חוק או זכויות של אחרים",
        "אסור להשתמש בפלטפורמה לשידור זבל או הטרדה"
      ]
    },
    {
      id: "intellectual",
      title: "זכויות יוצרים ודברי יוצר",
      icon: Shield,
      content: [
        "כל התוכן בפלטפורמה מוגן בדיני זכויות יוצרים",
        "המשתמש מעניק לנו רשות לשימוש בתוכן שהוא מעלה",
        "אנו שומרים על כל הזכויות ליתר תוכן",
        "הפרה של זכויות יוצרים תגרום לסרה מהשירות",
        "אנו עומדים ביתר זכויות בעלי זכויות חיצוניים"
      ]
    },
    {
      id: "liability",
      title: "אחריות והגבלות אחריות",
      icon: AlertCircle,
      content: [
        "השירות מסופק 'כמות שהוא' ללא הבטחות",
        "אנו לא אחראים לנזקים ישירים או עקיפים",
        "אנו לא אחראים לאובדן נתונים או הפסקות שירות",
        "האחריות המקסימלית מוגבלת לסכום התשלום בפועל",
        "חלק מהדרישות החוקיות אינן ניתנות לשלילה"
      ]
    },
    {
      id: "privacy",
      title: "פרטיות ואבטחה",
      icon: Shield,
      content: [
        "אנו אוספים נתונים כהגדרה במדיניות הפרטיות",
        "המידע שלך מוגן בדיני הגנת הנתונים",
        "אנו משתמשים בהצפנה להגנה על עסקאות",
        "לא נשתף מידע עם צדדים שלישיים ללא הסכמה",
        "לך זכות להציג, לתקן או למחוק את הנתונים שלך"
      ]
    },
    {
      id: "termination",
      title: "הסרה וסיום",
      icon: Clock,
      content: [
        "אנו רשאים להשעות או לסגור חשבון בכל עת",
        "קטגוריות הסרה כוללות הפרה של תקנון זה",
        "אתה יכול לבקש מחיקת חשבון בכל עת",
        "הנתונים שלך יימחקו לפי אישור הסרה",
        "חלק מהנתונים עשויים להיות שמורים לצרכים חוקיים"
      ]
    },
    {
      id: "changes",
      title: "שינויים לתקנון",
      icon: FileText,
      content: [
        "אנו עשויים לשנות תקנון זה בכל עת",
        "הודעה על שינויים תישלח באמצעות הדוא\"ל",
        "שימוש המשך יחשב כהסכמה לשינויים",
        "המשתמש יכול לבטל את השירות אם לא מסכים",
        "שינויים חלים על כל המשתמשים החדשים מיד"
      ]
    },
    {
      id: "contact",
      title: "יצירת קשר",
      icon: AlertCircle,
      content: [
        "לשאלות על תקנון: contact@hareshet.co.il",
        "לתלונות: complaints@hareshet.co.il",
        "לנושאי פרטיות: privacy@hareshet.co.il",
        "זמן תגובה רגיל: 5-7 ימים עסקיים",
        "חירום: support@hareshet.co.il"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">תקנון שימוש</h1>
            <p className="text-lg text-red-100">אנא קרא בעיון את התקנון הבא לפני השימוש בשירותינו</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border-l-4 border-red-600"
        >
          <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed mb-4">
            ברוכים הבאים להרשת החדשה. על ידי גישה או שימוש בפלטפורמה שלנו, אתה מסכים ללעמוד בתנאים הבאים. 
            אם אינך מסכים לתנאים אלה, אנא הפסק את השימוש בשירותינו.
          </p>
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              תקנון זה עדכון בתאריך {new Date().toLocaleDateString('he-IL')}
            </p>
          </div>
        </motion.div>

        {/* Sections Grid */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-lg">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                </div>

                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300 leading-relaxed"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-2"></span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">יש לך שאלות?</h3>
          <p className="text-red-100 mb-6">
            אם יש לך שאלות לגבי תקנון זה, אנא צור קשר עם צוות התמיכה שלנו
          </p>
          <Link
            to={createPageUrl("Home")}
            className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-full font-bold hover:bg-red-50 transition-colors"
          >
            חזור לדף הבית
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Updated Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span>עדכון אחרון: {new Date().toLocaleDateString('he-IL')}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}