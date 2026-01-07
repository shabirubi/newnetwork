import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, DollarSign, Euro, Loader2 } from "lucide-react";

export default function CurrencyRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const prompt = `תן לי את שערי המטבעות הנוכחיים של ישראל ביחס לשקל (ILS):
      
אני צריך נתונים אמיתיים ומדויקים מהרגע הזה.
חפש במקורות מהימנים כמו בנק ישראל, google finance, או yahoo finance.

החזר JSON עם המבנה הבא:
{
  "timestamp": "current time in hebrew",
  "currencies": [
    {
      "code": "USD",
      "name": "דולר אמריקאי",
      "rate": 3.65,
      "change": 0.02,
      "changePercent": 0.55
    },
    {
      "code": "EUR",
      "name": "יורו",
      "rate": 4.05,
      "change": -0.01,
      "changePercent": -0.25
    },
    {
      "code": "GBP",
      "name": "לירה שטרלינג",
      "rate": 4.75,
      "change": 0.03,
      "changePercent": 0.64
    }
  ]
}

חשוב: תן נתונים אמיתיים בלבד מהשוק כרגע!`;

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

      console.log('💱 שערי מטבע עודכנו:', result);
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
    // First fetch
    fetchRates();

    // Update every 30 seconds
    const interval = setInterval(fetchRates, 30000);
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
    <div className="flex items-center gap-4">
      {rates.currencies?.slice(0, 3).map((currency) => (
        <div
          key={currency.code}
          className="flex items-center gap-2 text-xs"
        >
          {currency.code === 'USD' && <DollarSign className="w-4 h-4 text-green-600" />}
          {currency.code === 'EUR' && <Euro className="w-4 h-4 text-blue-600" />}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currency.code}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ₪{currency.rate.toFixed(2)}
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