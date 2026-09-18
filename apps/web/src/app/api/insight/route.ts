import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trade, skills, certifications, location } = body;

    if (!trade) {
      return NextResponse.json(
        { insight: "Complete your profile to unlock personalized AI career insights and better job recommendations." },
        { status: 200 }
      );
    }

    const prompt = `You are an expert AI career advisor for skilled blue-collar trades on a platform called TradeMatch.
    The user is a ${trade}. 
    ${skills?.length ? `They have these skills: ${skills.join(', ')}.` : ''}
    ${certifications?.length ? `They have these certifications: ${certifications.join(', ')}.` : ''}
    ${location ? `They are based in: ${location}.` : ''}
    
    Provide ONE short, highly encouraging, and specific sentence about their career prospects or what they should do next to improve their chances of getting hired. 
    Make it sound human, professional, and action-oriented. Do not use hashtags, quotes, or robotic greetings. Maximum 2 sentences.`;

    // Using GPT-OSS-20B on Groq
    const { text } = await generateText({
      model: groq('openai/gpt-oss-20b'),
      prompt,
    });

    return NextResponse.json({ insight: text.trim() });
  } catch (error) {
    console.error('AI Insight Error:', error);
    return NextResponse.json(
      { insight: "We couldn't generate your AI insight at this moment. Keep building your profile to attract top employers!" },
      { status: 500 }
    );
  }
}
