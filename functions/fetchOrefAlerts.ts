import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'he-IL,he;q=0.9',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.oref.org.il/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        };

        let activeAlerts = null;
        let historyAlerts = [];

        // Try multiple sources in parallel
        const [activeRes, historyRes, proxy1Res] = await Promise.all([
            fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', { headers }).catch(() => null),
            fetch('https://www.oref.org.il/WarningMessages/alert/History/AlertsHistory.json', { headers }).catch(() => null),
            // tzevaadom.co.il is a well-known Oref proxy
            fetch('https://api.tzevaadom.co.il/alerts-history', {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
            }).catch(() => null),
        ]);

        // Parse active
        if (activeRes?.ok) {
            const text = await activeRes.text();
            const t = text.trim();
            if (t && t !== 'null' && t.length > 2) {
                try { activeAlerts = JSON.parse(t); } catch {}
            }
        }

        // Parse official history
        if (historyRes?.ok) {
            const text = await historyRes.text();
            const t = text.trim();
            if (t && t.length > 2) {
                try {
                    const parsed = JSON.parse(t);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        historyAlerts = parsed.slice(0, 50);
                    }
                } catch {}
            }
        }

        // Try tzevaadom proxy if official gave nothing
        if (historyAlerts.length === 0 && proxy1Res?.ok) {
            const text = await proxy1Res.text();
            const t = text.trim();
            if (t && t.length > 2) {
                try {
                    const parsed = JSON.parse(t);
                    const arr = Array.isArray(parsed) ? parsed : (parsed?.alerts || parsed?.data || []);
                    if (arr.length > 0) {
                        historyAlerts = arr.slice(0, 50);
                    }
                } catch {}
            }
        }

        // Try GetAlertsHistory as last resort
        if (historyAlerts.length === 0) {
            try {
                const today = new Date();
                const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
                const fmt = (d) => `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`;
                const url = `https://alerts-history.oref.org.il/Shared/Ajax/GetAlertsHistory.aspx?lang=he&fromDate=${fmt(weekAgo)}&toDate=${fmt(today)}&type=1`;
                const r = await fetch(url, { headers });
                if (r.ok) {
                    const t = (await r.text()).trim();
                    if (t && t.length > 2) {
                        const p = JSON.parse(t);
                        const arr = Array.isArray(p) ? p : (p?.alerts || p?.lstAlert || []);
                        historyAlerts = arr.slice(0, 50);
                    }
                }
            } catch {}
        }

        console.log(`[oref] active=${activeAlerts ? 'YES' : 'none'} | history=${historyAlerts.length}`);

        return Response.json({
            active: activeAlerts,
            history: historyAlerts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[fetchOrefAlerts] error:', error.message);
        return Response.json({ error: error.message, active: null, history: [] }, { status: 500 });
    }
});