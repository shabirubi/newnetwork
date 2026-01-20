import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Trophy, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function NewsQuiz() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `צור חידון של 5 שאלות על חדשות ישראליות אקטואליות מהשבוע האחרון. 
        כל שאלה צריכה להיות עם 4 תשובות אפשריות (אחת נכונה).
        החזר JSON בפורמט הזה בדיוק:
        {
          "questions": [
            {
              "question": "השאלה כאן",
              "answers": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
              "correct": 0
            }
          ]
        }`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answers: { type: "array", items: { type: "string" } },
                  correct: { type: "number" }
                }
              }
            }
          }
        }
      });
      setQuiz(result.questions);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } catch (error) {
      toast.error("שגיאה ביצירת החידון");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    if (index === quiz[currentQuestion].correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-black/80 to-[#E31E24]/40 dark:from-black/80 dark:to-[#E31E24]/30 rounded-2xl p-8 cursor-pointer shadow-2xl backdrop-blur-sm border border-[#E31E24]/20"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-[#E31E24]/20 backdrop-blur-sm rounded-full p-4 border border-[#E31E24]/40">
            <Brain className="w-8 h-8 text-[#E31E24]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">חידון חדשות</h3>
            <p className="text-gray-400">בחן את הידע שלך</p>
          </div>
        </div>
        <p className="text-white/80 text-sm">
          5 שאלות על האקטואליה - כמה תצליח לענות?
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-black/80 to-[#E31E24]/30 dark:from-black/80 dark:to-[#E31E24]/30 rounded-3xl p-8 max-w-2xl w-full border border-[#E31E24]/20 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-[#E31E24]" />
                  <h2 className="text-3xl font-bold text-white">חידון חדשות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[#E31E24]/20 rounded-full transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!quiz && !isGenerating && (
                <div className="text-center space-y-6">
                  <p className="text-gray-300 text-lg">
                    בוא נבדוק כמה אתה יודע על מה שקורה בארץ!
                  </p>
                  <Button
                    onClick={generateQuiz}
                    className="bg-[#E31E24] hover:bg-[#B91C1C] text-white px-8 py-6 text-lg"
                  >
                    התחל חידון
                  </Button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E31E24] mx-auto"></div>
                  <p className="text-gray-300">מכין שאלות...</p>
                </div>
              )}

              {quiz && !showResult && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      שאלה {currentQuestion + 1} מתוך {quiz.length}
                    </span>
                    <span className="text-[#E31E24] font-bold">
                      ניקוד: {score}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {quiz[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {quiz[currentQuestion].answers.map((answer, index) => (
                      <button
                        key={index}
                        onClick={() => selectedAnswer === null && handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl text-right transition-all border ${
                          selectedAnswer === null
                            ? 'bg-black/40 dark:bg-black/40 hover:bg-black/60 dark:hover:bg-black/60 border-gray-600 text-white'
                            : selectedAnswer === index
                            ? index === quiz[currentQuestion].correct
                              ? 'bg-green-600/80 text-white border-green-500'
                              : 'bg-red-600/80 text-white border-red-500'
                            : index === quiz[currentQuestion].correct
                            ? 'bg-green-600/80 text-white border-green-500'
                            : 'bg-black/40 dark:bg-black/40 border-gray-600 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{answer}</span>
                          {selectedAnswer !== null && index === quiz[currentQuestion].correct && (
                            <CheckCircle className="w-5 h-5" />
                          )}
                          {selectedAnswer === index && index !== quiz[currentQuestion].correct && (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showResult && (
                <div className="text-center space-y-6">
                  <Trophy className="w-20 h-20 text-[#E31E24] mx-auto" />
                  <h3 className="text-3xl font-bold text-white">
                    סיימת!
                  </h3>
                  <p className="text-2xl text-white">
                    הניקוד שלך: <span className="text-[#E31E24] font-bold">{score}/{quiz.length}</span>
                  </p>
                  <p className="text-gray-300">
                    {score === quiz.length
                      ? "מושלם! אתה ממש עדכני!"
                      : score >= 3
                      ? "לא רע בכלל, אבל יש מה לשפר"
                      : "אולי כדאי לקרוא יותר חדשות..."}
                  </p>
                  <Button
                    onClick={resetQuiz}
                    className="bg-[#E31E24] hover:bg-[#B91C1C] text-white"
                  >
                    שחק שוב
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}