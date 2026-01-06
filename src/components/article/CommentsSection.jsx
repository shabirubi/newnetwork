import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { toast } from "sonner";

export default function CommentsSection({ articleId }) {
  const [newComment, setNewComment] = useState({ user_name: "", content: "" });
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: () => base44.entities.Comment.filter({ article_id: articleId, is_approved: true }, '-created_date'),
    initialData: []
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentData) => base44.entities.Comment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      setNewComment({ user_name: "", content: "" });
      toast.success("התגובה נוספה בהצלחה!");
    },
    onError: () => {
      toast.error("שגיאה בהוספת תגובה");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.user_name.trim() || !newComment.content.trim()) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    addCommentMutation.mutate({
      article_id: articleId,
      user_name: newComment.user_name,
      content: newComment.content,
      is_approved: true
    });
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-[#E31E24]" />
        <h2 className="text-2xl font-bold dark:text-white">
          תגובות ({comments.length})
        </h2>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-4 dark:text-white">הוסף תגובה</h3>
        <div className="space-y-4">
          <Input
            placeholder="השם שלך"
            value={newComment.user_name}
            onChange={(e) => setNewComment({ ...newComment, user_name: e.target.value })}
            className="dark:bg-gray-800 dark:text-white"
          />
          <Textarea
            placeholder="מה דעתך על הכתבה?"
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            rows={4}
            className="dark:bg-gray-800 dark:text-white"
          />
          <Button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="w-full bg-[#E31E24] hover:bg-[#B91C1C] text-white"
          >
            {addCommentMutation.isPending ? (
              "שולח..."
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                פרסם תגובה
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">טוען תגובות...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 py-8 dark:text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>עדיין אין תגובות. היה הראשון להגיב!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {moment(comment.created_date).fromNow()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}