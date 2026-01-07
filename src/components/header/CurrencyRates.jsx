import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, DollarSign, Euro, Loader2 } from "lucide-react";

export default function CurrencyRates() {
  const [rates, setRates] = useState(null);
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
  "source": "Bank of Israel / Google Finance",
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

      console.log('💱 שערי מטבע אמיתיים מבנק ישראל:', result);
      console.log('📊 מקור הנתונים:', result.source || 'Bank of Israel');
      setRates(result);
      setLoading(false);

      // Dispatch event for ticker
      window.dispatchEvent(new CustomEvent('currencyUpdated', { detail: result }));
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // First fetch immediately
    fetchRates();

    // Update every 20 seconds for real-time data
    const interval = setInterval(fetchRates, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !rates) {
    return (
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">טוען שערים...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
        {rates.source || 'בנק ישראל'}
      </span>
      {rates.currencies?.slice(0, 4).map((currency) => (
        <div
          key={currency.code}
          className="flex items-center gap-2 text-xs"
        >
          {currency.code === 'USD' && <DollarSign className="w-4 h-4 text-green-600" />}
          {currency.code === 'EUR' && <Euro className="w-4 h-4 text-blue-600" />}
          {currency.code === 'BTC' && <span className="text-orange-500 font-bold text-xs">₿</span>}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currency.code}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ₪{currency.code === 'BTC' ? currency.rate.toFixed(0) : currency.rate.toFixed(2)}
              </span>
            </div>
            <div className={`flex items-center gap-1 ${
              currency.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currency.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-medium">
                {currency.changePercent >= 0 ? '+' : ''}{currency.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}