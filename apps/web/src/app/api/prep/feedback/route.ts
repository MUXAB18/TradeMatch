import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { question, answer, trade, locale } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });
    }

    let languageInstruction = "detect the language of the candidate's input (e.g., English, Hindi, Roman Urdu, Bengali, Tagalog, etc.) and reply in the EXACT SAME LANGUAGE. If they answer in Roman Urdu or Roman Hindi (using English letters), you MUST provide your feedback and the next question in Roman Urdu/Hindi.";

    if (locale === 'ur') {
      languageInstruction = "reply EXCLUSIVELY in Roman Urdu (using English alphabet, for example: 'Aap ka jawab acha tha'). DO NOT write in English, regardless of the candidate's input language.";
    } else if (locale === 'ar') {
      languageInstruction = "reply EXCLUSIVELY in Arabic. DO NOT write in English, regardless of the candidate's input language.";
    }

    const prompt = `You are an experienced hiring manager interviewing a ${trade || 'trades'} professional.

Currently, you asked the candidate this interview question: "${question}"

The candidate just said: "${answer}"

CRITICAL INSTRUCTION: You MUST ${languageInstruction}

Analyze what the candidate said. There are two possibilities:

1. They are answering your interview question:
   - Give brief, constructive feedback on their answer (2–3 sentences max). Highlight 1 strength and 1 area to improve.
   - Then on a NEW line starting exactly with "NEXT_QUESTION:", provide the next interview question to ask them.

2. They are NOT answering the question, and instead asking YOU a question or asking for help:
   - Answer their question helpfully and encouragingly as a mentor (3-4 sentences max). Give them advice on how to tackle the interview.
   - Then on a NEW line starting exactly with "NEXT_QUESTION:", repeat the original interview question ("${question}") so they can try answering it again.

Format your response exactly like this:
[Your feedback or advice here in the candidate's language]
NEXT_QUESTION: [Your next question or the repeated question here in the candidate's language]`;

    const { text } = await generateText({
      model: groq('openai/gpt-oss-20b'),
      prompt,
    });

    // Split feedback from next question
    const parts = text.split(/NEXT_QUESTION:/i);
    const feedback    = parts[0]?.trim() || 'Good answer! Keep practicing.';
    const nextQuestion = parts[1]?.trim() || null;

    return NextResponse.json({ feedback, nextQuestion });
  } catch (error) {
    console.error('Prep Feedback Error:', error);
    return NextResponse.json({ error: 'Failed to generate feedback.' }, { status: 500 });
  }
}
