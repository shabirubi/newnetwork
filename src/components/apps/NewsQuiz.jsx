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
        className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">חידון חדשות</h3>
            <p className="text-orange-100">בחן את הידע שלך</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-orange-600" />
                  <h2 className="text-3xl font-bold dark:text-white">חידון חדשות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {!quiz && !isGenerating && (
                <div className="text-center space-y-6">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    בוא נבדוק כמה אתה יודע על מה שקורה בארץ!
                  </p>
                  <Button
                    onClick={generateQuiz}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
                  >
                    התחל חידון
                  </Button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400">מכין שאלות...</p>
                </div>
              )}

              {quiz && !showResult && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      שאלה {currentQuestion + 1} מתוך {quiz.length}
                    </span>
                    <span className="text-orange-600 font-bold">
                      ניקוד: {score}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold dark:text-white">
                    {quiz[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {quiz[currentQuestion].answers.map((answer, index) => (
                      <button
                        key={index}
                        onClick={() => selectedAnswer === null && handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl text-right transition-all ${
                          selectedAnswer === null
                            ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            : selectedAnswer === index
                            ? index === quiz[currentQuestion].correct
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : index === quiz[currentQuestion].correct
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={selectedAnswer === null ? "dark:text-white" : ""}>{answer}</span>
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
                  <Trophy className="w-20 h-20 text-orange-600 mx-auto" />
                  <h3 className="text-3xl font-bold dark:text-white">
                    סיימת!
                  </h3>
                  <p className="text-2xl dark:text-white">
                    הניקוד שלך: <span className="text-orange-600 font-bold">{score}/{quiz.length}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {score === quiz.length
                      ? "מושלם! אתה ממש עדכני!"
                      : score >= 3
                      ? "לא רע בכלל, אבל יש מה לשפר"
                      : "אולי כדאי לקרוא יותר חדשות..."}
                  </p>
                  <Button
                    onClick={resetQuiz}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
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