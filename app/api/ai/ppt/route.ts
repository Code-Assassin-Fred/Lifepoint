import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { topic, notes, tone } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // System prompt for the AI to generate structured PPT content
        const systemPrompt = `You are a sermon presentation assistant. 
Create a structured PowerPoint presentation outline based on the user's topic and notes.
Return ONLY a JSON object with the following structure:
{
  "title": "Presentation Title",
  "subtitle": "Subtitle or Main Theme",
  "slides": [
    {
      "title": "Slide Title",
      "body": "Key points separated by newlines",
      "scripture": "Optional scripture reference for this slide"
    }
  ]
}
The presentation should have 5-8 slides. Ensure the tone is ${tone || 'inspirational'}.`;

        const userPrompt = `Topic: ${topic}\nNotes: ${notes || 'N/A'}`;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate',
                prompt: userPrompt,
                systemPrompt: systemPrompt
            }),
        });

        if (!response.ok) {
            throw new Error('AI generation failed');
        }

        const data = await response.json();

        // Parse the AI response (assuming the AI returns JSON string in its 'response' field)
        let pptContent;
        try {
            // Clean up potentially markdown-wrapped JSON
            const cleanJson = data.response.replace(/```json|```/g, '').trim();
            pptContent = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', data.response);
            throw new Error('AI returned invalid JSON format');
        }

        return NextResponse.json(pptContent);
    } catch (error: any) {
        console.error('[API/AI/PPT] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
