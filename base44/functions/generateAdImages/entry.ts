import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const brandPrompts = [
      "Apple iPhone - sleek modern smartphone with minimalist design, professional product photography, white background, premium tech product",
      "Samsung Galaxy - advanced smartphone technology, cutting-edge display, professional tech advertisement, premium quality",
      "Sony PlayStation - gaming console, cutting-edge gaming technology, professional product shot, studio lighting",
      "Rolex Watch - luxury Swiss watch, elegant gold and silver design, premium jewelry photography, white background",
      "Nike Sneakers - professional running shoes, athletic wear, dynamic sports product photography, clean white background",
      "Adidas Sports - professional athletic shoes, sport equipment, sleek modern design, clean product photography",
      "Microsoft Surface - modern laptop computer, sleek design, premium business technology, professional product shot",
      "LG Display - large modern TV screen, 4K television, premium electronics, professional tech product photography",
      "Canon Camera - professional DSLR camera, photography equipment, premium tech product, studio lighting",
      "Audi Car - luxury sports car, elegant vehicle design, professional automotive photography, premium quality",
      "Ferrari Supercar - red luxury sports car, high performance vehicle, professional automotive product shot",
      "Emirates Airlines - airplane, luxury travel, premium airline service, professional travel advertisement",
      "Prada Fashion - luxury handbag, high fashion accessories, premium designer product, elegant photography",
      "Bank Finance - modern banking, financial services, professional business, corporate imagery",
      "Cartier Jewelry - luxury diamond jewelry, premium gemstones, elegant luxury product photography",
      "BMW Luxury Car - premium automobile, modern vehicle design, professional automotive product shot, studio lighting"
    ];

    const images = [];
    
    for (const prompt of brandPrompts) {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional advertisement banner for ${prompt}. High quality, modern, premium, 16:9 aspect ratio, commercial use, clean background`
      });
      
      images.push({
        brand: prompt.split(' - ')[0],
        url: result.url
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return Response.json({ 
      success: true, 
      count: images.length,
      images: images
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});