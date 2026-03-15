import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Zap, Plane, Activity, Biohazard, AlertOctagon, Waves, ShieldAlert, AlertTriangle } from "lucide-react";

/*
 * =====================================================================
 * OREF EMERGENCY POPUP — Full-screen alert overlay
 * =====================================================================
 * Official Pikud HaOref (Home Front Command) API:
 *   GET https://www.oref.org.il/WarningMessages/alert/alerts.json
 *   Headers required: X-Requested-With: XMLHttpRequest, Referer: https://www.oref.org.il/
 *   Returns: { id, cat, title, data: ["city1","city2",...], desc }
 *   cat values: 1=rockets, 2=hostile aircraft, 3=earthquake, 4=hazmat, 5=infiltration, 6=tsunami
 *
 * Polling: every 5 seconds via fetchOrefAlerts backend function
 * Dismisses: manually (X button) or auto after 60s
 * Reappears: when a NEW alert id is detected
 * =====================================================================
 */

const ALERT_META = {
  1:   { label: "ירי רקטות וטילים",    Icon: Zap,          color: "#FF0000", shelter_time: "10 שניות – 3 דקות" },
  2:   { label: "חדירת כלי טיס עוין",  Icon: Plane,        color: "#FF4500", shelter_time: "1 דקה" },
  3:   { label: "רעידת אדמה",           Icon: Activity,     color: "#FF8C00", shelter_time: "מיידי" },
  4:   { label: "חומרים מסוכנים",       Icon: Biohazard,    color: "#FF6B35", shelter_time: "מיידי" },
  5:   { label: "חדירת מחבלים",         Icon: AlertOctagon, color: "#DC143C", shelter_time: "מיידי" },
  6:   { label: "צונאמי",                Icon: Waves,        color: "#1E90FF", shelter_time: "מיידי" },
  101: { label: "אירוע חירום",            Icon: ShieldAlert,  color: "#FF0000", shelter_time: "מיידי" },
};

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

function OrefLogoSVG({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 2L4 10V22C4 30.8 11.2 38.4 20 40C28.8 38.4 36 30.8 36 22V10L20 2Z" fill="white" />
      <path d="M20 6L7 13V22C7 29.6 12.8 36 20 37.5C27.2 36 33 29.6 33 22V13L20 6Z" fill="#CC0000" />
      <text x="20" y="27" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">ע</text>
    </svg>
  );
}

export default function OrefEmergencyPopup() {
  const [alert, setAlert] = useState(null);
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);
  const lastAlertIdRef = useRef(null);
  const dismissedIdRef = useRef(null);
  const autoCloseRef = useRef(null);

  // Flash effect
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTick(v => v + 1), 400);
    return () => clearInterval(t);
  }, [visible]);

  // Poll every 5 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await base44.functions.invoke('fetchOrefAlerts', {});
        const active = res?.data?.active;

        if (active && active.data && active.data.length > 0) {
          const alertId = active.id || active.alertDate || JSON.stringify(active.data);

          // Show popup only if it's a new alert we haven't dismissed
          if (alertId !== lastAlertIdRef.current && alertId !== dismissedIdRef.current) {
            lastAlertIdRef.current = alertId;
            setAlert(active);
            setVisible(true);

            // Auto-close after 60 seconds
            clearTimeout(autoCloseRef.current);
            autoCloseRef.current = setTimeout(() => setVisible(false), 60000);
          }
        } else {
          // No active alert — reset so next real alert will show
          lastAlertIdRef.current = null;
        }
      } catch (e) {
        // silently ignore
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(autoCloseRef.current);
    };
  }, []);

  const dismiss = () => {
    dismissedIdRef.current = lastAlertIdRef.current;
    setVisible(false);
  };

  if (!alert) return null;

  const meta = ALERT_META[alert.cat] || { label: "התרעה", Icon: AlertTriangle, color: "#FF0000", shelter_time: "מיידי" };
  const AlertIcon = meta.Icon;
  const cities = Array.isArray(alert.data) ? alert.data : [];
  const flash = tick % 2 === 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: -40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -40 }}
            transition={{ type: "spring", damping: 18, stiffness: 250 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: flash
                ? 'linear-gradient(160deg, #1565C0 0%, #1976D2 100%)'
                : 'linear-gradient(160deg, #0d47a1 0%, #1565C0 100%)',
              border: '4px solid #1976D2',
              boxShadow: flash
                ? '0 0 60px rgba(21,101,192,0.9), 0 0 120px rgba(25,118,210,0.5)'
                : '0 0 40px rgba(13,71,161,0.7)',
              transition: 'background 0.3s, box-shadow 0.3s',
              fontFamily: FONT,
            }}
          >
            {/* Top stripe */}
            <div style={{
              height: '8px',
              background: 'repeating-linear-gradient(90deg, #1565C0 0px, #1565C0 24px, #1976D2 24px, #1976D2 48px)',
            }} />

            {/* Header */}
            <div style={{
              padding: '16px 20px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid rgba(21,101,192,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <OrefLogoSVG size={44} />
                <div>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: '900', fontFamily: FONT, lineHeight: 1.1 }}>
                    פיקוד העורף
                  </div>
                  <div style={{ color: '#FFD700', fontSize: '13px', fontWeight: '700', fontFamily: FONT }}>
                    🔴 התרעה פעילה עכשיו
                  </div>
                </div>
              </div>
              <button
                onClick={dismiss}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Main content */}
            <div style={{ padding: '20px' }}>
              {/* Alert type */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  width: '52px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.4)',
                  flexShrink: 0,
                }}>
                  <AlertIcon size={28} color="white" />
                </div>
                <div style={{
                  color: '#FFD700',
                  fontSize: '26px',
                  fontWeight: '900',
                  fontFamily: FONT,
                  textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                }}>
                  {meta.label}
                </div>
              </div>

              {/* BIG instruction */}
              <div style={{
                background: flash ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                border: '3px solid rgba(255,255,255,0.6)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '16px',
                textAlign: 'center',
                transition: 'background 0.3s',
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '900',
                  fontFamily: FONT,
                  textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                  lineHeight: 1.2,
                }}>
                  🏃 היכנסו למרחב המוגן מיד!
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontFamily: FONT, marginTop: '6px' }}>
                  זמן להגיע למרחב מוגן: <strong style={{ color: '#FFD700' }}>{meta.shelter_time}</strong>
                </div>
              </div>

              {/* Cities */}
              {cities.length > 0 && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: FONT, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    אזורים מוכרזים:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cities.map((city, i) => (
                      <span key={i} style={{
                        background: 'rgba(255,255,255,0.18)',
                        border: '2px solid rgba(255,255,255,0.55)',
                        borderRadius: '6px',
                        padding: '5px 14px',
                        color: 'white',
                        fontSize: '17px',
                        fontWeight: '900',
                        fontFamily: FONT,
                        textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                      }}>
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {alert.desc && (
                <div style={{
                  marginTop: '14px',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '13px',
                  fontFamily: FONT,
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  paddingTop: '10px',
                }}>
                  {alert.desc}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '2px solid rgba(255,102,0,0.4)',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <a
                href="https://www.oref.org.il"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: FONT }}
              >
                oref.org.il
              </a>
              <button
                onClick={dismiss}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px',
                  fontFamily: FONT,
                  cursor: 'pointer',
                }}
              >
                סגור (נסגר אוטומטית בעוד 60 שניות)
              </button>
            </div>

            {/* Bottom stripe */}
            <div style={{
              height: '8px',
              background: 'repeating-linear-gradient(90deg, #1565C0 0px, #1565C0 24px, #1976D2 24px, #1976D2 48px)',
            }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}