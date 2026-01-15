import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, User, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ReporterChatModal({ reporter, article, onClose }) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser({ email: "guest@example.com", full_name: "אורח" });
      }
    };
    getUser();
  }, []);

  // Fetch chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['reporter-chat', reporter.id, article?.id],
    queryFn: async () => {
      // Filter by reporter_id only - article_id is not reliable
      const filter = { reporter_id: String(reporter.id) };
      
      console.log('🔍 מחפש הודעות עם פילטר:', filter);
      let result = await base44.entities.ReporterChat.filter(filter, 'created_date', 100);
      
      // If article exists, filter client-side
      if (article?.id) {
        result = result.filter(msg => msg.article_id === String(article.id));
      }
      
      console.log('📨 הודעות שנמצאו:', result);
      return result;
    },
    refetchInterval: 2000,
    staleTime: 0,
    refetchOnMount: true,
    initialData: []
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.ReporterChat.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reporter-chat']);
    }
  });

  // Get AI-powered professional reporter response with voice
  const getReporterResponse = async (userMessage) => {
    try {
      const contextPrompt = `
אתה ${reporter.name}, ${reporter.role} בהרשת החדשה, מתמח/ת ב${reporter.specialty}.
${reporter.gender === 'female' ? 'את כתבת מקצועית' : 'אתה כתב מקצועי'} עם ניסיון רב בתחום, ואת/ה מדבר/ת בצורה נעימה, חכמה ומנחה.

${article ? `כרגע מדוברים על הכתבה: "${article.title}"
${article.subtitle ? `כותרת משנה: ${article.subtitle}` : ''}
${article.content ? `תוכן הכתבה: ${article.content.substring(0, 800)}` : ''}` : ''}

המשתמש שאל: "${userMessage}"

כתוב תשובה מקצועית, נעימה וחכמה בעברית. התשובה צריכה:
- להיות אישית וחמה, כאילו אתה באמת משוחח עם המשתמש
- לספק מידע מקצועי ומעמיק
- להיות באורך של 2-4 משפטים
- לכלול ${reporter.gender === 'female' ? 'צורת דיבור נשית' : 'צורת דיבור גברית'}
- לסיים בשאלה או הזמנה להמשיך את השיחה

אל תכלול קישורים או URL בתשובה.
      `.trim();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      return response || getReporterResponseFallback(userMessage);
    } catch (error) {
      console.error('שגיאה בקבלת תשובה מ-AI:', error);
      return getReporterResponseFallback(userMessage);
    }
  };

  // Fallback responses if AI fails
  const getReporterResponseFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    const isFemale = reporter.gender === 'female';

    // Quick responses for specific cases
    const isSayingThanks = /תודה|תודות|תנקס|אלוף|מעולה|נהדר|כיף|אחלה|גאון/i.test(userMessage);
    const isGreeting = /^(שלום|היי|הלו|מה נשמע|מה קורה)$/i.test(userMessage.trim());
    const isSayingGoodbye = /להתראות|ביי|בוקר טוב|לילה טוב|שיהיה לך|תודה ושלום|יאללה ביי|חג שמח|סוף שבוע טוב/i.test(userMessage);

    if (isSayingGoodbye) {
      const goodbyeResponses = isFemale ? [
        "להתראות! תישאר/י מעודכן/ת ותחזור/י בכל שאלה. אני פה בשבילך! 👋",
        "ביי ביי! היה כיף לדבר איתך. אל תהסס/י לחזור מתי שתרצה! 💙",
        "שיהיה לך יום מדהים! אני תמיד כאן אם תצטרך משהו. בהצלחה! ✨",
        "תודה שדיברנו! תחזור/י בכל עת - אני פה 24/7. להתראות! 🌟"
      ] : [
        "להתראות! תישאר/י מעודכן/ת ותחזור/י בכל שאלה. אני פה בשבילך! 👋",
        "ביי ביי! היה כיף לדבר איתך. אל תהסס/י לחזור מתי שתרצה! 💙",
        "שיהיה לך יום מדהים! אני תמיד כאן אם תצטרך משהו. בהצלחה! ✨",
        "תודה שדיברנו! תחזור/י בכל עת - אני פה 24/7. להתראות! 🌟"
      ];
      return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
    }

    if (isSayingThanks) {
      return isFemale ? 
        "בשמחה! אני כאן בשבילכם 24/7. התפקיד שלי זה בדיוק לעדכן אתכם ולענות על כל השאלות שלכם. אל תהססו לשאול עוד!" :
        "בשמחה! אני כאן בשבילכם 24/7. התפקיד שלי זה בדיוק לעדכן אתכם ולענות על כל השאלות שלכם. אל תהססו לשאול עוד!";
    }

    if (isGreeting) {
      return isFemale ?
        `שלום! אני ${reporter.name}, ${reporter.role} בהרשת החדשה. אני מתמחה ב${reporter.specialty} ועוקבת אחרי כל ההתפתחויות בזמן אמת מהשטח. יש לך שאלה ספציפית על הכתבה או רוצה עדכון כללי?` :
        `שלום! אני ${reporter.name}, ${reporter.role} בהרשת החדשה. אני מתמחה ב${reporter.specialty} ועוקב אחרי כל ההתפתחויות בזמן אמת מהשטח. יש לך שאלה ספציפית על הכתבה או רוצה עדכון כללי?`;
    }

    // Build contextual response based on article content
    if (!article || !article.title) {
      // No article - general expertise response
      const generalResponses = isFemale ? [
        `אני ${reporter.name}, מתמחה ב${reporter.specialty}. כרגע אין כתבה ספציפית שאנחנו מדברים עליה, אבל אני יכולה לענות על כל שאלה בתחום שלי. מה מעניין אותך?`,
        `היי! אני כאן כדי לעזור בכל נושא ב${reporter.specialty}. אין כתבה מסוימת שאנחנו דנים בה עכשיו, אבל שאל אותי כל דבר שרלוונטי לתחום שלי ואני אענה בשמחה!`
      ] : [
        `אני ${reporter.name}, מתמחה ב${reporter.specialty}. כרגע אין כתבה ספציפית שאנחנו מדברים עליה, אבל אני יכול לענות על כל שאלה בתחום שלי. מה מעניין אותך?`,
        `היי! אני כאן כדי לעזור בכל נושא ב${reporter.specialty}. אין כתבה מסוימת שאנחנו דנים בה עכשיו, אבל שאל אותי כל דבר שרלוונטי לתחום שלי ואני אענה בשמחה!`
      ];
      return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    // Article exists - provide detailed contextual response
    const articleContext = `
  כותרת: ${article.title}
  ${article.subtitle ? `כותרת משנה: ${article.subtitle}` : ''}
  תוכן: ${article.content?.substring(0, 500) || 'אין תוכן זמין'}
  קטגוריה: ${article.category}
    `.trim();

    // Extract key topics from article
    const articleLower = (article.title + ' ' + (article.subtitle || '') + ' ' + (article.content || '')).toLowerCase();

    // Detect question type
    const isAskingWhy = /למה|מדוע|הסיבה|בגלל מה/i.test(userMessage);
    const isAskingHow = /איך|כיצד|באיזה אופן/i.test(userMessage);
    const isAskingWhat = /מה|מהו|מהי|מהם/i.test(userMessage);
    const isAskingWhen = /מתי|באיזה תאריך|כמה זמן/i.test(userMessage);
    const isAskingOpinion = /מה דעתך|מה אתה חושב|מה את חושבת|לדעתך/i.test(userMessage);

    // Build response based on specialty and article content
    let response = '';

    if (isAskingWhy) {
      response = isFemale ?
        `שאלה מצוינת. אני חוקרת את הנושא הזה לעומק. ב"${article.title}" - הסיבה המרכזית היא ${article.content ? 'מורכבת וכוללת כמה גורמים. ' : ''}דיברתי עם מקורות מקצועיים והם מסבירים שזה קשור לדינמיקה הכללית בתחום. כמי שמתמחה ב${reporter.specialty}, אני עוקבת אחרי ההתפתחויות האלה מקרוב ויש כאן עוד הרבה מה לגלות. אשמח לענות על שאלות נוספות!` :
        `שאלה מצוינת. אני חוקר את הנושא הזה לעומק. ב"${article.title}" - הסיבה המרכזית היא ${article.content ? 'מורכבת וכוללת כמה גורמים. ' : ''}דיברתי עם מקורות מקצועיים והם מסבירים שזה קשור לדינמיקה הכללית בתחום. כמי שמתמחה ב${reporter.specialty}, אני עוקב אחרי ההתפתחויות האלה מקרוב ויש כאן עוד הרבה מה לגלות. אשמח לענות על שאלות נוספות!`;
    } else if (isAskingHow) {
      response = isFemale ?
        `אני שמחה שאת/ה שואל/ת על זה. ביחס ל"${article.title}" - התהליך הוא מורכב. ${article.content ? 'מהמידע שאספתי, ' : ''}יש כאן מספר שלבים שצריכים להתקיים. דיברתי עם מומחים ב${reporter.specialty} והם הסבירו לי את המנגנון. זה כולל היבטים טכניים ומדיניים, ואני ממשיכה לעקוב אחרי ההתפתחויות. יש לך שאלה נוספת על הפרטים?` :
        `אני שמח שאת/ה שואל/ת על זה. ביחס ל"${article.title}" - התהליך הוא מורכב. ${article.content ? 'מהמידע שאספתי, ' : ''}יש כאן מספר שלבים שצריכים להתקיים. דיברתי עם מומחים ב${reporter.specialty} והם הסבירו לי את המנגנון. זה כולל היבטים טכניים ומדיניים, ואני ממשיך לעקוב אחרי ההתפתחויות. יש לך שאלה נוספת על הפרטים?`;
    } else if (isAskingOpinion) {
      response = isFemale ?
        `זו שאלה חשובה. כמי שעוקבת אחרי ${reporter.specialty}, דעתי על "${article.title}" היא שזה נושא משמעותי שדורש תשומת לב. ${article.content ? 'מתוך הכתבה ניתן לראות ' : ''}שיש כאן השלכות רחבות. אני חושבת שצריך להמשיך לעקוב מקרוב ולהבין את כל המימדים. זה בדיוק סוג הנושאים שאני אוהבת לחקור, ויש כאן עוד הרבה מה לגלות. מה המחשבות שלך?` :
        `זו שאלה חשובה. כמי שעוקב אחרי ${reporter.specialty}, דעתי על "${article.title}" היא שזה נושא משמעותי שדורש תשומת לב. ${article.content ? 'מתוך הכתבה ניתן לראות ' : ''}שיש כאן השלכות רחבות. אני חושב שצריך להמשיך לעקוב מקרוב ולהבין את כל המימדים. זה בדיוק סוג הנושאים שאני אוהב לחקור, ויש כאן עוד הרבה מה לגלות. מה המחשבות שלך?`;
    } else {
      // General detailed response about the article
      response = isFemale ?
        `תודה על השאלה! אני מכסה את הסיפור של "${article.title}" מקרוב. ${article.subtitle ? article.subtitle + ' - ' : ''}זה נושא שעוקבת אחריו כבר זמן מה. ${article.content ? 'מהכתבה אפשר לראות ' : ''}שיש כאן מספר היבטים חשובים ששווה להכיר. דיברתי עם אנשים בשטח ומקורות רלוונטיים ב${reporter.specialty}, והתמונה שמתקבלת היא מורכבת ומעניינת. אני ממשיכה לחקור ואעדכן כשיהיו התפתחויות חדשות. יש עוד משהו שמעניין אותך בנושא?` :
        `תודה על השאלה! אני מכסה את הסיפור של "${article.title}" מקרוב. ${article.subtitle ? article.subtitle + ' - ' : ''}זה נושא שעוקב אחריו כבר זמן מה. ${article.content ? 'מהכתבה אפשר לראות ' : ''}שיש כאן מספר היבטים חשובים ששווה להכיר. דיברתי עם אנשים בשטח ומקורות רלוונטיים ב${reporter.specialty}, והתמונה שמתקבלת היא מורכבת ומעניינת. אני ממשיך לחקור ואעדכן כשיהיו התפתחויות חדשות. יש עוד משהו שמעניין אותך בנושא?`;
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    const userMessage = message.trim();
    setMessage("");
    setIsProcessing(true);

    try {
      console.log('📤 שולח הודעה מהמשתמש:', userMessage);

      // Send user message
      const userMsgData = {
        reporter_id: String(reporter.id),
        reporter_name: reporter.name,
        user_email: currentUser.email,
        user_name: currentUser.full_name || "אורח",
        message: userMessage,
        sender_type: "user",
        is_voice: false
      };
      
      if (article?.id) {
        userMsgData.article_id = String(article.id);
      }
      
      const userMsg = await sendMessageMutation.mutateAsync(userMsgData);
      console.log('✅ הודעת משתמש נשמרה:', userMsg);

      // Get reporter response
      console.log('🤔 מבקש תשובה מהכתב...');
      const response = await getReporterResponse(userMessage);
      console.log('💬 תשובת הכתב:', response);

      // Send reporter response
      const reporterMsgData = {
        reporter_id: String(reporter.id),
        reporter_name: reporter.name,
        message: response,
        sender_type: "reporter",
        is_voice: false,
        response_text: response
      };
      
      if (article?.id) {
        reporterMsgData.article_id = String(article.id);
      }
      
      const reporterMsg = await sendMessageMutation.mutateAsync(reporterMsgData);
      console.log('✅ תשובת הכתב נשמרה:', reporterMsg);
      toast.success("הכתב הגיב!");

    } catch (err) {
      console.error("❌ שגיאה בשליחת ההודעה:", err);
      toast.error(`שגיאה: ${err.message || 'לא ניתן לשלוח הודעה'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        handleSendVoiceMessage(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("מקליט...");
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("לא ניתן להקליט אודיו");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSendVoiceMessage = async (blob) => {
    if (!currentUser) return;
    setIsProcessing(true);

    try {
      // Upload voice file
      const file = new File([blob], "voice_message.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Convert speech to text (simplified - you might want to use a proper STT service)
      const voiceMessage = "הודעה קולית מהמשתמש";

      // Send user voice message
      await sendMessageMutation.mutateAsync({
        reporter_id: reporter.id,
        reporter_name: reporter.name,
        article_id: article?.id || "",
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        message: voiceMessage,
        sender_type: "user",
        is_voice: true,
        voice_url: file_url
      });

      // Get reporter response
      const response = await getReporterResponse(voiceMessage);

      // Send reporter response
      await sendMessageMutation.mutateAsync({
        reporter_id: reporter.id,
        reporter_name: reporter.name,
        article_id: article?.id || "",
        message: response,
        sender_type: "reporter",
        is_voice: false,
        response_text: response
      });

      toast.success("ההודעה הקולית נשלחה");
    } catch (err) {
      console.error("Error sending voice message:", err);
      toast.error("שגיאה בשליחת הודעה קולית");
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };

  const playVoiceResponse = async (text, messageId) => {
    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(messageId);

    try {
      // Generate professional voice using ElevenLabs-style synthesis
      const voicePrompt = `
אתה צריך להמיר את הטקסט הבא לדיבור מקצועי בעברית.
הקול צריך להיות ${reporter.gender === 'female' ? 'נשי, נעים וחם' : 'גברי, עמוק ומקצועי'}.
הדיבור צריך להיות ברור, נעים ומנחה.

טקסט: ${text}
      `.trim();

      // Try to use TTS service
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.volume = 1.0;
    
    const getReporterVoiceIndex = (name) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    
    const reporterIndex = getReporterVoiceIndex(reporter.name);
    const voices = window.speechSynthesis.getVoices();
    
    console.log('🎙️ צ\'אט - קולות זמינים:', voices.filter(v => v.lang.includes('he')).map(v => v.name));
    console.log('👤 כתב:', reporter.name, '| מין:', reporter.gender);
    
    if (reporter.gender === 'female') {
      // EXTREME high pitch for females
      const femalePitches = [2.0, 2.1, 2.2, 1.95, 2.05];
      utterance.pitch = femalePitches[reporterIndex % femalePitches.length];
      utterance.rate = 1.05 + (reporterIndex % 3) * 0.02;
      
      const femaleVoices = voices.filter(v => 
        (v.lang.includes('he') || v.lang.includes('iw')) && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('hadar') || v.name.toLowerCase().includes('carmit'))
      );
      if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[reporterIndex % femaleVoices.length];
      }
      console.log('✅ נקבה - Pitch:', utterance.pitch, '| Rate:', utterance.rate);
    } else {
      // EXTREME low pitch for males
      const malePitches = [0.5, 0.55, 0.6, 0.48, 0.52];
      utterance.pitch = malePitches[reporterIndex % malePitches.length];
      utterance.rate = 0.85 + (reporterIndex % 3) * 0.02;
      
      const maleVoices = voices.filter(v => 
        (v.lang.includes('he') || v.lang.includes('iw')) && 
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') ||
         v.name.toLowerCase().includes('asaf') || v.name.toLowerCase().includes('david'))
      );
      if (maleVoices.length > 0) {
        utterance.voice = maleVoices[reporterIndex % maleVoices.length];
      }
      console.log('✅ זכר - Pitch:', utterance.pitch, '| Rate:', utterance.rate);
    }

      utterance.onend = () => setPlayingMessageId(null);
      utterance.onerror = () => {
        setPlayingMessageId(null);
        toast.error('שגיאה בהשמעת קול');
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('שגיאה בהשמעת קול:', error);
      setPlayingMessageId(null);
      toast.error('לא ניתן להשמיע את התשובה');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{reporter.name}</h3>
                <p className="text-sm text-white/90">{reporter.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {article && (
            <div className="bg-white/10 rounded-lg p-2 text-xs">
              <p className="line-clamp-1">{article.title}</p>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          <AnimatePresence mode="sync">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender_type === 'reporter' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24] shrink-0">
                    <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className={`max-w-[75%] ${msg.sender_type === 'user' ? 'bg-[#E31E24] text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl p-3 shadow-md`}>
                  {msg.is_voice && msg.voice_url && (
                    <div className="flex items-center gap-2 mb-2 text-sm opacity-75">
                      <Radio className="w-4 h-4" />
                      <span>הודעה קולית</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">
                    {msg.sender_type === 'reporter' 
                      ? msg.message.replace(/https?:\/\/[^\s]+/g, '')
                      : msg.message
                    }
                  </p>
                  
                  {msg.sender_type === 'reporter' && (
                    <button
                      onClick={() => playVoiceResponse(msg.message, msg.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-[#E31E24] hover:text-[#B91C1C] transition-colors"
                    >
                      {playingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          עצור
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          שמע תשובה
                        </>
                      )}
                    </button>
                  )}
                </div>

                {msg.sender_type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24]">
                <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="shrink-0"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              placeholder="שאל את הכתב שאלה..."
              disabled={isProcessing || isRecording}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing || isRecording}
              className="bg-[#E31E24] hover:bg-[#B91C1C] shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            שאל שאלות על הכתבה או על נושאים בתחום {reporter.specialty}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}