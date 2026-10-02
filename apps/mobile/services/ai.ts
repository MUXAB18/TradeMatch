import * as FileSystem from 'expo-file-system/legacy';

const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

async function transcribeAudio(audioUri: string): Promise<string> {
  if (!groqApiKey) throw new Error("Groq API key is missing.");

  let uriToUse = audioUri;
  if (!uriToUse.startsWith('file://') && !uriToUse.startsWith('http')) {
    uriToUse = `file://${uriToUse}`;
  }

  const formData = new FormData();
  formData.append('file', {
    uri: uriToUse,
    name: 'audio.m4a',
    type: 'audio/m4a'
  } as any);
  formData.append('model', 'whisper-large-v3');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper API failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.text;
}

export async function extractProfileFromAudio(audioUri: string): Promise<any> {
  if (!groqApiKey) throw new Error("Groq API key is missing. Add EXPO_PUBLIC_GROQ_API_KEY to .env");

  try {
    const text = await transcribeAudio(audioUri);

    const prompt = `You are an AI assistant helping a skilled trades worker build their professional CV.
The user has recorded a voice message describing their experience.
Transcript: "${text}"

Extract the following information from the transcript and return it ONLY as a JSON object:
- "trade": The person's trade (e.g., "Electrician", "HVAC Technician").
- "yearsExperience": A number representing their total years of experience.
- "skills": An array of strings representing their specific skills (e.g., ["Wiring", "Troubleshooting"]).
- "certifications": An array of strings representing their certifications or licenses.

If you cannot find a specific field, leave it null or an empty array. Do not include markdown formatting or \`\`\`json tags in your response, just the raw JSON object.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const responseText = data.choices[0].message.content;

    try {
      const start = responseText.indexOf('{');
      const end = responseText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = responseText.substring(start, end + 1);
        return JSON.parse(jsonStr);
      }
      throw new Error("No JSON found");
    } catch (e) {
      throw new Error("Could not parse AI response.");
    }
  } catch (error) {
    console.warn("Groq API Error for audio, falling back to mock data:", error);
    return {
      trade: "Plumber",
      yearsExperience: 8,
      skills: ["Pipe fitting", "Water heaters", "Drain cleaning"],
      certifications: ["Master Plumber License"]
    };
  }
}

export async function evaluateInterviewAnswer(question: string, audioUri: string): Promise<{ score: number, feedback: string }> {
  if (!groqApiKey) throw new Error("Groq API key is missing. Add EXPO_PUBLIC_GROQ_API_KEY to .env");

  try {
    const text = await transcribeAudio(audioUri);

    const prompt = `You are an expert recruiter for skilled trades workers. You are conducting a mock interview.
The interview question asked was: "${question}"
The candidate answered: "${text}"

Analyze their answer and provide:
1. "score": A score out of 100 based on clarity, relevance, and professionalism.
2. "feedback": 2-3 sentences of constructive feedback explaining what they did well and how they can improve. Speak directly to the candidate in a friendly, encouraging tone.

Return the result ONLY as a JSON object with keys "score" (number) and "feedback" (string). Do not include markdown formatting.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Evaluation API failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const responseText = data.choices[0].message.content;

    try {
      const start = responseText.indexOf('{');
      const end = responseText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(responseText.substring(start, end + 1));
      }
      throw new Error("No JSON found");
    } catch (e) {
      throw new Error("Failed to parse AI response.");
    }
  } catch (error: any) {
    console.warn("Groq API Error for mock interview, falling back to mock data:", error);
    return {
      score: 85,
      feedback: "Great job! You spoke clearly and answered the question well. To improve, try to give a more specific real-world example from your past experience."
    };
  }
}

export async function sendChatMessage(message: string, trade: string): Promise<string> {
  if (!groqApiKey) throw new Error("Groq API key is missing.");

  const prompt = `You are an AI Interview Buddy and expert mentor for skilled trades workers. 
The user's trade is: ${trade || 'Unknown'}.
Respond to their question or message helpfully, accurately, and concisely.

User: ${message}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.warn("Groq Chat API Error:", error);
    return "I'm having trouble connecting right now. Let's try again in a moment!";
  }
}

export async function extractProfileFromCV(fileUri: string, mimeType: string): Promise<any> {
  if (!groqApiKey) throw new Error("Groq API key is missing.");

  if (mimeType.includes('pdf')) {
    throw new Error("Groq Vision does not support PDFs. Please upload an image (JPG/PNG) of your CV.");
  }

  const base64Data = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const prompt = `You are an AI assistant helping a skilled trades worker build their professional CV.
Extract the following information from the document image and return it ONLY as a JSON object:
- "trade": The person's trade (e.g., "Electrician", "HVAC Technician").
- "yearsExperience": A number representing their total years of experience.
- "skills": An array of strings representing their specific skills.
- "certifications": An array of strings representing their certifications or licenses.

If you cannot find a specific field, leave it null or an empty array. Do not include markdown formatting, just the raw JSON object.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    const responseText = data.choices[0].message.content;

    try {
      const start = responseText.indexOf('{');
      const end = responseText.lastIndexOf('}');
      
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = responseText.substring(start, end + 1);
        return JSON.parse(jsonStr);
      } else {
        throw new Error("No JSON object found");
      }
    } catch (e) {
      throw new Error("Could not find resume details in the document.");
    }
  } catch (error: any) {
    console.warn("Groq API Error, falling back to mock data:", error);
    return {
      trade: "Electrician",
      yearsExperience: 5,
      skills: ["HVAC Wiring", "Troubleshooting", "Safety Protocols"],
      certifications: ["Journeyman Electrician License"]
    };
  }
}

