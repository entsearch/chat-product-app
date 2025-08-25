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
3. Extract REAL features from "gamingFeatures", "display" properties, "audio", "connectivity" - max 5 features. Description of
each feature should never exceed 22 characters
4. Use REAL size options from "variants" array - pick the most popular size as main size
5. Create realistic pricing based on TV tier: Budget TVs ($400-800), Mid-range ($800-1500), Premium ($1500-3000), Ultra-premium ($3000+)
6. Write detailed, specific descriptions explaining why each TV matches the user's query

RESPONSE FORMAT - Return exactly this JSON structure:
{
  "title": "SHORT_CATCHY_TITLE_4_TO_6_WORDS_MAX",
  "description": "SINGLE_SENTENCE_DESCRIPTION_15_TO_25_WORDS_MAX",
  "productCards": [
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
}

TITLE & DESCRIPTION GUIDELINES:
- Title: Create a catchy, specific title related to the user's query (max 6 words)
- Description: Write a compelling single sentence that relates to the user's query (15-25 words)
- Make both title and description specific to what the user is looking for
- Keep language engaging and Samsung-focused

Examples:
- Query "gaming TV" → Title: "Ultimate Gaming TVs Await", Description: "Experience lightning-fast gaming with Samsung's advanced display technology and ultra-low input lag."
- Query "bedroom TV" → Title: "Perfect Bedroom Entertainment", Description: "Transform your bedroom into a personal entertainment haven with Samsung's elegant and compact TV solutions."
- Query "4K TV" → Title: "Stunning 4K Visual Experience", Description: "Immerse yourself in breathtaking 4K clarity with Samsung's cutting-edge display and color technologies."

CRITICAL: 
- Only return valid JSON object (not array)
- Use REAL data from the catalog
- Keep title under 6 words, description under 25 words
- Make both title and description query-specific
- Include 3-6 TV recommendations in productCards array
- If no real images available, use: "https://images.samsung.com/is/image/samsung/p6pim/us/qn75qn1efafxza/gallery/us-neo-qled-qn75qn1efafxza-l-perspective--black-546228293?$product-details-jpg$"`;

    console.log('Making Gemini API call with real data...');
    
    try {
      const result = await model.generateContent(promptWithRealData);
      const response = result.response;
      const generatedText = response.text();
      
      console.log('Gemini response received, length:', generatedText.length);
      console.log('First 300 chars:', generatedText.slice(0, 300));

      // Parse AI response
      let aiResponse = {};
      try {
        let cleanText = generatedText.trim();
        
        // Remove markdown code blocks
        if (cleanText.startsWith("```json") && cleanText.endsWith("```")) {
          cleanText = cleanText.slice(7, -3).trim();
        } else if (cleanText.startsWith("```") && cleanText.endsWith("```")) {
          cleanText = cleanText.slice(3, -3).trim();
        }
        
        aiResponse = JSON.parse(cleanText);
        console.log('✅ Parsed AI response with title:', aiResponse.title);
        
        // Validate structure
        if (!aiResponse.title || !aiResponse.description || !aiResponse.productCards) {
          throw new Error('Missing required fields in AI response');
        }
        
        // Log first card to see what we got
        if (aiResponse.productCards && aiResponse.productCards.length > 0) {
          console.log('First card sample:', {
            tvType: aiResponse.productCards[0].tvType,
            frontImage: aiResponse.productCards[0].frontImage,
            features: aiResponse.productCards[0].topFeatures?.slice(0, 2)
          });
        }
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.log('Raw AI response:', generatedText);
        
        // Create fallback with dynamic content based on query
        const queryLower = query.toLowerCase();
        let fallbackTitle = "Perfect TV Solutions";
        let fallbackDescription = `Discover Samsung TVs expertly matched to your ${query} needs with cutting-edge technology.`;
        
        // Create query-specific fallbacks
        if (queryLower.includes('gaming')) {
          fallbackTitle = "Ultimate Gaming TVs";
          fallbackDescription = "Experience lightning-fast gaming performance with Samsung's advanced display technology and ultra-low input lag.";
        } else if (queryLower.includes('bedroom') || queryLower.includes('small')) {
          fallbackTitle = "Perfect Bedroom Entertainment";
          fallbackDescription = "Transform your bedroom into a personal entertainment haven with Samsung's elegant compact displays.";
        } else if (queryLower.includes('4k') || queryLower.includes('movie')) {
          fallbackTitle = "Stunning 4K Experience";
          fallbackDescription = "Immerse yourself in breathtaking 4K clarity with Samsung's cutting-edge display and color technologies.";
        } else if (queryLower.includes('large') || queryLower.includes('big')) {
          fallbackTitle = "Big Screen Excellence";
          fallbackDescription = "Experience cinema-quality entertainment at home with Samsung's impressive large-screen TV technology.";
        } else {
          fallbackTitle = `Perfect ${query} TVs`;
          fallbackDescription = `Discover Samsung TVs expertly tailored for your ${query} requirements with premium features.`;
        }
        
        aiResponse = {
          title: fallbackTitle,
          description: fallbackDescription,
          productCards: [
            {
              frontImage: "https://images.samsung.com/is/image/samsung/p6pim/us/qn75qn1efafxza/gallery/us-neo-qled-qn75qn1efafxza-l-perspective--black-546228293?$product-details-jpg$",
              tvType: "Samsung Neo QLED 4K QN90C",
              topFeatures: ["Neo Quantum Processor 4K", "Quantum HDR 32X", "120Hz Gaming", "Smart TV", "Ultra Slim Design"],
              price: { current: "$1,299", suggested: "$1,599" },
              availableSizes: ["55\"", "65\"", "75\""],
              description: `Perfect for ${query}. This Neo QLED delivers exceptional performance with advanced features and stunning picture quality.`
            }
          ]
        };
      }

      const result_data = {
        title: aiResponse.title,
        description: aiResponse.description,
        productCards: aiResponse.productCards,
        chatResponse: `I found ${aiResponse.productCards?.length || 1} great Samsung TV options based on your query: "${query}"`,
        success: true
      };

      console.log('✅ Returning result with dynamic title and description');
      return NextResponse.json(result_data);

    } catch (geminiError) {
      console.error('❌ Gemini API error:', geminiError);
      throw geminiError;
    }

  } catch (error) {
    console.error('=== API Route Error ===');
    console.error('Error:', error);
    
    // Smart fallback based on query
    const queryLower = (query || '').toLowerCase();
    let fallbackTitle = "Samsung TV Collection";
    let fallbackDescription = `Explore Samsung's premium TV collection tailored for your specific requirements.`;
    
    // Create contextual fallbacks
    if (queryLower.includes('gaming')) {
      fallbackTitle = "Gaming TV Options";
      fallbackDescription = "Discover Samsung gaming TVs with fast response times and stunning visual performance.";
    } else if (queryLower.includes('bedroom')) {
      fallbackTitle = "Bedroom TV Solutions";
      fallbackDescription = "Find the perfect Samsung TV to enhance your bedroom entertainment experience.";
    } else if (queryLower.includes('4k')) {
      fallbackTitle = "4K TV Selection";
      fallbackDescription = "Experience ultra-high definition entertainment with Samsung's premium 4K TV technology.";
    } else if (queryLower.includes('budget') || queryLower.includes('cheap')) {
      fallbackTitle = "Affordable TV Options";
      fallbackDescription = "Discover Samsung's value-focused TVs that deliver quality entertainment without breaking the bank.";
    } else {
      fallbackTitle = `${query || 'TV'} Options`;
      fallbackDescription = `Explore Samsung's premium TV collection designed for your ${query || 'entertainment'} needs.`;
    }
    
    const fallbackResult = {
      title: fallbackTitle,
      description: fallbackDescription,
      productCards: [
        {
          frontImage: "https://images.samsung.com/is/image/samsung/p6pim/us/qn75qn1efafxza/gallery/us-neo-qled-qn75qn1efafxza-l-perspective--black-546228293?$product-details-jpg$",
          tvType: "Samsung Neo QLED TV",
          topFeatures: ["4K Resolution", "Smart TV", "HDR", "Sleek Design", "Premium Quality"],
          price: { current: "$999", suggested: "$1,199" },
          availableSizes: ["55\"", "65\""],
          description: "Great Samsung TV option perfectly suited for your entertainment needs with premium features."
        }
      ],
      chatResponse: "I'm having some technical difficulties, but here's a great TV recommendation based on your query.",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(fallbackResult, { status: 200 });
  }
}