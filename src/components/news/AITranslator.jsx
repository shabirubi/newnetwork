import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "he", name: "עברית", flag: "🇮🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export default function AITranslator({ articleId, originalText }) {
  const [selectedLang, setSelectedLang] = useState("he");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTranslate = async (langCode) => {
    setSelectedLang(langCode);
    if (langCode === "he") return;
    
    setIsTranslating(true);
    // Simulate translation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTranslating(false);
  };

  const handleSpeak = () => {
    setIsSpeaking(true);
    // Simulate speech
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">תרגום AI:</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 dark:border-blue-600 dark:text-white">
            {isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{languages.find(l => l.code === selectedLang)?.flag}</span>
                <span>{languages.find(l => l.code === selectedLang)?.name}</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleTranslate(lang.code)}
              className="gap-2"
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSpeak}
        className="gap-2 dark:border-purple-600 dark:text-white"
        disabled={isSpeaking}
      >
        {isSpeaking ? (
          <>
            <Volume2 className="w-4 h-4 animate-pulse text-purple-600" />
            מקריא...
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            הקראה
          </>
        )}
      </Button>
    </div>
  );
}