import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: join(__dirname, '.env') });

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize the new SDK with API key
const ai = new GoogleGenAI({
  apiKey: apiKey
});

export async function analyzeProduct(productName) {
  try {
    // Craft a safe, structured prompt
    const prompt = `You are a chemical safety educator. Provide a clear, informative overview of "${productName}" for general consumers.

Structure your response EXACTLY as follows with these section headers:

## Product Summary
[Provide a high-level description of the product and its purpose]

## Common Chemical Components
[List typical ingredients in simple terms - no chemical formulas, keep it educational and non-technical]

## Safe Usage Guidelines
[Explain proper everyday usage, storage, and handling]

## Effects of Improper Use
[Describe potential risks of misuse in a clear but non-alarming way]

## Environmental Considerations
[Discuss disposal, packaging impact, and eco-friendly aspects]

Important guidelines:
- Keep language simple and educational
- Do not provide chemical formulas or synthesis instructions
- Focus on consumer safety and awareness
- Be factual but not alarmist
- Keep each section to 2-4 sentences`;

    // Generate content using the new SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;

    // Parse the response into structured sections
    const sections = parseResponse(text);

    return sections;

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Failed to generate safety analysis');
  }
}

function parseResponse(text) {
  // Parse markdown-style sections
  const sections = {
    productSummary: '',
    chemicalComponents: '',
    safeUsage: '',
    improperUse: '',
    environmental: ''
  };

  // Split by headers
  const parts = text.split('##').filter(part => part.trim());

  parts.forEach(part => {
    const lines = part.trim().split('\n');
    const header = lines[0].toLowerCase();
    const content = lines.slice(1).join('\n').trim();

    if (header.includes('product summary')) {
      sections.productSummary = content;
    } else if (header.includes('chemical component')) {
      sections.chemicalComponents = content;
    } else if (header.includes('safe usage') || header.includes('usage guideline')) {
      sections.safeUsage = content;
    } else if (header.includes('improper use') || header.includes('effects')) {
      sections.improperUse = content;
    } else if (header.includes('environmental')) {
      sections.environmental = content;
    }
  });

  return sections;
}

