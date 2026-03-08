import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { messages } = await req.json();

    try {
        const completion = await openai.chat.completions.create({
            messages,
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
        });

        const responseMessage = completion.choices[0].message;
        return NextResponse.json({ data: responseMessage });
    } catch (error) {
        return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
    }
}