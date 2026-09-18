import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

async function main() {
  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    console.log("Testing generateObject with native Groq provider and openai/gpt-oss-20b...");
    const { object } = await generateObject({
      model: groq('openai/gpt-oss-20b'),
      schema: z.object({
        flashcards: z.array(
          z.object({
            question: z.string(),
            answer: z.string(),
            category: z.string()
          })
        ).length(2)
      }),
      prompt: "Generate 2 interview questions for a plumber.",
    });
    console.log("Success:", JSON.stringify(object, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}
main();
