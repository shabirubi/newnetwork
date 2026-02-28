import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'he-IL,he;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.oref.org.il/heb/alerts-history',
            'Origin': 'https://www.oref.org.il',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
        };

        // Fetch active + history in parallel
        const [activeRes, historyRes] = await Promise.all([
            fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', { headers }),
            fetch('https://www.oref.org.il/WarningMessages/alert/History/AlertsHistory.json', { headers }),
        ]);

        let activeAlerts = null;
        let historyAlerts = [];

        // Parse active alert
        if (activeRes.ok) {
            const text = await activeRes.text();
            const trimmed = text.trim();
            if (trimmed.length > 0 && trimmed !== 'null') {
                try { activeAlerts = JSON.parse(trimmed); } catch { activeAlerts = null; }
            }
        }

        // Parse history
        if (historyRes.ok) {
            const text = await historyRes.text();
            const trimmed = text.trim();
            if (trimmed.length > 0) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        historyAlerts = parsed.slice(0, 50);
                    }
                } catch { /* ignore */ }
            }
        }

        console.log(`[oref] active=${JSON.stringify(activeAlerts)?.substring(0,100)} | history count=${historyAlerts.length}`);

        // If we still got nothing from history, try the GetAlertsHistory endpoint
        if (historyAlerts.length === 0) {
            try {
                const today = new Date();
                const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
                const fmt = (d) => `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`;
                const url = `https://alerts-history.oref.org.il/Shared/Ajax/GetAlertsHistory.aspx?lang=he&fromDate=${fmt(weekAgo)}&toDate=${fmt(today)}&type=1`;
                const r2 = await fetch(url, { headers });
                if (r2.ok) {
                    const t2 = await r2.text();
                    if (t2.trim().length > 0) {
                        const p2 = JSON.parse(t2);
                        const arr = Array.isArray(p2) ? p2 : (p2?.alerts || p2?.lstAlert || []);
                        historyAlerts = arr.slice(0, 50);
                        console.log(`[oref] fallback history count=${historyAlerts.length}`);
                    }
                }
            } catch (e2) {
                console.error('[oref] fallback history error:', e2.message);
            }
        }

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