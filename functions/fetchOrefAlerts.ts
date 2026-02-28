import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.oref.org.il/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        };

        // Fetch current active alerts
        const [activeRes, historyRes] = await Promise.all([
            fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', { headers }),
            fetch('https://www.oref.org.il/WarningMessages/alert/History/AlertsHistory.json', { headers })
        ]);

        let activeAlerts = null;
        let historyAlerts = [];

        if (activeRes.ok) {
            const text = await activeRes.text();
            if (text && text.trim().length > 0) {
                try {
                    activeAlerts = JSON.parse(text);
                } catch (e) {
                    activeAlerts = null;
                }
            }
        }

        if (historyRes.ok) {
            const text = await historyRes.text();
            if (text && text.trim().length > 0) {
                try {
                    historyAlerts = JSON.parse(text);
                    if (!Array.isArray(historyAlerts)) historyAlerts = [];
                    // Return only last 20
                    historyAlerts = historyAlerts.slice(0, 20);
                } catch (e) {
                    historyAlerts = [];
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