import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Menu, X, Radio, Newspaper, Shield, TrendingUp, 
  Vote, Cpu, Trophy, Clapperboard, Globe, Heart,
  Clock, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68238671d18a6312a669413d/a20bbab0c_image.png";

const categories = [
  { id: "breaking", label: "חדשות עכשיו", icon: Radio, href: "Home" },
  { id: "security", label: "ביטחון ומדיניות", icon: Shield, href: "Category?cat=security" },
  { id: "economy", label: "כלכלה ועסקים", icon: TrendingUp, href: "Category?cat=economy" },
  { id: "politics", label: "פוליטיקה", icon: Vote, href: "Category?cat=politics" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, href: "Category?cat=technology" },
  { id: "sports", label: "ספורט", icon: Trophy, href: "Category?cat=sports" },
  { id: "entertainment", label: "בידור ודרמה", icon: Clapperboard, href: "Category?cat=entertainment" },
  { id: "world", label: "חדשות עולם", icon: Globe, href: "Category?cat=world" },
  { id: "health", label: "בריאות", icon: Heart, href: "Category?cat=health" },
];

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`
        :root {
          --primary: #E31E24;
          --primary-dark: #B91C1C;
          --primary-light: #FEE2E2;
        }
      `}</style>

      {/* Breaking News Ticker */}
      <div className="bg-[#E31E24] text-white py-2 overflow-hidden">
        <div className="flex items-center">
          <span className="bg-white text-[#E31E24] px-4 py-1 font-bold text-sm shrink-0 mr-4">
            חדשות חמות
          </span>
          <div className="ticker-wrapper overflow-hidden flex-1">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <span className="mx-8">• פיגוע נסכל בגבול הצפון - צה"ל מדווח על ניטרול מחבלים</span>
              <span className="mx-8">• הבורסה בתל אביב פותחת במגמה חיובית</span>
              <span className="mx-8">• ראש הממשלה ייפגש היום עם נשיא ארה"ב</span>
              <span className="mx-8">• מזג אוויר: גל חום כבד צפוי בסוף השבוע</span>
              <span className="mx-8">• פיגוע נסכל בגבול הצפון - צה"ל מדווח על ניטרול מחבלים</span>
              <span className="mx-8">• הבורסה בתל אביב פותחת במגמה חיובית</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#E31E24] transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center">
              <img 
                src={LOGO_URL} 
                alt="הרשת החדשה" 
                className="h-20 w-auto"
              />
            </Link>

            {/* Live Indicator */}
            <Link 
              to={createPageUrl("Live")}
              className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2 rounded-full hover:bg-[#B91C1C] transition-all"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="font-bold text-sm">שידור חי</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-1 pb-3 border-t border-gray-100 pt-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={createPageUrl(cat.href)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#E31E24] hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
              >
                <cat.icon size={18} />
                {cat.label}
              </Link>
            ))}
            <Link
              to={createPageUrl("Schedule")}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#E31E24] hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
            >
              <Clock size={18} />
              לוח שידורים
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
              <div className="p-6">
                <img 
                  src={LOGO_URL} 
                  alt="הרשת החדשה" 
                  className="h-12 w-auto mb-8"
                />
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={createPageUrl(cat.href)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#E31E24] hover:bg-red-50 rounded-xl transition-all"
                    >
                      <cat.icon size={20} />
                      {cat.label}
                      <ChevronLeft size={16} className="mr-auto" />
                    </Link>
                  ))}
                  <Link
                    to={createPageUrl("Schedule")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#E31E24] hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Clock size={20} />
                    לוח שידורים
                    <ChevronLeft size={16} className="mr-auto" />
                  </Link>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src={LOGO_URL} 
                alt="הרשת החדשה" 
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 text-sm">
                ערוץ חדשות דיגיטלי מבוסס AI עם בקרה אנושית, המייצר תוכן דיגיטלי במהירות ובאיכות.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">קטגוריות</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl("Category?cat=security")} className="hover:text-[#E31E24]">ביטחון ומדיניות</Link></li>
                <li><Link to={createPageUrl("Category?cat=economy")} className="hover:text-[#E31E24]">כלכלה ועסקים</Link></li>
                <li><Link to={createPageUrl("Category?cat=politics")} className="hover:text-[#E31E24]">פוליטיקה</Link></li>
                <li><Link to={createPageUrl("Category?cat=technology")} className="hover:text-[#E31E24]">טכנולוגיה</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">עוד</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl("Category?cat=sports")} className="hover:text-[#E31E24]">ספורט</Link></li>
                <li><Link to={createPageUrl("Category?cat=entertainment")} className="hover:text-[#E31E24]">בידור ודרמה</Link></li>
                <li><Link to={createPageUrl("Category?cat=world")} className="hover:text-[#E31E24]">חדשות עולם</Link></li>
                <li><Link to={createPageUrl("Category?cat=health")} className="hover:text-[#E31E24]">בריאות</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">התחברו אלינו</h4>
              <p className="text-gray-400 text-sm mb-4">
                הצטרפו למהפכה התקשורתית פורצת הדרך
              </p>
              <Link 
                to={createPageUrl("Live")}
                className="inline-flex items-center gap-2 bg-[#E31E24] text-white px-6 py-3 rounded-full hover:bg-[#B91C1C] transition-all"
              >
                <Radio size={18} />
                צפו בשידור חי
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 הרשת החדשה. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}