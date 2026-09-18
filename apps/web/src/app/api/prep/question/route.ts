import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { trade, skills } = await req.json();

    if (!trade) {
      return NextResponse.json({ error: 'Trade is required.' }, { status: 400 });
    }

    const prompt = `You are an experienced hiring manager interviewing a ${trade} professional.
    
The candidate's skills include: ${skills?.join(', ') || 'general trade skills'}.

Generate ONE realistic, open-ended interview question tailored to this candidate.
Return ONLY the question text — no preamble, no quotes, no numbering. Just the question itself.`;

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
