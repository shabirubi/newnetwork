import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Euro, Loader2 } from "lucide-react";

export default function CurrencyTicker() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const prompt = `תן לי את שערי המטבעות הנוכחיים של ישראל ביחס לשקל (ILS) ממקורות אמיתיים:

חובה לחפש ב:
1. בנק ישראל (www.boi.org.il) - המקור הרשמי והמהימן ביותר
2. גוגל פיננסים / יאהו פיננסים
3. שוקי מטבעות בזמן אמת

אני צריך את השערים האמיתיים והמדויקים של:
- דולר אמריקאי (USD)
- יורו (EUR) 
- לירה שטרלינג (GBP)
- ביטקוין (BTC)
- דולר אוסטרלי (AUD)
- דולר קנדי (CAD)
- יין יפני (JPY)
- פרנק שוויצרי (CHF)

החזר JSON במבנה הבא עם נתונים אמיתיים בלבד מהרגע הנוכחי:
{
  "timestamp": "current time in hebrew format",
  "source": "Bank of Israel",
  "currencies": [
    {
      "code": "USD",
      "name": "דולר אמריקאי",
      "rate": 3.65,
      "change": 0.02,
      "changePercent": 0.55
    }
  ]
}

CRITICAL: השתמש רק במקורות מהימנים. בנק ישראל הוא המקור העיקרי והמדויק ביותר!`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            timestamp: { type: "string" },
            source: { type: "string" },
            currencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  name: { type: "string" },
                  rate: { type: "number" },
                  change: { type: "number" },
                  changePercent: { type: "number" }
                }
              }
            }
          }
        }
      });

      console.log('💱 שערי מטבע אמיתיים:', result);
      setCurrencies(result.currencies || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || currencies.length === 0) {
    return (
      <div className="bg-black/80 backdrop-blur-xl text-white py-2 overflow-hidden shadow-lg border-y border-white/10">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-bold">טוען שערי מטבע...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/80 backdrop-blur-xl text-white py-2 overflow-hidden shadow-lg border-y border-white/10">
      <div className="flex items-center gap-3 px-4">
        <motion.div 
          className="bg-white/20 backdrop-blur-xl px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-2 shadow-lg border border-white/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <DollarSign className="w-4 h-4" />
          שערי מטבע
        </motion.div>

        <div className="ticker-wrapper overflow-hidden flex-1">
          <motion.div
            className="flex whitespace-nowrap text-sm items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...currencies, ...currencies].map((currency, index) => (
              <motion.div
                key={`${currency.code}-${index}`}
                className="flex items-center gap-2 mx-4 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl shadow-lg border border-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                {currency.code === 'USD' && <DollarSign className="w-4 h-4 text-yellow-300" />}
                {currency.code === 'EUR' && <Euro className="w-4 h-4 text-blue-300" />}
                {currency.code === 'BTC' && <span className="text-orange-300 font-bold text-sm">₿</span>}
                {currency.code === 'GBP' && <span className="text-purple-300 font-bold text-sm">£</span>}
                
                <span className="font-bold">{currency.name}</span>
                <span className="text-yellow-200 font-bold">
                  ₪{currency.code === 'BTC' ? currency.rate.toFixed(0) : currency.rate.toFixed(2)}
                </span>
                
                <div className={`flex items-center gap-1 font-bold ${
                  currency.change >= 0 ? 'text-lime-300' : 'text-red-300'
                }`}>
                  {currency.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {currency.changePercent >= 0 ? '▲' : '▼'}{Math.abs(currency.changePercent).toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}