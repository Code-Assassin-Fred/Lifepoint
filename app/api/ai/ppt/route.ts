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

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // -------------------------------------------
    // AGENT 1: RESEARCH AGENT
    // Gathers deep theological insights, expanded scripture, and illustrations
    // -------------------------------------------
    const researchSystemPrompt = `You are a PH.D level theological research agent and seasoned sermon preparation assistant.
Your goal is to provide a rich, multi-layered foundation for a powerful sermon.

Return a structured JSON object with:
{
  "themes": [
    { "title": "Theme Title", "description": "Deep theological explanation (100 words)" }
  ],
  "scriptures": [
    { 
      "reference": "Full Reference", 
      "text": "The full Bibical text (NKJV/ESV style)", 
      "context": "Brief historical context",
      "insight": "Transformational insight"
    }
  ],
  "context": "300+ words of historical, cultural, and Greek/Hebrew word-study research.",
  "illustrations": ["Compelling metaphors or real-life stories for this topic"],
  "applications": ["Concrete, life-changing action steps for the congregation"],
  "quotable": ["Powerfully phrased one-sentence insights"],
  "keyInsight": "The single most transformational 'Big Idea' of the sermon"
}

Be scholarly, spiritually deep, and practically relevant. Tone: ${tone || 'inspirational'}.
CRITICAL: Return ONLY valid JSON.`;

    const researchResponse = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        prompt: `Research this sermon topic thoroughly:\nTopic: ${topic}\nAdditional notes from the pastor: ${notes || 'None provided'}`,
        systemPrompt: researchSystemPrompt,
        format: 'json'
      }),
    });

    if (!researchResponse.ok) {
      const errData = await researchResponse.json().catch(() => ({}));
      console.error('[PPT] Research agent failed:', errData);
      throw new Error(`Research agent failed: ${errData?.error || errData?.details || researchResponse.statusText}`);
    }

    const research = await researchResponse.json();

    // -------------------------------------------
    // AGENT 2: ARCHITECT AGENT
    // Designs the visual and narrative flow of the presentation
    // -------------------------------------------
    const outlineSystemPrompt = `You are a master presentation designer and sermon architect. 
Given research data, design a powerful 10-12 slide presentation.

Available slideTypes:
- "title": Presentation opener
- "section_divider": Full-bleed visual break with a theme
- "content": Standard teaching slide
- "scripture_focus": Large quote focus (select precisely for impact)
- "application": Practical action items
- "closing": Powerful wrap-up

Return ONLY a JSON object:
{
  "title": "A Compelling Title",
  "subtitle": "A Memorable Tagline",
  "slideOutline": [
    {
      "slideNumber": number,
      "slideType": "title" | "section_divider" | "content" | "scripture_focus" | "application" | "closing",
      "mainIdea": "Detailed description of the slide's purpose",
      "designIntent": "Instructions for visual weight (e.g. focus on the word 'Grace')"
    }
  ]
}

Ensure a logical 'Mountain Peak' flow: Start strong, build depth, reach a climax (Big Idea), and conclude with clear response.
CRITICAL: Return ONLY valid JSON.`;

    const outlineResponse = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        prompt: `Create a presentation architecture from this research:\n${JSON.stringify(research)}\n\nTopic: ${topic}`,
        systemPrompt: outlineSystemPrompt,
        format: 'json'
      }),
    });

    if (!outlineResponse.ok) {
      const errData = await outlineResponse.json().catch(() => ({}));
      console.error('[PPT] Outline agent failed:', errData);
      throw new Error(`Outline agent failed: ${errData?.error || errData?.details || outlineResponse.statusText}`);
    }

    const outline = await outlineResponse.json();

    // -------------------------------------------
    // AGENT 3: CONTENT AGENT
    // Polishes the final copy for every slide
    // -------------------------------------------
    const contentSystemPrompt = `You are the world's leading sermon slide content writer.
You turn theological concepts into clear, beautiful, and impactful slide copy.

For each slide in the outline, generate:
1. 'title': Punchy and memorable
2. 'body': Professional bullet points or short paragraphs. (Max 4 items)
3. 'scripture': Full verse text if type is 'scripture_focus' or relevant reference
4. 'speakerNotes': 3-5 sentences of deep guidance for the preacher

Return ONLY a JSON object:
{
  "title": "Presentation Title",
  "subtitle": "Subtitle",
  "slides": [
    {
      "slideType": "same from outline",
      "title": "Slide Title",
      "body": "Content text...",
      "scripture": "Full Verse Text + Ref",
      "speakerNotes": "Preaching guidance..."
    }
  ]
}

Make every word count. Tone: ${tone || 'inspirational'}. 
Avoid all filler words. Use high-impact verbs.
CRITICAL: Return ONLY valid JSON.`;

    const contentResponse = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        prompt: `Generate final slide content.\n\nOutline: ${JSON.stringify(outline)}\n\nResearch: ${JSON.stringify(research)}\n\nTone: ${tone || 'inspirational'}`,
        systemPrompt: contentSystemPrompt,
        format: 'json'
      }),
    });

    if (!contentResponse.ok) {
      const errData = await contentResponse.json().catch(() => ({}));
      console.error('[PPT] Content agent failed:', errData);
      throw new Error(`Content agent failed: ${errData?.error || errData?.details || contentResponse.statusText}`);
    }

    const pptContent = await contentResponse.json();

    // -------------------------------------------
    // AGENT 4: DESIGN AGENT (NEW)
    // Selects layout variants and visual styling for each slide
    // -------------------------------------------
    const designSystemPrompt = `You are a world-class presentation designer. 
Your goal is to assign the perfect visual layout variant and color palette to each slide based on its content.

Available Layout Variants:
- "hero_centered", "hero_split" (for 'title' type)
- "minimal_line", "bold_full" (for 'section_divider')
- "standard_bullets", "split_content", "key_points_grid" (for 'content' type)
- "centered_quote", "sidebar_quote" (for 'scripture_focus')
- "numbered_steps", "icon_grid" (for 'application')
- "final_word" (for 'closing')

Return ONLY a JSON object:
{
  "slides": [
    {
      "layoutVariant": "variant_name",
      "accentColor": "HEX Code (e.g. #CCF381)",
      "bgPattern": "dots" | "waves" | "none"
    }
  ]
}

Logic Rules:
1. If content has 3+ bullet points, use "key_points_grid" or "standard_bullets".
2. If text is sparse (<15 words), use "split_content" or "hero_split".
3. For scripture, "centered_quote" is flagship.

Return ONLY valid JSON.`;

    const designResponse = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        prompt: `Assign layouts to these slides based on their content:\n${JSON.stringify(pptContent.slides)}`,
        systemPrompt: designSystemPrompt,
        format: 'json'
      }),
    });

    if (designResponse.ok) {
      const design = await designResponse.json();
      pptContent.slides = pptContent.slides.map((slide: any, i: number) => ({
        ...slide,
        layoutVariant: design.slides?.[i]?.layoutVariant || 'standard_bullets',
        accentColor: design.slides?.[i]?.accentColor || '#CCF381',
        bgPattern: design.slides?.[i]?.bgPattern || 'none'
      }));
    } else {
      console.warn('Design agent failed, falling back to defaults');
      pptContent.slides = pptContent.slides.map((slide: any) => ({
        ...slide,
        layoutVariant: 'standard_bullets',
        accentColor: '#CCF381',
        bgPattern: 'none'
      }));
    }

    // Ensure all slides have the expected fields
    pptContent.slides = pptContent.slides.map((slide: any) => ({
      slideType: slide.slideType || 'content',
      layoutVariant: slide.layoutVariant || 'standard_bullets',
      accentColor: slide.accentColor || '#CCF381',
      bgPattern: slide.bgPattern || 'none',
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
