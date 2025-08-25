// src/app/api/feature-description/route.ts
// MINIMAL API - Just for feature descriptions, doesn't interfere with existing generate-products logic
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { feature } = await request.json();
    
    if (!feature) {
      return NextResponse.json({ error: 'Feature name is required' }, { status: 400 });
    }

    // Use same environment setup as your existing route
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const prompt = `You are a Samsung TV technology expert. Explain the feature "${feature}" in a compelling way for TV shoppers.

Write 2-3 paragraphs (150-250 words) that:
1. Explain what the feature is in simple terms
2. Focus on benefits and why customers should care
3. Use engaging, sales-focused language
4. Be specific to Samsung when relevant

Feature: "${feature}"`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    return NextResponse.json({
      feature,
      description: description.trim(),
      success: true
    });

  } catch (error) {
    console.error('Feature description error:', error);
    
    // Simple fallbacks
    const fallbacks: { [key: string]: string } = {
      'OLED': 'OLED technology delivers perfect blacks and infinite contrast by controlling each individual pixel. Unlike traditional LED TVs, OLED pixels emit their own light and can turn completely off, creating true blacks that make colors pop with incredible vibrancy.',
      'QLED': 'QLED uses quantum dots to produce pure, accurate colors across a wider spectrum. Samsung\'s QLED displays deliver 100% Color Volume, ensuring brilliant colors at any brightness level.',
      '4K': '4K Ultra HD resolution delivers four times the detail of Full HD with over 8 million pixels. Every scene comes alive with incredible clarity and fine detail.',
      'HDR': 'HDR technology expands the range of colors and contrast for more realistic images. HDR reveals details in both shadows and highlights.',
      'Smart TV': 'Built-in smart functionality gives you access to all your favorite streaming apps and content without additional devices.'
    };

    return NextResponse.json({
      feature,
      description: fallbacks[feature] || `${feature} enhances your Samsung TV viewing experience with advanced technology.`,
      success: false
    });
  }
}