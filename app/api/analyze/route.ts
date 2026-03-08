export async function POST(request: Request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return new Response('API key is missing', { status: 500 });
    }

    const openai = new OpenAI(apiKey);
    // The rest of your POST function implementation...
}