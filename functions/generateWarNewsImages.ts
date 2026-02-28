import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const WAR_PROMPTS = [
    "Israel USA military coordination strategic meeting, dramatic cinematic news photography, dark moody",
    "Iran missile launch ballistic rocket military, dramatic cinematic photo, dark sky",
    "Israeli army soldiers military mobilization tanks, dramatic war photography cinematic",
    "US President White House press conference podium, dramatic news photography",
    "Lebanon Hezbollah border military tension, dramatic cinematic news photo",
    "Israel economy financial crisis shekel chart, dramatic business news photo",
    "Russia Iran military cooperation weapons deal, dramatic geopolitical photo",
    "Hamas Israel hostage negotiation diplomacy, dramatic news photography",
    "US Navy aircraft carrier Mediterranean sea, dramatic military photography cinematic",
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const results = [];

        for (const prompt of WAR_PROMPTS) {
            try {
                const res = await base44.asServiceRole.integrations.Core.GenerateImage({
                    prompt: `${prompt}, no text, no letters, photorealistic, 16:9`
                });
                results.push(res?.url || null);
            } catch {
                results.push(null);
            }
        }

        return Response.json({ images: results });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});