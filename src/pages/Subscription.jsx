import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const PLANS = [
  {
    name: "Basic",
    price: 49,
    priceId: "price_1QhNdIBzxx2dxxxx",
    description: "התחל ליצור",
    features: [
      "5 סרטונים בחודש",
      "כלים בסיסיים",
      "איכות 720p",
      "ללא watermark",
      "support דוא״ל"
    ],
    icon: Sparkles,
    highlight: false
  },
  {
    name: "Pro",
    price: 99,
    priceId: "price_1QhNdIBzxx2dxxxx",
    description: "הבחירה האופטימלית",
    features: [
      "50 סרטונים בחודש",
      "כל הכלים",
      "איכות 1080p",
      "ללא watermark",
      "עדיפות בעיבוד",
      "API access",
      "support עדיפות"
    ],
    icon: Zap,
    highlight: true
  },
  {
    name: "Premium",
    price: 199,
    priceId: "price_1QhNdIBzxx2dxxxx",
    description: "כוח מלא",
    features: [
      "סרטונים unlimited",
      "כל הכלים ותוספים",
      "איכות 4K",
      "ללא watermark",
      "עדיפות highest",
      "API access unlimited",
      "VIP support 24/7",
      "custom integrations"
    ],
    icon: Crown,
    highlight: false
  }
];

export default function Subscription() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId) => {
    setLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });

      const { sessionId, url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black py-12 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            בחר את התוכנית שלך
          </h1>
          <p className="text-xl text-gray-300">
            שותפות באקזיט של הרשת החדשה 🚀
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl overflow-hidden transition-all ${
                  plan.highlight
                    ? "border-2 border-purple-500 shadow-2xl shadow-purple-500/50"
                    : "border border-gray-700"
                }`}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-black" />

                {/* Content */}
                <div className="relative p-8 h-full flex flex-col">
                  {/* Highlight Badge */}
                  {plan.highlight && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                      ⭐ מומלץ
                    </div>
                  )}

                  {/* Icon & Title */}
                  <div className="mb-6">
                    <Icon className="w-12 h-12 text-purple-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">₪{plan.price}</span>
                      <span className="text-gray-400">/חודש</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleCheckout(plan.priceId)}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      plan.highlight
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    } disabled:opacity-50`}
                  >
                    {loading ? "טוען..." : "בחר תוכנית"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to={createPageUrl("Home")}>
            <Button className="bg-gray-800 hover:bg-gray-700">חזור לבית</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}