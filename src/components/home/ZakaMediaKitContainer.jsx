import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Heart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const units = [
  {
    id: 1,
    name: "הצלה מהירה",
    description: "יחידה מהירה להצלה וטיפול ראשוני בחירום",
    logo: "https://zaka.org.il/wp-content/uploads/2022/08/Group-4165.png",
    color: "from-red-600 to-red-700"
  },
  {
    id: 2,
    name: "יחידת חילוץ",
    description: "חילוץ אנשים מתאונות ומצבי חירום",
    logo: "https://zaka.org.il/wp-content/uploads/2022/08/Group-4164.png",
    color: "from-orange-600 to-orange-700"
  },
  {
    id: 3,
    name: "יחידת צוללים",
    description: "חילוץ וחיפוש במים וחדירת מבנים מימיים",
    logo: "https://zaka.org.il/wp-content/uploads/2022/08/Group-4162.png",
    color: "from-blue-600 to-blue-700"
  },
  {
    id: 4,
    name: "יחידת כלבים",
    description: "חיפוש והצלה באמצעות כלבי חילוץ",
    logo: "https://zaka.org.il/wp-content/uploads/2022/08/Group-4163.png",
    color: "from-amber-600 to-amber-700"
  },
  {
    id: 5,
    name: "יחידת הג'יפים",
    description: "הנעת פעולות בשטח קשה ובאזורים מרוחקים",
    logo: "https://zaka.org.il/wp-content/uploads/2022/08/Group-4168-1.png",
    color: "from-green-600 to-green-700"
  },
  {
    id: 6,
    name: "היחידה האווירית",
    description: "פעולות אווריות וסיוע מהאוויר",
    logo: "https://zaka.org.il/wp-content/uploads/2022/09/Group-4159.png",
    color: "from-sky-600 to-sky-700"
  }
];

export default function ZakaMediaKitContainer() {
  const [selectedUnit, setSelectedUnit] = useState(null);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">יחידות הצלה זק"א</h2>
        </div>
        <a
          href="https://zaka.org.il/media-kit/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors text-sm font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          לאתר הרשמי
        </a>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {units.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
              className={`group relative bg-gradient-to-br ${unit.color} rounded-xl p-4 cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:-translate-y-1 ${
                selectedUnit?.id === unit.id ? 'ring-2 ring-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : ''
              }`}
            >
              {/* Logo */}
              <div className="w-full h-32 mb-4 flex items-center justify-center bg-black/30 rounded-lg overflow-hidden">
                <img
                  src={unit.logo}
                  alt={unit.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">{unit.name}</h3>
                <p className="text-white/80 text-sm">{unit.description}</p>
              </div>

              {/* Expand Indicator */}
              <motion.div
                animate={{ scale: selectedUnit?.id === unit.id ? 1 : 0.8 }}
                className="absolute top-2 right-2"
              >
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  {selectedUnit?.id === unit.id ? 'פתוח' : 'עוד'}
                </Badge>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-red-900/30 to-black/60 border border-red-600/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-white mb-2">אודות זק"א</h3>
            <p className="text-gray-300 text-sm">
              זק"א - ארגון התנדבותי למענה חירום. יחידותינו פעילות 24/7 לטיפול במצבי חירום ניצחונים בכל יום ובכל שעה לשמירה על חיים.
            </p>
          </div>
        </div>
      </div>

      {/* Download Resources */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-white" />
          <h3 className="font-bold text-white">קבצים למדיה</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <p>✓ לוגוים בעברית, אנגלית, ערבית ורוסית</p>
          <p>✓ תמונות ווידיאוהים לשימוש חופשי</p>
          <p>✓ קבצים לוגו יחידות הצלה</p>
          <p>✓ תוכן אודות זק"א להורדה</p>
        </div>
      </div>
    </section>
  );
}