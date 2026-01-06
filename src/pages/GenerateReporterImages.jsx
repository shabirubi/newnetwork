import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Download } from "lucide-react";
import { motion } from "framer-motion";

const REPORTER_PROMPTS = [
  {
    id: 10,
    name: "אורי כהן",
    role: "כתב פיננסים",
    prompt: "Professional young Israeli male finance reporter in his early 30s, handsome, confident businesslike expression, short neat hair, wearing elegant gray suit and gold tie, standing in financial trading room, solid vibrant gold gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 11,
    name: "רינה לוי",
    role: "כתבת מזלות ואסטרולוגיה",
    prompt: "Professional young Israeli female astrology reporter in her mid 20s, beautiful, mystical smile, long flowing hair, wearing elegant purple dress with star accessories, standing with mystical background, solid vibrant deep purple gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 12,
    name: "גל שטרן",
    role: "כתב מוזיקה",
    prompt: "Professional young Israeli male music reporter in his late 20s, handsome, artistic expression, styled messy hair, wearing trendy leather jacket, standing in music studio, solid vibrant electric blue gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 13,
    name: "מאיה דוד",
    role: "כתבת אופנה וסגנון",
    prompt: "Professional young Israeli female fashion reporter in her mid 20s, beautiful, elegant sophisticated smile, long styled hair, wearing haute couture designer outfit, standing in fashion runway, solid vibrant hot pink gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 14,
    name: "ליאור אברהם",
    role: "כתב רכב וטכנולוגיה",
    prompt: "Professional young Israeli male automotive reporter in his late 20s, handsome, enthusiastic expression, short modern hair, wearing casual blazer, standing near luxury car, solid vibrant metallic silver gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 15,
    name: "שירה גרין",
    role: "כתבת תיירות ונופש",
    prompt: "Professional young Israeli female travel reporter in her mid 20s, beautiful, adventurous smile, long beach-waved hair, wearing casual elegant travel outfit, standing with exotic backdrop, solid vibrant turquoise gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 16,
    name: "יובל מרדכי",
    role: "כתב סביבה ואקולוגיה",
    prompt: "Professional young Israeli male environmental reporter in his early 30s, handsome, thoughtful caring expression, short natural hair, wearing earth-tone outdoor jacket, standing in nature setting, solid vibrant forest green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 17,
    name: "דנה ורד",
    role: "כתבת אוכל ומסעדות",
    prompt: "Professional young Israeli female culinary reporter in her late 20s, beautiful, warm joyful smile, styled hair, wearing elegant apron over chic outfit, standing in modern kitchen, solid vibrant coral orange gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 18,
    name: "נדב פרץ",
    role: "כתב קולנוע וקריקטורות",
    prompt: "Professional young Israeli male film critic in his late 20s, handsome, intellectual expression, trendy glasses, styled hair, wearing casual blazer, standing in cinema, solid vibrant ruby red gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 19,
    name: "עדי בן דוד",
    role: "כתבת משפט ופלילים",
    prompt: "Professional young Israeli female legal reporter in her early 30s, beautiful, serious professional expression, hair in elegant bun, wearing formal dark suit, standing in courthouse, solid vibrant dark navy gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 20,
    name: "איתן רון",
    role: "כתב נדל״ן ובנייה",
    prompt: "Professional young Israeli male real estate reporter in his early 30s, handsome, confident business smile, short professional hair, wearing elegant gray suit, standing in modern building, solid vibrant steel blue gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 21,
    name: "הילה זוהר",
    role: "כתבת מדע וחלל",
    prompt: "Professional young Israeli female science reporter in her mid 20s, beautiful, intelligent curious expression, neat professional hair, wearing modern blazer with space pin, standing in observatory, solid vibrant cosmic purple gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 22,
    name: "רם שמיר",
    role: "כתב צבא וכלי נשק",
    prompt: "Professional young Israeli male military correspondent in his early 30s, handsome, serious tactical expression, short military-style hair, wearing tactical vest over shirt, standing in military base, solid vibrant olive green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 23,
    name: "שני אלון",
    role: "כתבת דיגיטל ורשתות",
    prompt: "Professional young Israeli female digital media reporter in her mid 20s, beautiful, tech-savvy smile, modern styled hair, wearing trendy tech outfit, standing in digital studio, solid vibrant neon pink gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 24,
    name: "בן זוהר",
    role: "כתב היסטוריה ומורשת",
    prompt: "Professional young Israeli male history reporter in his late 20s, handsome, intellectual wise expression, classic styled hair, wearing vintage-style blazer, standing in historical site, solid vibrant sepia brown gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 25,
    name: "טל גולדברג",
    role: "כתבת חדשנות וסטארטאפים",
    prompt: "Professional young Israeli female innovation reporter in her mid 20s, beautiful, energetic entrepreneurial smile, modern trendy hair, wearing startup casual-chic blazer, standing in tech hub, solid vibrant lime green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 26,
    name: "אדם לוין",
    role: "כתב בלוקצ׳יין וקריפטו",
    prompt: "Professional young Israeli male cryptocurrency reporter in his late 20s, handsome, futuristic tech expression, modern styled hair, wearing smart tech outfit, standing in fintech office, solid vibrant electric orange gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 27,
    name: "מור שחר",
    role: "כתבת משחקי מחשב",
    prompt: "Professional young Israeli female gaming reporter in her mid 20s, beautiful, playful energetic smile, colorful styled hair, wearing gaming headset and casual gamer outfit, standing in gaming studio, solid vibrant neon green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 28,
    name: "נועם שגיא",
    role: "כתב פסיכולוגיה ומשפחה",
    prompt: "Professional young Israeli male psychology reporter in his early 30s, handsome, warm empathetic expression, professional neat hair, wearing casual blazer, standing in therapy office, solid vibrant soft sage green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 29,
    name: "ליה כהן",
    role: "מגישה - ערוץ הילדים",
    prompt: "Professional young Israeli female children's TV host in her mid 20s, beautiful, bright cheerful fun smile, colorful styled hair with accessories, wearing vibrant playful outfit, standing in colorful kids studio, solid vibrant rainbow gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 30,
    name: "מיה פרידמן",
    role: "מגישה - ערוץ הילדים",
    prompt: "Professional young Israeli female children's entertainer in her mid 20s, beautiful, joyful animated expression, fun styled ponytail, wearing bright playful costume, standing in kids play area, solid vibrant yellow gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 31,
    name: "מוחמד חסן",
    role: "כתב ערבי",
    prompt: "Professional young Israeli Arab male news reporter in his early 30s, handsome, confident expression, short neat black hair, wearing elegant dark suit, standing in newsroom, solid vibrant emerald green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 32,
    name: "הרב יעקב כהן",
    role: "כתב רבני",
    prompt: "Professional young Israeli Jewish Orthodox male reporter in his early 30s, handsome, wise thoughtful expression, black kippah on head, short beard, wearing white shirt and dark vest, standing in synagogue setting, solid vibrant royal blue gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  }
];

export default function GenerateReporterImages() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);

  const generateAllImages = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setGeneratedImages([]);

    const results = [];

    for (let i = 0; i < REPORTER_PROMPTS.length; i++) {
      const reporter = REPORTER_PROMPTS[i];
      
      try {
        console.log(`🎨 מייצר תמונה עבור ${reporter.name}...`);
        
        const result = await base44.integrations.Core.GenerateImage({
          prompt: reporter.prompt
        });

        results.push({
          ...reporter,
          imageUrl: result.url,
          success: true
        });

        setGeneratedImages([...results]);
        setProgress(((i + 1) / REPORTER_PROMPTS.length) * 100);

      } catch (err) {
        console.error(`❌ שגיאה ביצירת תמונה עבור ${reporter.name}:`, err);
        results.push({
          ...reporter,
          success: false,
          error: err.message
        });
        setGeneratedImages([...results]);
      }

      // Wait 1 second between requests to avoid rate limiting
      if (i < REPORTER_PROMPTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setLoading(false);
    console.log('✅ סיימתי ליצור את כל התמונות!');
  };

  const copyCode = () => {
    const code = `const REPORTERS = [
${generatedImages.filter(r => r.success).map((reporter, idx) => `  {
    id: ${reporter.id},
    name: "${reporter.name}",
    role: "${reporter.role}",
    image: "${reporter.imageUrl}",
    gender: "${reporter.id % 2 === 0 ? 'female' : 'male'}",
    categories: ${JSON.stringify(getCategories(reporter.role))},
    specialty: "${getSpecialty(reporter.role)}"
  }`).join(',\n')}
];`;

    navigator.clipboard.writeText(code);
    alert('הקוד הועתק! כעת תוכל להדביק אותו בקובץ ReportersFeed.jsx');
  };

  const getCategories = (role) => {
    const categoryMap = {
      "כתב ביטחון": ["security", "breaking"],
      "כתבת כלכלה": ["economy", "finance"],
      "כתב פוליטי": ["politics", "breaking"],
      "כתבת חינוך וחברה": ["world", "health"],
      "כתב ספורט": ["sports", "entertainment"],
      "כתבת בידור ותרבות": ["entertainment", "music"],
      "כתב טכנולוגיה": ["technology", "economy"],
      "כתבת בריאות ומדע": ["health", "world"],
      "כתב זירה בינלאומית": ["world", "breaking"],
      "כתב פיננסים": ["finance", "economy"],
      "כתבת מזלות ואסטרולוגיה": ["horoscope", "entertainment"],
      "כתב מוזיקה": ["music", "entertainment"],
      "כתבת אופנה וסגנון": ["entertainment", "world"],
      "כתב רכב וטכנולוגיה": ["technology", "economy"],
      "כתבת תיירות ונופש": ["world", "entertainment"],
      "כתב סביבה ואקולוגיה": ["health", "world"],
      "כתבת אוכל ומסעדות": ["entertainment", "health"],
      "כתב קולנוע וקריקטורות": ["entertainment", "world"],
      "כתבת משפט ופלילים": ["breaking", "politics"],
      "כתב נדל״ן ובנייה": ["economy", "finance"],
      "כתבת מדע וחלל": ["technology", "world"],
      "כתב צבא וכלי נשק": ["security", "breaking"],
      "כתבת דיגיטל ורשתות": ["technology", "entertainment"],
      "כתב היסטוריה ומורשת": ["world", "entertainment"],
      "כתבת חדשנות וסטארטאפים": ["technology", "economy"],
      "כתב בלוקצ׳יין וקריפטו": ["finance", "technology"],
      "כתבת משחקי מחשב": ["entertainment", "technology"],
      "כתב פסיכולוגיה ומשפחה": ["health", "world"],
      "מגישה - ערוץ הילדים": ["entertainment"],
      "כתב ערבי": ["world", "politics", "breaking"],
      "כתב רבני": ["world", "politics", "breaking"]
    };
    return categoryMap[role] || ["breaking"];
  };

  const getSpecialty = (role) => {
    const specialtyMap = {
      "כתב ביטחון": "מומחה לענייני ביטחון וצבא",
      "כתבת כלכלה": "מומחית לכלכלה ושווקים",
      "כתב פוליטי": "מומחה לפוליטיקה ישראלית",
      "כתבת חינוך וחברה": "מומחית לחינוך ונושאים חברתיים",
      "כתב ספורט": "מומחה לספורט ישראלי ובינלאומי",
      "כתבת בידור ותרבות": "מומחית לבידור ותרבות",
      "כתב טכנולוגיה": "מומחה לטכנולוגיה והייטק",
      "כתבת בריאות ומדע": "מומחית לבריאות ומדע",
      "כתב זירה בינלאומית": "מומחה לזירה הבינלאומית",
      "כתב פיננסים": "מומחה לפיננסים והשקעות",
      "כתבת מזלות ואסטרולוגיה": "אסטרולוגית ומומחית למזלות",
      "כתב מוזיקה": "מבקר מוזיקה וכתב תרבות",
      "כתבת אופנה וסגנון": "מומחית לאופנה ועיצוב",
      "כתב רכב וטכנולוגיה": "מומחה לרכב וחדשנות",
      "כתבת תיירות ונופש": "מומחית לתיירות וטיולים",
      "כתב סביבה ואקולוגיה": "מומחה לסביבה ואקלים",
      "כתבת אוכל ומסעדות": "מומחית לקולינריה ואוכל",
      "כתב קולנוע וקריקטורות": "מבקר קולנוע ומומחה לסדרות",
      "כתבת משפט ופלילים": "מומחית למשפט פלילי",
      "כתב נדל״ן ובנייה": "מומחה לנדל״ן ושוק הדיור",
      "כתבת מדע וחלל": "מומחית למדע וחקר החלל",
      "כתב צבא וכלי נשק": "מומחה לכלי נשק וציוד צבאי",
      "כתבת דיגיטל ורשתות": "מומחית לרשתות חברתיות ודיגיטל",
      "כתב היסטוריה ומורשת": "מומחה להיסטוריה ותרבות",
      "כתבת חדשנות וסטארטאפים": "מומחית לסטארטאפים וחדשנות",
      "כתב בלוקצ׳יין וקריפטו": "מומחה למטבעות דיגיטליים",
      "כתבת משחקי מחשב": "מומחית לגיימינג ומשחקים",
      "כתב פסיכולוגיה ומשפחה": "פסיכולוג ומומחה לקשרי משפחה",
      "מגישה - ערוץ הילדים": "מגישה לילדים ונוער",
      "כתב ערבי": "כתב המגזר הערבי והחברה הערבית בישראל",
      "כתב רבני": "כתב עניינים רבניים ויהדות"
    };
    return specialtyMap[role] || "";
  };

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">
          🎨 מחולל תמונות כתבים
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          לחץ על הכפתור למטה כדי ליצור תמונות AI ל-{REPORTER_PROMPTS.length} כתבים נוספים (כולל כוכבות ערוץ הילדים) עם רקעים צבעוניים ייחודיים
        </p>

        {!loading && generatedImages.length === 0 && (
          <Button
            onClick={generateAllImages}
            className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white px-8 py-6 text-lg"
          >
            התחל ליצור תמונות
          </Button>
        )}

        {loading && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-6 h-6 text-[#E31E24] animate-spin" />
              <span className="text-lg font-bold dark:text-white">
                מייצר תמונות... {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((reporter, index) => (
                <motion.div
                  key={reporter.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${
                    reporter.success
                      ? 'from-green-50 to-white dark:from-green-900/20 dark:to-gray-800'
                      : 'from-red-50 to-white dark:from-red-900/20 dark:to-gray-800'
                  } rounded-xl p-4 border-2 ${
                    reporter.success ? 'border-green-300' : 'border-red-300'
                  }`}
                >
                  {reporter.success ? (
                    <>
                      <div className="relative mb-3">
                        <img
                          src={reporter.imageUrl}
                          alt={reporter.name}
                          className="w-full aspect-square object-cover rounded-lg shadow-lg"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                          <Check size={16} />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg dark:text-white">{reporter.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{reporter.role}</p>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-red-600 font-bold mb-2">{reporter.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">שגיאה ביצירת התמונה</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {!loading && generatedImages.filter(r => r.success).length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 dark:text-white flex items-center gap-2">
                  <Download size={20} />
                  קוד מוכן להעתקה
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  לחץ על הכפתור למטה כדי להעתיק את הקוד עם כל ה-URLs החדשים
                </p>
                <Button
                  onClick={copyCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  העתק קוד
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}