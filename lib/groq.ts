const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const SYSTEM_INSTRUCTION = `Anda adalah Beroang AI, asisten pengajar untuk guru Indonesia.
Jawab langsung pada intinya, tanpa kalimat basa-basi di awal.
Gunakan format markdown untuk struktur jawaban yang rapi.
Jawab dalam Bahasa Indonesia yang profesional namun efisien.`;

export async function generateWithGroq(
  prompt: string,
  options: {
    model?: 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant';
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const {
    model = 'llama-3.3-70b-versatile',
    maxTokens = 2048,
    temperature = 0.2,
  } = options;

  const messages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED: Kuota Groq API telah habis. Silakan tunggu beberapa saat lagi.');
      }
      
      throw new Error(error.error?.message || `Groq API error: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      throw error;
    }
    throw new Error(`Groq API error: ${error.message}`);
  }
}

export async function generateWithGroqFast(prompt: string): Promise<string> {
  return generateWithGroq(prompt, {
    model: 'llama-3.1-8b-instant',
    maxTokens: 1024,
    temperature: 0.2,
  });
}

export async function generateWithGroqSmart(prompt: string): Promise<string> {
  return generateWithGroq(prompt, {
    model: 'llama-3.3-70b-versatile',
    maxTokens: 4096,
    temperature: 0.2,
  });
}
