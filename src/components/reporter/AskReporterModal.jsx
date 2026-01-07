import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircleQuestion } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function AskReporterModal({ reporter, isOpen, onClose }) {
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ReporterQuestion.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reporter-questions'] });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setQuestion("");
        setName("");
        setEmail("");
        setSubmitted(false);
      }, 2000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !name.trim() || !email.trim()) return;

    submitMutation.mutate({
      reporter_id: reporter.id,
      reporter_name: reporter.name,
      user_name: name,
      user_email: email,
      question: question.trim(),
      category: reporter.categories?.[0] || 'general',
      votes: 0,
      voted_by: [],
      is_answered: false
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-[#E31E24]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                  <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">שאל את {reporter.name}</h2>
                  <p className="text-white/90 text-sm">{reporter.role}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {submitted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircleQuestion className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  השאלה נשלחה בהצלחה!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {reporter.name} יענה בהקדם האפשרי
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    השאלה שלך
                  </label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={`שאל את ${reporter.name} כל מה שמעניין אותך...`}
                    rows={5}
                    className="resize-none dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      שם מלא
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="השם שלך"
                      className="dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      אימייל
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="האימייל שלך"
                      className="dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-[#E31E24] hover:bg-[#B91C1C] text-white font-bold py-3"
                >
                  {submitMutation.isPending ? (
                    "שולח..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      שלח שאלה
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}