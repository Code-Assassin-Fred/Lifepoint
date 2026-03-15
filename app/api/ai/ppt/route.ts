import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { topic, notes, tone } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // ==========================================
        // MULTI-AGENT WORKFLOW
        // Agent 1: Research → Agent 2: Outline → Agent 3: Content
        // ==========================================

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // -------------------------------------------
        // AGENT 1: RESEARCH AGENT
        // Gathers key theological points, relevant scriptures, and context
        // -------------------------------------------
        const researchSystemPrompt = `You are a theological research agent. Your job is to deeply analyze a sermon topic and provide:
1. Key theological themes and concepts related to the topic
2. 5-8 relevant Bible verses with their full references (book, chapter, verse)
3. Historical and cultural context that enriches understanding
4. Common misconceptions or challenges related to this topic
5. Practical life applications

Return your research as a structured JSON object:
{
  "themes": ["theme1", "theme2", ...],
  "scriptures": [{"reference": "John 3:16", "relevance": "why this verse matters"}],
  "context": "historical and cultural background",
  "applications": ["application1", "application2", ...],
  "keyInsight": "the single most powerful insight about this topic"
}

Be thorough, scholarly, and spiritually insightful. The tone should be ${tone || 'inspirational'}.
CRITICAL: Return ONLY valid JSON, no markdown formatting.`;

        const researchResponse = await fetch(`${baseUrl}/api/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate',
                prompt: `Research this sermon topic thoroughly:\nTopic: ${topic}\nAdditional notes from the pastor: ${notes || 'None provided'}`,
                systemPrompt: researchSystemPrompt
            }),
        });

        if (!researchResponse.ok) {
            throw new Error('Research agent failed');
        }

        const researchData = await researchResponse.json();
        let research;
        try {
            const cleanJson = researchData.response.replace(/```json|```/g, '').trim();
            research = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[Agent 1 - Research] Failed to parse:', researchData.response);
            // Fallback - use raw text as context
            research = { themes: [topic], scriptures: [], context: researchData.response, applications: [], keyInsight: topic };
        }

        // -------------------------------------------
        // AGENT 2: OUTLINE AGENT
        // Creates structured presentation outline from research
        // -------------------------------------------
        const outlineSystemPrompt = `You are a sermon presentation architect. Given research data about a sermon topic, create a structured outline for a PowerPoint presentation.

The outline should:
1. Start with a compelling opening slide
2. Have 6-8 content slides with clear progression
3. Each slide should have a distinct purpose (introduction, key point, scripture deep-dive, application, etc.)
4. End with a call to action or reflection slide

Return ONLY a JSON object:
{
  "title": "Compelling Presentation Title",
  "subtitle": "Tagline or theme statement",
  "slideOutline": [
    {
      "slideNumber": 1,
      "purpose": "opening|keypoint|scripture|illustration|application|closing",
      "mainIdea": "What this slide communicates",
      "suggestedScripture": "Reference if applicable"
    }
  ]
}

Make the flow feel natural and building toward a powerful conclusion.
CRITICAL: Return ONLY valid JSON, no markdown formatting.`;

        const outlineResponse = await fetch(`${baseUrl}/api/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate',
                prompt: `Create a sermon presentation outline based on this research:\n${JSON.stringify(research)}\n\nOriginal topic: ${topic}\nDesired tone: ${tone || 'inspirational'}`,
                systemPrompt: outlineSystemPrompt
            }),
        });

        if (!outlineResponse.ok) {
            throw new Error('Outline agent failed');
        }

        const outlineData = await outlineResponse.json();
        let outline;
        try {
            const cleanJson = outlineData.response.replace(/```json|```/g, '').trim();
            outline = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[Agent 2 - Outline] Failed to parse:', outlineData.response);
            // Fallback outline
            outline = {
                title: topic,
                subtitle: 'A Sermon Presentation',
                slideOutline: [
                    { slideNumber: 1, purpose: 'opening', mainIdea: 'Introduction to ' + topic },
                    { slideNumber: 2, purpose: 'keypoint', mainIdea: 'Key teaching on ' + topic },
                    { slideNumber: 3, purpose: 'scripture', mainIdea: 'Scripture foundation' },
                    { slideNumber: 4, purpose: 'application', mainIdea: 'Practical application' },
                    { slideNumber: 5, purpose: 'closing', mainIdea: 'Call to action' }
                ]
            };
        }

        // -------------------------------------------
        // AGENT 3: CONTENT AGENT
        // Generates polished slide content from outline + research
        // -------------------------------------------
        const contentSystemPrompt = `You are an expert sermon slide writer. Given a presentation outline and research, generate the final polished content for each slide.

For each slide, provide:
- A powerful, concise title (max 8 words)
- Body content with 2-4 key bullet points (each 1-2 sentences)
- A relevant scripture reference if applicable
- Speaker notes to guide the presenter (2-3 sentences of what to emphasize)

Return ONLY a JSON object:
{
  "title": "Presentation Title",
  "subtitle": "Subtitle",
  "slides": [
    {
      "title": "Slide Title",
      "body": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
      "scripture": "Scripture reference - verse text",
      "speakerNotes": "Notes for the presenter on delivery and emphasis"
    }
  ]
}

Make every word count. The content should be ${tone || 'inspirational'} in tone. Avoid filler. Each slide should be memorable and impactful.
CRITICAL: Return ONLY valid JSON, no markdown formatting.`;

        const contentResponse = await fetch(`${baseUrl}/api/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate',
                prompt: `Generate polished slide content.\n\nOutline: ${JSON.stringify(outline)}\n\nResearch: ${JSON.stringify(research)}\n\nPastor's notes: ${notes || 'None'}\n\nTone: ${tone || 'inspirational'}`,
                systemPrompt: contentSystemPrompt
            }),
        });

        if (!contentResponse.ok) {
            throw new Error('Content agent failed');
        }

        const contentData = await contentResponse.json();
        let pptContent;
        try {
            const cleanJson = contentData.response.replace(/```json|```/g, '').trim();
            pptContent = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[Agent 3 - Content] Failed to parse:', contentData.response);
            throw new Error('Content agent returned invalid JSON format');
        }

        // Ensure all slides have the expected fields
        pptContent.slides = pptContent.slides.map((slide: any) => ({
            title: slide.title || 'Untitled Slide',
            body: slide.body || '',
            scripture: slide.scripture || '',
            speakerNotes: slide.speakerNotes || ''
        }));

        return NextResponse.json(pptContent);
    } catch (error: any) {
        console.error('[API/AI/PPT] Multi-agent error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
