import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const body = await req.json();
    const { video_url, user_request } = body;

    if (!video_url) {
      return Response.json({ error: 'video_url is required' }, { status: 400 });
    }

    // Use AI to analyze video and create script
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `אתה עוזר מקצועי ביצירת תסריטים. קיבלת סרטון בכתובת: ${video_url}
      
בקשת המשתמש: ${user_request}

אתה צריך:
1. לתאר את התוכן בקצרה
2. לכתוב תסריט משופר בעברית (300-500 מילים)
3. התסריט צריך להיות:
   - מעניין וקשוב
   - בעל מטרה ברורה
   - עם call-to-action
   - מקצועי וברור

החזר רק את התסריט, בלי הסברים נוספים.`,
      add_context_from_internet: false,
      file_urls: [video_url]
    });

    // Generate video with the new script
    const videoResult = await base44.functions.invoke('generateHeyGenCharacter', {
      payload: {
        script: result.substring(0, 1500), // Limit to prevent too long scripts
        avatar_id: "Abigail_expressive_2024112501",
        voice_id: "v6WKRTqObgmv7NHgVAFD",
        background: "white"
      }
    });

    return Response.json({
      script: result,
      video_url: videoResult.data?.video_url || null,
      success: true
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});