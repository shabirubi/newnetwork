import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Check, Film, Zap, Crown, Loader2, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // בדיקה אם המשתמש כבר רשום למנוי
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['my-subscription', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: userEmail }, '-created_date', 1);
      const activeSub = subs.find(s => s.status === 'active');
      if (activeSub) {
        // שמירת המייל ב-localStorage
        localStorage.setItem('user_email', userEmail);
      }
      return activeSub;
    },
    enabled: !!userEmail
  });

  useEffect(() => {
    const getEmail = async () => {
      // קודם כל נבדוק אם יש מייל שמור
      const storedEmail = localStorage.getItem('user_email');
      if (storedEmail) {
        setUserEmail(storedEmail);
        return;
      }
      
      // אם לא, ננסה לקבל מהאימות
      try {
        const user = await base44.auth.me();
        if (user?.email) setUserEmail(user.email);
      } catch (err) {
        // משתמש לא מחובר
      }
    };
    getEmail();
  }, []);

  const features = [
    'עורך סרטונים מתקדם ללא הגבלה',
    'ספריית אפקטים ומעברים מלאה',
    'AI Video Generator (Luma)',
    'יצירת תמונות AI',
    'דיבוב מתקדם (ElevenLabs)',
    'כיתובים אוטומטיים',
    'ספריית מוזיקה חינמית',
    'Picture-in-Picture',
    'יצירת פרסומות AI',
    'ספריית סרטונים מלאה',
    'ייצוא ללא הגבלה'
  ];

  const handleCheckout = async () => {
    if (!userEmail || !userEmail.trim()) {
      toast.error('אנא הזן כתובת אימייל');
      return;
    }

    // אם יש קוד קופון
    if (showCouponInput && couponCode.trim()) {
      setLoading(true);
      try {
        const { data } = await base44.functions.invoke('createCheckoutSession', {
          userEmail: userEmail.trim(),
          couponCode: couponCode.trim()
        });

        if (data.coupon_used) {
          // שמירת המייל ב-localStorage
          localStorage.setItem('user_email', userEmail.trim());
          toast.success('המנוי הופעל בהצלחה! 🎉');
          setTimeout(() => {
            window.location.href = '/VideoEditor';
          }, 1500);
          return;
        }
      } catch (error) {
        toast.error('קוד קופון לא תקין');
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }

    // תשלום רגיל
    if (window.self !== window.top) {
      toast.error('תשלום זמין רק באפליקציה המפורסמת, לא ב-Preview');
      return;
    }

    setLoading(true);
    try {
      const priceId = 'price_1SvTZcPkbtN03exRYfRfNzJK';

      const { data } = await base44.functions.invoke('createCheckoutSession', {
        priceId,
        userEmail: userEmail.trim()
      });

      if (data.url) {
        // שמור המייל לאחר התשלום
        localStorage.setItem('user_email', userEmail.trim());
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('שגיאה ביצירת תשלום: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-gradient-to-br from-green-900/40 to-black border border-green-500/30 rounded-3xl p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown size={40} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">המנוי שלך פעיל! 🎉</h1>
            <p className="text-gray-300">יש לך גישה מלאה לכל הכלים</p>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 mb-6 text-right">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">סוג מנוי:</span>
                <p className="text-white font-bold">{subscription.plan_type === 'monthly' ? 'חודשי' : 'שנתי'}</p>
              </div>
              <div>
                <span className="text-gray-400">סטטוס:</span>
                <p className="text-green-400 font-bold">פעיל</p>
              </div>
              {subscription.end_date && (
                <div className="col-span-2">
                  <span className="text-gray-400">תוקף עד:</span>
                  <p className="text-white font-bold">{new Date(subscription.end_date).toLocaleDateString('he-IL')}</p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => window.location.href = '/VideoEditor'}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
          >
            <Film size={24} className="ml-2" />
            התחל לערוך עכשיו
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            עורך סרטונים מתקדם
          </h1>
          <p className="text-xl text-gray-300">הכלים המקצועיים שלך ליצירת תוכן מושלם</p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-purple-900/40 to-black border-2 border-purple-500/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">מנוי חודשי</h2>
              <p className="text-gray-400">גישה מלאה לכל היכולות</p>
            </div>
            <div className="text-left">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ₪49
              </div>
              <div className="text-gray-400 text-sm">לחודש</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-3 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 text-gray-200"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-green-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-white mb-2">כתובת אימייל</label>
            <Input
              type="email"
              placeholder="הזן את האימייל שלך"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              readOnly={userEmail && userEmail.includes('@')}
              className={`bg-black/60 border-purple-500/30 text-white text-lg ${userEmail && userEmail.includes('@') ? 'opacity-80' : ''}`}
            />
          </div>

          {/* Coupon Section */}
          {!showCouponInput ? (
            <button
              onClick={() => setShowCouponInput(true)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4 flex items-center gap-2 mx-auto"
            >
              <Gift size={16} />
              יש לי קוד קופון
            </button>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">קוד קופון</label>
              <Input
                type="text"
                placeholder="הזן קוד קופון"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-black/60 border-green-500/30 text-white"
              />
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleCheckout}
            disabled={loading || !userEmail.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl py-6 rounded-2xl shadow-lg shadow-purple-500/30"
          >
            {loading ? (
              <><Loader2 size={24} className="ml-2 animate-spin" />מעבד...</>
            ) : showCouponInput && couponCode.trim() ? (
              <><Gift size={24} className="ml-2" />הפעל עם קוד</>
            ) : (
              <><Crown size={24} className="ml-2" />הצטרף עכשיו - ₪49/חודש</>
            )}
          </Button>

          <p className="text-center text-xs text-gray-500 mt-4">
            ניתן לבטל בכל עת • תשלום מאובטח • ללא התחייבות
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-400" />
            <span>תשלום מאובטח</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-400" />
            <span>ביטול בכל עת</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-400" />
            <span>תמיכה 24/7</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}