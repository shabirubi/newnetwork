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
      <div className="bg-gradient-to-r from-green-900 to-blue-900 dark:from-green-950 dark:to-blue-950 text-white py-1.5 overflow-hidden">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">טוען שערי מטבע מבנק ישראל...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900 to-blue-900 dark:from-green-950 dark:to-blue-950 text-white py-1.5 overflow-hidden">
      <div className="flex items-center gap-2 px-2">
        <span className="bg-green-600 text-white px-2 py-0.5 font-bold text-[10px] shrink-0 flex items-center gap-1 rounded">
          <DollarSign className="w-3 h-3" />
          שערי מטבע
        </span>

        <div className="ticker-wrapper overflow-hidden flex-1">
          <motion.div
            className="flex whitespace-nowrap text-xs items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...currencies, ...currencies].map((currency, index) => (
              <div
                key={`${currency.code}-${index}`}
                className="flex items-center gap-2 mx-6 bg-white/10 px-3 py-1 rounded-lg"
              >
                {currency.code === 'USD' && <DollarSign className="w-3 h-3 text-green-400" />}
                {currency.code === 'EUR' && <Euro className="w-3 h-3 text-blue-400" />}
                {currency.code === 'BTC' && <span className="text-orange-400 font-bold text-xs">₿</span>}
                
                <span className="font-bold">{currency.name}</span>
                <span className="text-yellow-300">
                  ₪{currency.code === 'BTC' ? currency.rate.toFixed(0) : currency.rate.toFixed(2)}
                </span>
                
                <div className={`flex items-center gap-1 ${
                  currency.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {currency.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-bold">
                    {currency.changePercent >= 0 ? '+' : ''}{currency.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}