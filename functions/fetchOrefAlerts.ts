import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.oref.org.il/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        };

        const fullHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.oref.org.il/heb/alerts-history',
            'Origin': 'https://www.oref.org.il',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };

        // Try multiple history endpoints
        const historyUrls = [
            'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json',
            'https://www.oref.org.il/WarningMessages/alert/History/AlertsHistory.json',
            'https://alerts-history.oref.org.il/Shared/Ajax/GetAlertsHistory.aspx?lang=he&fromDate=&toDate=&type=1',
        ];

        // Fetch current active alerts
        const [activeRes, ...historyResArr] = await Promise.all([
            fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', { headers: fullHeaders }),
            ...historyUrls.map(url => fetch(url, { headers: fullHeaders }))
        ]);

        let activeAlerts = null;
        let historyAlerts = [];

        if (activeRes.ok) {
            const text = await activeRes.text();
            if (text && text.trim().length > 0) {
                try { activeAlerts = JSON.parse(text); } catch { activeAlerts = null; }
            }
        }

        // Try each history URL until we get data
        for (const res of historyResArr) {
            if (res.ok) {
                const text = await res.text();
                if (text && text.trim().length > 0) {
                    try {
                        const parsed = JSON.parse(text);
                        const arr = Array.isArray(parsed) ? parsed : (parsed?.alerts || parsed?.data || []);
                        if (arr.length > 0) {
                            historyAlerts = arr.slice(0, 50);
                            break;
                        }
                    } catch { /* try next */ }
                }
            }
        }

        return Response.json({
            active: activeAlerts,
            history: historyAlerts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('fetchOrefAlerts error:', error.message);
        return Response.json({ error: error.message, active: null, history: [] }, { status: 500 });
    }
});