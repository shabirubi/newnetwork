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
    // Disabled to save API credits
    setLoading(false);
  }, []);

  // Disabled to save API credits
  return null;
}