import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const agentId = Deno.env.get('DID_AGENT_ID');
    const clientKey = Deno.env.get('DID_CLIENT_KEY');

    if (!agentId || !clientKey) {
      return Response.json({ 
        error: 'D-ID configuration not found. Please set DID_AGENT_ID and DID_CLIENT_KEY in Dashboard > Settings > Environment Variables' 
      }, { status: 500 });
    }

    return Response.json({
      agentId,
      clientKey
    });

  } catch (error) {
    console.error('Error getting D-ID config:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});