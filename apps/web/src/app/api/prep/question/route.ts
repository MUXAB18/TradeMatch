import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { trade, skills, locale } = await req.json();

    if (!trade) {
      return NextResponse.json({ error: 'Trade is required.' }, { status: 400 });
    }
    
    let languageInstruction = "English";
    if (locale === 'ur') {
      languageInstruction = "Roman Urdu (using English alphabet, for example: 'Aap ka is kaam mein kya tajurba hai?'). DO NOT write in English.";
    } else if (locale === 'ar') {
      languageInstruction = "Arabic. DO NOT write in English.";
    }

    const prompt = `You are an experienced hiring manager interviewing a ${trade} professional.
    
The candidate's skills include: ${skills?.join(', ') || 'general trade skills'}.

Generate ONE realistic, open-ended interview question tailored to this candidate.
Return ONLY the question text — no preamble, no quotes, no numbering. Just the question itself.

CRITICAL INSTRUCTION: You MUST write the question entirely in ${languageInstruction}. Do not include English translation.`;

    const { text } = await generateText({
      model: groq('openai/gpt-oss-20b'),
      prompt,
    });

    return NextResponse.json({ question: text.trim() });
  } catch (error) {
    console.error('Prep Question Error:', error);
    return NextResponse.json({ error: 'Failed to generate question.' }, { status: 500 });
  }
}
