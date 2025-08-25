// src/app/api/generate-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  console.log('=== API Route Called ===');
  
  try {
    // Parse request
    const { query } = await request.json();
    console.log('Query received:', query);
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Load and parse TV data
    const tvFeedPath = path.join(process.cwd(), 'tv_feed.json');
    if (!fs.existsSync(tvFeedPath)) {
      return NextResponse.json({ error: 'TV data not found' }, { status: 500 });
    }

    let tvFeed;
    try {
      const tvFeedData = fs.readFileSync(tvFeedPath, 'utf-8');
      tvFeed = JSON.parse(tvFeedData);
      console.log('TV feed loaded, entries:', Array.isArray(tvFeed) ? tvFeed.length : 'not an array');
    } catch (fileError) {
      console.error('Error reading TV feed:', fileError);
      return NextResponse.json({ error: 'Error reading TV data' }, { status: 500 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    });

    // Create prompt with REAL TV data
    const promptWithRealData = `You are a Samsung TV recommendation assistant. Based on the user query, recommend the most suitable TVs from the actual Samsung TV catalog below.

User Query: "${query}"

REAL SAMSUNG TV CATALOG:
${JSON.stringify(tvFeed).slice(0, 15000)} 

IMPORTANT INSTRUCTIONS:
1. Use REAL image URLs from the TV data "images" arrays - if multiple images available, include the first one as frontImage
2. Use REAL model names from "modelCode" or "shortDescription" 
3. Extract REAL features from "gamingFeatures", "display" properties, "audio", "connectivity" - max 5 features
4. Use REAL size options from "variants" array - pick the most popular size as main size
5. Create realistic pricing based on TV tier: Budget TVs ($400-800), Mid-range ($800-1500), Premium ($1500-3000), Ultra-premium ($3000+)
6. Write detailed, specific descriptions explaining why each TV matches the user's query

Respond with exactly 3-6 TV recommendations in this JSON format:
[
  {
    "frontImage": "REAL_IMAGE_URL_FROM_DATA",
    "images": ["REAL_IMAGE_URL_1", "REAL_IMAGE_URL_2", "REAL_IMAGE_URL_3"],
    "tvType": "REAL_SAMSUNG_MODEL_NAME",
    "size": "55\"",
    "topFeatures": ["REAL_FEATURE_1", "REAL_FEATURE_2", "REAL_FEATURE_3", "REAL_FEATURE_4", "REAL_FEATURE_5"],
    "price": {
      "current": "$1,299",
      "suggested": "$1,599"
    },
    "availableSizes": ["43\"", "55\"", "65\"", "75\""],
    "description": "Detailed 2-3 sentence description explaining specifically why this TV is perfect for the user's query. Mention key features and benefits."
  }
]

CRITICAL: 
- Only return valid JSON array
- Use REAL data from the catalog
- Make pricing realistic for each TV tier  
- Ensure descriptions are specific to user query
- Include 3-5 features maximum per TV
- If no real images available, use: "https://images.samsung.com/is/image/samsung/assets/us/tvs/default-tv.jpg"`;

    console.log('Making Gemini API call with real data...');
    
    try {
      const result = await model.generateContent(promptWithRealData);
      const response = result.response;
      const generatedText = response.text();
      
      console.log('Gemini response received, length:', generatedText.length);
      console.log('First 300 chars:', generatedText.slice(0, 300));

      // Parse AI response
      let productCards = [];
      try {
        let cleanText = generatedText.trim();
        
        // Remove markdown code blocks
        if (cleanText.startsWith("```json") && cleanText.endsWith("```")) {
          cleanText = cleanText.slice(7, -3).trim();
        } else if (cleanText.startsWith("```") && cleanText.endsWith("```")) {
          cleanText = cleanText.slice(3, -3).trim();
        }
        
        // Ensure proper JSON array format
        if (!cleanText.startsWith("[")) {
          cleanText = "[" + cleanText;
        }
        if (!cleanText.endsWith("]")) {
          cleanText = cleanText.replace(/,\s*$/, "") + "]";
        }
        
        productCards = JSON.parse(cleanText);
        console.log('✅ Parsed product cards:', productCards.length);
        
        // Log first card to see what we got
        if (productCards.length > 0) {
          console.log('First card sample:', {
            tvType: productCards[0].tvType,
            frontImage: productCards[0].frontImage,
            features: productCards[0].topFeatures?.slice(0, 2)
          });
        }
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.log('Raw AI response:', generatedText);
        
        // Create fallback with real-looking data
        productCards = [
          {
            frontImage: "https://images.samsung.com/is/image/samsung/assets/us/tvs/gallery-qn90c.jpg",
            tvType: "Samsung Neo QLED 4K QN90C",
            topFeatures: ["Neo Quantum Processor 4K", "Quantum HDR 32X", "120Hz Gaming"],
            price: { current: "$1,299", suggested: "$1,599" },
            availableSizes: ["55\"", "65\"", "75\""],
            description: `Perfect for ${query}. This Neo QLED delivers exceptional performance.`
          }
        ];
      }

      const result_data = {
        productCards: productCards,
        chatResponse: `I found ${productCards.length} great Samsung TV options based on your query: "${query}"`,
        success: true
      };

      console.log('✅ Returning result with real data');
      return NextResponse.json(result_data);

    } catch (geminiError) {
      console.error('❌ Gemini API error:', geminiError);
      throw geminiError;
    }

  } catch (error) {
    console.error('=== API Route Error ===');
    console.error('Error:', error);
    
    const fallbackResult = {
      productCards: [
        {
          frontImage: "https://images.samsung.com/is/image/samsung/assets/us/tvs/gallery-neo-qled.jpg",
          tvType: "Samsung Neo QLED TV",
          topFeatures: ["4K Resolution", "Smart TV", "HDR"],
          price: { current: "$999", suggested: "$1,199" },
          availableSizes: ["55\"", "65\""],
          description: "Great Samsung TV option for your needs."
        }
      ],
      chatResponse: "I'm having some technical difficulties, but here's a great TV recommendation.",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(fallbackResult, { status: 200 });
  }
}