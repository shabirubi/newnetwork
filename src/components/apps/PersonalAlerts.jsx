import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PersonalAlerts() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsAlerts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newAlert, setNewAlert] = useState("");

  const addAlert = () => {
    if (!newAlert.trim()) return;
    const updated = [...alerts, { id: Date.now(), keyword: newAlert, active: true }];
    setAlerts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsAlerts', JSON.stringify(updated));
    }
    setNewAlert("");
    toast.success("התראה נוספה בהצלחה!");
  };

  const removeAlert = (id) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsAlerts', JSON.stringify(updated));
    }
    toast.success("התראה הוסרה");
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 cursor-pointer shadow-2xl relative"
        onClick={() => setIsOpen(true)}
      >
        {alerts.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {alerts.length}
          </div>
        )}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">התראות אישיות</h3>
            <p className="text-green-100">קבל עדכונים על נושאים שמעניינים אותך</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          הגדר מילות מפתח ותקבל התראה כשמתפרסמת כתבה רלוונטית
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Bell className="w-8 h-8 text-green-600" />
                  <h2 className="text-3xl font-bold dark:text-white">התראות אישיות</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="הוסף מילת מפתח (לדוגמא: בורסה, טכנולוגיה)"
                    value={newAlert}
                    onChange={(e) => setNewAlert(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAlert()}
                    className="flex-1"
                  />
                  <Button
                    onClick={addAlert}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      עדיין לא הגדרת התראות. הוסף מילות מפתח כדי להתחיל לקבל עדכונים!
                    </p>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-green-600" />
                          <span className="font-medium dark:text-white">{alert.keyword}</span>
                        </div>
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    💡 טיפ: ההתראות יופעלו אוטומטית כאשר תתפרסם כתבה המכילה את מילות המפתח שהגדרת
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}