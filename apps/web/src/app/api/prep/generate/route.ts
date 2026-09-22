import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trade, skills, certifications, experienceLevel, locale } = body;

    if (!trade) {
      return NextResponse.json(
        { error: "Trade is required to generate interview prep." },
        { status: 400 }
      );
    }
    
    let languageInstruction = "English";
    if (locale === 'ur') {
      languageInstruction = "Roman Urdu (using English alphabet, for example: 'Aap ka is kaam mein kya tajurba hai?'). DO NOT write in English.";
    } else if (locale === 'ar') {
      languageInstruction = "Arabic. DO NOT write in English.";
    }

    const prompt = `Generate 10 highly realistic and tailored interview questions and answers for a ${trade}.
    
    Context about the candidate:
    - Skills: ${skills?.join(', ') || 'General'}
    - Certifications: ${certifications?.join(', ') || 'None'}
    - Level: ${experienceLevel || 'Mid-level'}
    
    The output MUST be 10 flashcards, each containing a realistic interview question and a strong, model answer that the candidate can use to practice.
    Categories should be distributed among: "Technical", "Safety", "Soft Skills", and "Scenario".
    
    CRITICAL INSTRUCTION: You MUST write ALL questions and answers entirely in ${languageInstruction}.`;

    const { object } = await generateObject({
      model: groq('openai/gpt-oss-20b'),
      schema: z.object({
        flashcards: z.array(
          z.object({
            question: z.string().describe("The interview question"),
            answer: z.string().describe("A professional and comprehensive answer"),
            category: z.enum(["Technical", "Safety", "Soft Skills", "Scenario"]).describe("The category of the question"),
          })
        ).length(10),
      }),
      prompt,
    });

    return NextResponse.json({ flashcards: object.flashcards });
  } catch (error) {
    console.error('AI Prep Generation Error:', error);
    return NextResponse.json(
      { error: "Failed to generate interview prep cards. Please try again." },
      { status: 500 }
    );
  }
}
