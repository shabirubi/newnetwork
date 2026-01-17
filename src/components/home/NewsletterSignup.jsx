import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 sm:px-4 mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E31E24] via-red-600 to-red-700 p-8 sm:p-12"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            קבל עדכונים יומיים
          </h2>
          <p className="text-white/90 text-lg mb-8">
            היה הראשון לדעת על החדשות החמות. הירשם לניוזלטר שלנו וקבל סיכום יומי בדוא"ל.
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
            >
              <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
              <div>
                <p className="text-white font-bold">תודה על ההרשמה!</p>
                <p className="text-white/80 text-sm">תקבל את הניוזלטר שלנו מחר</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="הכנס את הדוא״ל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 pl-12 py-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className="bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    מעלה...
                  </>
                ) : (
                  <>
                    הירשם
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          <p className="text-white/70 text-xs mt-4">
            אנחנו לא נשלח ספאם. אתה יכול להסתלק בכל עת.
          </p>
        </div>
      </motion.div>
    </section>
  );
}