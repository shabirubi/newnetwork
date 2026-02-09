import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, CreditCard, Calendar, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminFinance() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['admin-subscriptions-finance'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 1000)
  });

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const monthlyRevenue = activeSubscriptions.filter(s => s.plan_type === 'monthly').length * 99;
  const yearlyRevenue = activeSubscriptions.filter(s => s.plan_type === 'yearly').length * 990;
  const totalRevenue = monthlyRevenue + yearlyRevenue;

  const stats = [
    {
      label: 'הכנסות חודשיות',
      value: `₪${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'מנויים פעילים',
      value: activeSubscriptions.length,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'סה"כ הכנסות',
      value: `₪${totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">ניהול כספים</h2>
        <p className="text-gray-400">מעקב אחר הכנסות ומנויים</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-xl`}
            >
              <Icon className="w-8 h-8 text-white/90 mb-4" />
              <p className="text-white/80 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">מנויים אחרונים</h3>
        <div className="space-y-2">
          {subscriptions.slice(0, 10).map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center gap-3">
                {sub.status === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : sub.status === 'cancelled' ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="text-white font-medium">{sub.user_email}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{sub.plan_type === 'monthly' ? 'חודשי' : 'שנתי'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sub.created_date).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-white font-bold">
                  ₪{sub.plan_type === 'monthly' ? '99' : '990'}
                </p>
                <p className={`text-xs ${
                  sub.status === 'active' ? 'text-green-400' : 
                  sub.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {sub.status === 'active' ? 'פעיל' : 
                   sub.status === 'cancelled' ? 'בוטל' : 'פג תוקף'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}