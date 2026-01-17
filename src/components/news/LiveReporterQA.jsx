import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageCircle, Clock, TrendingUp } from "lucide-react";
import moment from "moment";

export default function LiveReporterQA() {
  const [selectedReporter, setSelectedReporter] = useState(null);

  const { data: questions = [] } = useQuery({
    queryKey: ['reporter-questions'],
    queryFn: () => base44.entities.ReporterQuestion.list('-votes', 20),
    initialData: [],
    refetchInterval: 10000
  });

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const topQuestions = selectedReporter 
    ? questions.filter(q => q.reporter_id === selectedReporter.id).slice(0, 5)
    : questions.slice(0, 5);

  return (
    <section className="px-4 sm:px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#E31E24]" />
          <h2 className="text-2xl font-bold dark:text-white">שאלות לכתבים</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reporters List */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 space-y-3">
            <h3 className="text-white font-bold text-lg">בחר כתב</h3>
            
            {/* All Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedReporter(null)}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all text-sm ${
                selectedReporter === null
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              כל הכתבים
            </motion.button>

            {/* Reporters */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {reporters.map((reporter) => (
                <motion.button
                  key={reporter.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReporter(reporter)}
                  className={`w-full text-right py-3 px-4 rounded-xl transition-all group ${
                    selectedReporter?.id === reporter.id
                      ? 'bg-[#E31E24] text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm">{reporter.name}</div>
                      <div className="text-xs opacity-80">{reporter.role}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {topQuestions.length === 0 ? (
              <div className="bg-gray-800 rounded-2xl p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">אין שאלות בקטגוריה זו כרגע</p>
              </div>
            ) : (
              <AnimatePresence>
                {topQuestions.map((question, idx) => {
                  const reporter = reporters.find(r => r.id === question.reporter_id);
                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700 hover:border-[#E31E24]/50 transition-all group"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {reporter && (
                          <img
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">
                              {question.user_name}
                            </span>
                            {question.is_answered && (
                              <span className="px-2 py-0.5 bg-green-600/30 text-green-400 text-xs rounded-full">
                                ✓ נענה
                              </span>
                            )}
                          </div>
                          <h4 className="text-white font-bold text-base leading-tight mb-2">
                            {question.question}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {moment(question.created_date).fromNow()}
                          </div>
                        </div>
                      </div>

                      {/* Answer */}
                      {question.is_answered && question.answer_text && (
                        <div className="bg-gray-700/50 rounded-lg p-3 mb-3 border-r-2 border-[#E31E24]">
                          <div className="text-xs text-green-400 font-bold mb-1">תשובה מהכתב:</div>
                          <p className="text-gray-200 text-sm">{question.answer_text}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 text-gray-400 hover:text-[#E31E24] transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-bold">{question.votes || 0}</span>
                        </motion.button>
                        
                        {question.is_answered && question.answer_voice_url && (
                          <audio 
                            controls 
                            className="h-6 text-xs"
                          >
                            <source src={question.answer_voice_url} type="audio/mpeg" />
                          </audio>
                        )}

                        <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                          {question.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}