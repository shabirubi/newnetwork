import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, MapPin, Clock, Camera, Send, 
  CheckCircle, MessageSquare, User, Phone,
  Construction, Car, Flame, Droplets, Zap, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

const hazardTypes = [
  { id: "road", label: "מפגע בכביש", icon: Car, color: "bg-orange-500" },
  { id: "construction", label: "סכנה מבניין", icon: Construction, color: "bg-yellow-500" },
  { id: "fire", label: "שריפה/עשן", icon: Flame, color: "bg-red-500" },
  { id: "water", label: "הצפה/נזילה", icon: Droplets, color: "bg-blue-500" },
  { id: "electric", label: "סכנת חשמל", icon: Zap, color: "bg-purple-500" },
  { id: "other", label: "אחר", icon: AlertCircle, color: "bg-gray-500" },
];

const recentReports = [
  { id: 1, type: "road", location: "רח' הרצל 45, תל אביב", time: "לפני 15 דקות", status: "בטיפול", description: "בור גדול בכביש" },
  { id: 2, type: "water", location: "שד' רוטשילד, ת\"א", time: "לפני 30 דקות", status: "התקבל", description: "נזילת מים מצינור" },
  { id: 3, type: "construction", location: "רח' דיזנגוף 100", time: "לפני שעה", status: "טופל", description: "פיגום לא יציב" },
];

export default function PublicReports() {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    phone: "",
    name: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || !formData.location || !formData.description) return;
    
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setSelectedType(null);
      setFormData({ location: "", description: "", phone: "", name: "" });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">דיווחי הציבור</h1>
            <p className="text-orange-100">דווחו על מפגעים ומצבי חירום באזורכם</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="lg:col-span-2">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                שליחת דיווח חדש
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">הדיווח התקבל בהצלחה!</h3>
                    <p className="text-gray-600 dark:text-gray-400">תודה על הדיווח. הגורמים הרלוונטיים יטפלו בהקדם.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Hazard Type Selection */}
                    <div>
                      <label className="block text-sm font-bold mb-3 dark:text-white">סוג המפגע</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {hazardTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <motion.button
                              key={type.id}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedType(type.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                selectedType === type.id
                                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30"
                                  : "border-gray-200 dark:border-gray-600 hover:border-orange-300"
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full ${type.color} flex items-center justify-center mx-auto mb-2`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-sm font-medium dark:text-white">{type.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">מיקום</label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="כתובת מדויקת או תיאור מיקום"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-bold mb-2 dark:text-white">תיאור המפגע</label>
                      <Textarea
                        placeholder="תארו את המפגע בפירוט..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 dark:text-white">שם (אופציונלי)</label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            placeholder="שם מלא"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 dark:text-white">טלפון (אופציונלי)</label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            placeholder="מספר טלפון"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit"
                      disabled={!selectedType || !formData.location || !formData.description || isSubmitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-bold"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 ml-2" />
                          שלח דיווח
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Clock className="w-5 h-5 text-gray-500" />
                דיווחים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map((report, index) => {
                const type = hazardTypes.find(t => t.id === report.type) || hazardTypes[5];
                const Icon = type.icon;
                
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${type.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm dark:text-white">{report.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {report.location}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{report.time}</span>
                          <Badge className={
                            report.status === "טופל" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            report.status === "בטיפול" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Emergency Numbers */}
          <Card className="mt-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm dark:text-white">
                <Phone className="w-4 h-4 text-red-500" />
                מספרי חירום
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">100</p>
                <p className="text-xs text-red-700 dark:text-red-300">משטרה</p>
              </div>
              <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">102</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">כבאות</p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">101</p>
                <p className="text-xs text-green-700 dark:text-green-300">מד"א</p>
              </div>
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">106</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">עירייה</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}