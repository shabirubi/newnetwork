import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { DollarSign, Euro } from "lucide-react";

export default function CurrencyStrip() {
  const [currencies, setCurrencies] = useState([
    { code: "USD", name: "דולר אמריקאי", rate: 3.65, changePercent: 0.45 },
    { code: "EUR", name: "יורו", rate: 3.98, changePercent: -0.23 },
    { code: "GBP", name: "לירה שטרלינג", rate: 4.52, changePercent: 0.12 },
    { code: "BTC", name: "ביטקוין", rate: 365000, changePercent: 2.15 }
  ]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `תן לי את שערי המטבעות הנוכחיים של ישראל ביחס לשקל (ILS):
- דולר אמריקאי (USD)
- יורו (EUR)
- לירה שטרלינג (GBP)
- ביטקוין (BTC)

החזר JSON עם השערים והשינוי באחוזים.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              currencies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    code: { type: "string" },
                    name: { type: "string" },
                    rate: { type: "number" },
                    changePercent: { type: "number" }
                  }
                }
              }
            }
          }
        });

        if (result?.currencies && result.currencies.length > 0) {
          setCurrencies(result.currencies);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };

    fetchCurrencies();
    const interval = setInterval(fetchCurrencies, 20000);
    return () => clearInterval(interval);
  }, []);

  const displayItems = [...currencies, ...currencies];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 overflow-hidden border-b border-green-900/20 h-12">
      <motion.div
        className="flex gap-8 whitespace-nowrap h-full items-center text-base"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {displayItems.map((currency, idx) => (
          <motion.div
            key={`${currency.code}-${idx}`}
            className="flex-shrink-0 inline-flex items-center gap-3 px-6 py-2 rounded-xl border border-green-600/40"
            animate={{
              background: [
                'linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
                'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(34, 197, 94, 0.2))',
                'linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
              ],
              boxShadow: [
                '0 0 10px rgba(34, 197, 94, 0.3)',
                '0 0 20px rgba(34, 197, 94, 0.5)',
                '0 0 10px rgba(34, 197, 94, 0.3)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: idx * 0.2
            }}
          >
            {currency.code === 'USD' && <DollarSign className="w-6 h-6 text-green-400 animate-pulse" />}
            {currency.code === 'EUR' && <Euro className="w-6 h-6 text-blue-400 animate-pulse" />}
            {currency.code === 'BTC' && <span className="text-orange-400 font-bold text-lg animate-pulse">₿</span>}
            {currency.code === 'GBP' && <span className="text-blue-300 font-bold text-lg animate-pulse">£</span>}
            
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white text-sm">{currency.name}</span>
              <span className="text-green-400 font-bold text-base">
                ₪{currency.code === 'BTC' ? (currency.rate || 0).toFixed(0) : (currency.rate || 0).toFixed(2)}
              </span>
            </div>
            
            <motion.span 
              className={`font-bold text-base ml-2 ${(currency.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
              animate={{
                scale: [1, 1.15, 1],
                textShadow: [
                  '0 0 5px currentColor',
                  '0 0 15px currentColor',
                  '0 0 5px currentColor'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              {(currency.changePercent || 0) >= 0 ? '▲' : '▼'}{Math.abs(currency.changePercent || 0).toFixed(2)}%
            </motion.span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}