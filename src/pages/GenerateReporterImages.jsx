import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Download } from "lucide-react";
import { motion } from "framer-motion";

const REPORTER_PROMPTS = [
  {
    id: 1,
    name: "רועי שרון",
    role: "כתב ביטחון",
    prompt: "Professional young Israeli male news reporter in his late 20s, handsome, confident expression, short dark hair, clean-shaven, wearing elegant dark suit and tie, standing in professional newsroom, solid vibrant orange gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 2,
    name: "מיכל כהן",
    role: "כתבת כלכלה",
    prompt: "Professional young Israeli female news reporter in her mid 20s, beautiful, elegant smile, long dark hair, wearing professional dark blue blazer, standing in modern studio, solid vibrant emerald green gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 3,
    name: "יוסי לוי",
    role: "כתב פוליטי",
    prompt: "Professional young Israeli male political reporter in his early 30s, handsome, serious professional expression, short styled hair, wearing elegant navy suit and red tie, standing in parliament, solid vibrant deep blue gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 4,
    name: "שרה אברהם",
    role: "כתבת חינוך וחברה",
    prompt: "Professional young Israeli female education reporter in her late 20s, beautiful, warm friendly smile, shoulder-length brown hair, wearing professional cream blazer, standing in modern studio, solid vibrant purple gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 5,
    name: "דוד מזרחי",
    role: "כתב ספורט",
    prompt: "Professional young Israeli male sports reporter in his mid 20s, handsome athletic build, energetic smile, short hair, wearing casual sports jacket, standing in sports studio, solid vibrant red gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 6,
    name: "נועה ברק",
    role: "כתבת בידור ותרבות",
    prompt: "Professional young Israeli female entertainment reporter in her mid 20s, beautiful, bright cheerful smile, long wavy hair, wearing stylish pink blazer, standing in entertainment studio, solid vibrant magenta gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 7,
    name: "אלון גולן",
    role: "כתב טכנולוגיה",
    prompt: "Professional young Israeli male technology reporter in his late 20s, handsome, intelligent look, modern glasses, short neat hair, wearing smart casual tech blazer, standing in tech studio, solid vibrant cyan blue gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 8,
    name: "תמר רוזן",
    role: "כתבת בריאות ומדע",
    prompt: "Professional young Israeli female health reporter in her late 20s, beautiful, caring smile, long dark hair pulled back, wearing white medical coat over professional attire, standing in medical studio, solid vibrant teal gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
  },
  {
    id: 9,
    name: "עומר אשכנזי",
    role: "כתב זירה בינלאומית",
    prompt: "Professional young Israeli male international news reporter in his early 30s, handsome, worldly expression, short styled hair, wearing elegant dark suit, standing with world backdrop, solid vibrant deep indigo gradient background, cinematic lighting, photorealistic, high quality, 8K, professional headshot"
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
      "כתבת כלכלה": ["economy", "politics"],
      "כתב פוליטי": ["politics", "breaking"],
      "כתבת חינוך וחברה": ["world", "health"],
      "כתב ספורט": ["sports", "entertainment"],
      "כתבת בידור ותרבות": ["entertainment", "world"],
      "כתב טכנולוגיה": ["technology", "economy"],
      "כתבת בריאות ומדע": ["health", "world"],
      "כתב זירה בינלאומית": ["world", "breaking"]
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
      "כתב זירה בינלאומית": "מומחה לזירה הבינלאומית"
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
          לחץ על הכפתור למטה כדי ליצור תמונות AI לכל 9 הכתבים עם רקעים צבעוניים ייחודיים
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