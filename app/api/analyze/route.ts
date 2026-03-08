import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Initialize OpenAI client inside POST function
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Analyze conversations using the OpenAI client
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    return NextResponse.json({ error: 'Failed to analyze conversation' }, { status: 500 });
  }
}