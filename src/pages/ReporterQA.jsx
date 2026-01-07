import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  MessageCircleQuestion, ThumbsUp, User, 
  Clock, CheckCircle, Filter, TrendingUp,
  Volume2, Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const categoryLabels = {
  security: "ביטחון",
  economy: "כלכלה",
  politics: "פוליטיקה",
  technology: "טכנולוגיה",
  sports: "ספורט",
  entertainment: "בידור",
  world: "עולם",
  health: "בריאות",
  finance: "פיננסים",
  music: "מוזיקה",
  breaking: "חדשות חמות"
};

export default function ReporterQA() {
  const [filter, setFilter] = useState("all"); // all, answered, unanswered
  const [sortBy, setSortBy] = useState("votes"); // votes, recent
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState(localStorage.getItem('qa_user_email') || '');
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['reporter-questions'],
    queryFn: async () => {
      const result = await base44.entities.ReporterQuestion.list('-created_date', 100);
      return result;
    },
    staleTime: 0,
    refetchInterval: 30000,
    initialData: []
  });

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-qa'],
    queryFn: () => base44.entities.Reporter.list('name'),
    staleTime: 2 * 60 * 1000,
    initialData: []
  });

  const voteMutation = useMutation({
    mutationFn: async ({ questionId, currentVotes, votedBy }) => {
      const hasVoted = votedBy.includes(userEmail);
      const newVotedBy = hasVoted 
        ? votedBy.filter(email => email !== userEmail)
        : [...votedBy, userEmail];
      const newVotes = hasVoted ? currentVotes - 1 : currentVotes + 1;

      return await base44.entities.ReporterQuestion.update(questionId, {
        votes: newVotes,
        voted_by: newVotedBy
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reporter-questions'] });
    }
  });

  const handleVote = (question) => {
    if (!userEmail) {
      const email = prompt('הכנס את האימייל שלך להצבעה:');
      if (email) {
        setUserEmail(email);
        localStorage.setItem('qa_user_email', email);
        voteMutation.mutate({
          questionId: question.id,
          currentVotes: question.votes || 0,
          votedBy: question.voted_by || []
        });
      }
    } else {
      voteMutation.mutate({
        questionId: question.id,
        currentVotes: question.votes || 0,
        votedBy: question.voted_by || []
      });
    }
  };

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      if (filter === "answered") return q.is_answered;
      if (filter === "unanswered") return !q.is_answered;
      return true;
    })
    .filter(q => {
      if (!searchQuery) return true;
      return q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
             q.reporter_name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "votes") return (b.votes || 0) - (a.votes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const getReporter = (reporterId) => {
    return reporters.find(r => r.id === reporterId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-32 rounded-2xl mb-8" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] rounded-2xl p-8 mb-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircleQuestion className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">שאלות ותשובות</h1>
            <p className="text-white/90 text-lg">
              שאל את הכתבים שלנו ותקבל תשובות מקצועיות
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <span className="flex items-center gap-2">
            <MessageCircleQuestion className="w-5 h-5" />
            {questions.length} שאלות
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {questions.filter(q => q.is_answered).length} נענו
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="חפש שאלה או כתב..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 shrink-0" />
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === "all"
                  ? "bg-[#E31E24] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter("answered")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === "answered"
                  ? "bg-[#E31E24] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              נענו
            </button>
            <button
              onClick={() => setFilter("unanswered")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === "unanswered"
                  ? "bg-[#E31E24] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              ממתינות
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400 shrink-0" />
            <button
              onClick={() => setSortBy("votes")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                sortBy === "votes"
                  ? "bg-[#E31E24] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              פופולריות
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                sortBy === "recent"
                  ? "bg-[#E31E24] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              אחרונות
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <MessageCircleQuestion className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
            אין שאלות
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            היה הראשון לשאול שאלה לכתבים
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const reporter = getReporter(question.reporter_id);
            const hasVoted = question.voted_by?.includes(userEmail);

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:border-[#E31E24] dark:hover:border-[#E31E24] transition-all"
              >
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVote(question)}
                      disabled={voteMutation.isPending}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        hasVoted
                          ? "bg-[#E31E24] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#E31E24] hover:text-white"
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {question.votes || 0}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    {/* Reporter Info */}
                    <div className="flex items-center gap-3 mb-3">
                      {reporter && (
                        <img
                          src={reporter.image}
                          alt={question.reporter_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                          {question.reporter_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          {question.user_name}
                          <Clock className="w-3 h-3 mr-2" />
                          {new Date(question.created_date).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                      {question.category && (
                        <Badge variant="secondary" className="mr-auto">
                          {categoryLabels[question.category] || question.category}
                        </Badge>
                      )}
                    </div>

                    {/* Question */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {question.question}
                      </p>
                    </div>

                    {/* Answer */}
                    {question.is_answered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-r-4 border-[#E31E24] pr-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            תשובת {question.reporter_name}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                          {question.answer_text}
                        </p>
                        {question.answer_voice_url && (
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all">
                            <Volume2 className="w-4 h-4" />
                            האזן לתשובה
                          </button>
                        )}
                      </motion.div>
                    )}

                    {!question.is_answered && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        ממתין לתשובה...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}