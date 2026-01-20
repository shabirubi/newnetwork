import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "רב כהנא",
      role: "מנהל השקעות",
      company: "קרן בינלאומית",
      image: "https://i.pravatar.cc/150?img=1",
      text: "הרשת החדשה שינתה לנו את הדרך לצפייה בחדשות. מהירות העדכונים והאיכות של התוכן הם יוצאי דופן.",
      rating: 5
    },
    {
      id: 2,
      name: "דני לוי",
      role: "סמנכ\"ל דיגיטל",
      company: "קבוצת תקשורת גדולה",
      image: "https://i.pravatar.cc/150?img=2",
      text: "הטכנולוגיה של AI שלהם יצרה מהפכה בתעשיית התוכן. אנחנו משתמשים בזה כבר חצי שנה.",
      rating: 5
    },
    {
      id: 3,
      name: "ירדן כהן",
      role: "עורך ראשי",
      company: "פורטל חדשות",
      image: "https://i.pravatar.cc/150?img=3",
      text: "הערוץ הזה הוא עתיד התקשורת. אמינות, מהירות ואיכות - הכל באפליקציה אחת.",
      rating: 5
    },
    {
      id: 4,
      name: "שרה אברהם",
      role: "מנהלת בתוכן דיגיטלי",
      company: "אג'נסיה מדיה",
      image: "https://i.pravatar.cc/150?img=4",
      text: "הסטטיסטיקות שלהם מדויקות ממש. השימוש בעדויות בזמן אמת עזר לנו להחליט על כמה חלטות חשובות.",
      rating: 5
    },
    {
      id: 5,
      name: "ניתאי גלעד",
      role: "מנהל קרן השקעות",
      company: "VC דומיננטי",
      image: "https://i.pravatar.cc/150?img=5",
      text: "המודל העסקי שלהם בר קיימא ויוצר ערך אמיתי. זה בדיוק מה שחיפשנו בשוק התקשורת.",
      rating: 5
    }
  ];

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : testimonials.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < testimonials.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-white">מה אומרים עלינו</h2>
      </div>

      <div className="relative">
        {/* Testimonials Carousel */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {testimonials.slice(currentIndex, currentIndex + 3).map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all"
                  style={{
                    boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
                  }}
                >
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-[#E31E24] mb-4 opacity-50" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array(testimonial.rating).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-200 mb-6 text-sm leading-relaxed italic">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-[#E31E24]/30 pt-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-bold text-sm">{testimonial.name}</div>
                      <div className="text-gray-400 text-xs">{testimonial.role}</div>
                      <div className="text-gray-500 text-xs">{testimonial.company}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-16 w-10 h-10 rounded-full bg-[#E31E24] hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110 z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-16 w-10 h-10 rounded-full bg-[#E31E24] hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110 z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentIndex ? 'bg-[#E31E24] w-8' : 'bg-gray-600'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}