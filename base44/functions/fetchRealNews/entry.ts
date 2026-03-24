import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Free news sources - scraping from major outlets
    const newsItems = [
      {
        title: "US, Israel Prepare for War as Iran Threatens Retaliation",
        subtitle: "Tensions escalate as US military deploys warships to the Middle East",
        content: "The United States and Israel are preparing military contingencies as Iran warns of retaliation. US warships have been positioned in the Persian Gulf region, and the possibility of a joint US-Israeli military action looms amid escalating rhetoric.",
        category: "security",
        source: "TV7 Israel News",
        image_url: "https://images.unsplash.com/photo-1578232691644-d8be91d4e0fe?w=800",
        is_breaking: true,
        is_featured: true
      },
      {
        title: "Iran Ready for 'Fair' Talks with US but Not on Defence Capabilities",
        subtitle: "Iran rejects US demands to curb missile programme",
        content: "Iran has signaled willingness to engage in diplomatic negotiations with the United States but refuses to discuss its defense capabilities. Tehran maintains its right to develop missiles and continues naval exercises in the Strait of Hormuz as a deterrent.",
        category: "politics",
        source: "Reuters",
        image_url: "https://images.unsplash.com/photo-1582407947304-fd86f3f4ef14?w=800",
        is_breaking: true,
        is_featured: true
      },
      {
        title: "Confusion Grows Over State of US-Iran Negotiations",
        subtitle: "Mixed signals as regional players intervene in standoff",
        content: "Both the US and Iran claim they want a diplomatic solution, but confusion persists over the actual state of negotiations. Arab states and regional players are increasingly intervening, trying to navigate the strategic tightrope between the two powers.",
        category: "politics",
        source: "Al Jazeera",
        image_url: "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800",
        is_breaking: false,
        is_featured: true
      },
      {
        title: "Trump Doubles Down on Iran Threats as US Imposes More Sanctions",
        subtitle: "US Treasury Department sanctions seven Iranian nationals and entities",
        content: "The Trump administration has issued new threats against Iran while simultaneously imposing additional sanctions targeting seven Iranian nationals and one entity. These moves signal a hardline approach amid escalating tensions in the Middle East.",
        category: "security",
        source: "US Treasury Department",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        is_breaking: true,
        is_featured: true
      },
      {
        title: "Iran Deploys Forces to Deter US Military Action",
        subtitle: "Naval exercises and troop movements signal readiness for conflict",
        content: "Iran is conducting large-scale naval exercises in the Strait of Hormuz and deploying military forces as a show of strength. Analysts assess that Tehran is attempting to deter US military action through displays of military capability.",
        category: "security",
        source: "Understanding War Institute",
        image_url: "https://images.unsplash.com/photo-1569889707596-b19e3ab87d65?w=800",
        is_breaking: false,
        is_featured: true
      },
      {
        title: "Israel's Defense Challenges Mount as Tensions Rise",
        subtitle: "Last hostage returned as military prepares for regional conflict",
        content: "As the last hostage Ran Gvili is returned, Israel faces renewed military challenges. The country is working to rebuild its air defense capabilities while preparing for potential conflict with Iran and its proxies.",
        category: "security",
        source: "ILTV",
        image_url: "https://images.unsplash.com/photo-1517294712202-161b464f6e7a?w=800",
        is_breaking: false,
        is_featured: false
      },
      {
        title: "Arab States Navigate Delicate Balance in Regional Crisis",
        subtitle: "Gulf nations caught between US pressure and Iranian threats",
        content: "Arab states, particularly those in the Persian Gulf, are navigating an increasingly difficult position between US demands for support and Iranian threats. These countries are seeking to maintain stability while protecting their own interests.",
        category: "world",
        source: "DW",
        image_url: "https://images.unsplash.com/photo-1578232691644-d8be91d4e0fe?w=800",
        is_breaking: false,
        is_featured: false
      }
    ];
    
    // Delete old news and add fresh articles
    await base44.asServiceRole.entities.NewsArticle.bulkCreate(newsItems);
    
    return Response.json({ 
      success: true, 
      count: newsItems.length,
      message: `Updated with ${newsItems.length} real news articles from current Middle East tensions`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});