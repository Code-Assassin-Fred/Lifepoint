import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.Gemini_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

const SYSTEM_PROMPT = `You are a distinguished theology scholar with deep expertise in Biblical studies, hermeneutics, and systematic theology. You have extensive pastoral experience and author scripture interpretation guides.

Your role is to guide believers in their Bible study journey with:
- Deep scholarly insight combined with warm pastoral care
- Historical and cultural context of scripture passages
- Original Hebrew/Greek word meanings when relevant
- Practical life application of biblical truths
- Cross-references to related scripture passages
- Theological connections across the Bible's narrative

IMPORTANT FORMATTING RULES:
1. Use clear markdown headers (##, ###) to organize your response
2. Use **bold** for emphasis on key terms
3. Use bullet points for lists
4. Keep paragraphs short for readability
5. End with a "Further Study" section with 2-3 related passages

You speak with authority but humility, always pointing people to God's Word. Keep responses focused - around 300-400 words unless more detail is requested.
CRITICAL: DO NOT use em dashes (—). Use commas, colons, or parentheses instead.`;

const ADMIN_ASSISTANT_PROMPT = `You are an expert theology curriculum designer helping church leaders create Bible study content. 

Your role is to:
- Generate well-structured devotional content
- Create multi-day study plan outlines
- Suggest scripture passages for specific themes
- Write reflection questions and prayer prompts

IMPORTANT: Format your responses with clear structure using markdown:
- Use ## for main sections
- Use ### for subsections
- Use **bold** for key terms
- Use numbered lists for study days
- Use bullet points for questions/prompts

Be thorough but practical. Provide content that can be directly used or easily adapted.
CRITICAL: DO NOT use em dashes (—). Use commas, colons, or parentheses instead.`;

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY || !model) {
        console.error('Gemini API key or model missing');
        return NextResponse.json(
            { error: 'Gemini API key not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        console.log('Received AI Request Body:', body);
        const { action, content, prompt, systemPrompt: reqSystemPrompt, context, messages, format, material, specifications } = body;

        // Support 'prompt' as an alias for 'content'
        const effectiveContent = content || prompt || '';

        const generationConfig = {
            temperature: 0.7,
            maxOutputTokens: 16384,
            responseMimeType: format === 'json' ? 'application/json' : 'text/plain',
        };


        // Handle multi-turn chat
        if (action === 'chat') {
            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: ADMIN_ASSISTANT_PROMPT }] },
                    { role: 'model', parts: [{ text: "Understood. I will help you create high-quality theology curriculum and study materials." }] },
                    ...(messages || []).map((m: any) => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                ],
                generationConfig,
            });

            // The last message in 'messages' is the actual prompt
            const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : content;
            const result = await chat.sendMessage(lastMessage);
            const responseText = result.response.text();

            return NextResponse.json({ response: responseText });
        }

        // Handle single-turn actions (legacy/user actions / content generation)
        let systemPrompt = reqSystemPrompt || SYSTEM_PROMPT;
        let userMessage = '';

        if (format === 'json') {
            if (!reqSystemPrompt) {
                systemPrompt = `You are a structured data generator for a church app. Output ONLY valid JSON matching the requested schema. Do not include markdown code blocks or additional text.`;
            }

            if (action === 'generate-skeleton') {
                userMessage = `Act as a Head of Curriculum. Create a 7-day Bible study outline based on the theme: "${effectiveContent}".
                ${material ? `Source Material: ${material.substring(0, 5000)}` : ''}
                CRITICAL: DO NOT use em dashes (—). Use commas or colons.
                Output JSON with:
                {
                    "theme": string,
                    "summary": string,
                    "skeleton": [
                        { "dayNumber": number, "title": string, "scripture": string }
                    ]
                }`;
            } else if (action === 'generate-lesson') {
                const { skeleton, dayNumber } = body;
                userMessage = `Act as a Pastoral Content Writer. Expand Day ${dayNumber} of this curriculum.
                Theme: ${effectiveContent}
                Daily Title: ${skeleton.title}
                Scripture: ${skeleton.scripture}
                ${material ? `Source Material: ${material.substring(0, 8000)}` : ''}
                ${specifications ? `Specs: ${specifications}` : ''}
                
                CRITICAL: DO NOT use em dashes (—). Use commas, colons, or parentheses instead.
                
                Generate a full lesson reflecting the theme and source material. 
                Output JSON:
                {
                    "dayNumber": ${dayNumber},
                    "title": string,
                    "scripture": string,
                    "content": string (250-350 words),
                    "reflectionQuestions": string[] (3 items),
                    "prayerPoint": string
                }`;
            } else if (action === 'verify-lesson') {
                const { lesson } = body;
                systemPrompt = reqSystemPrompt || `You are a Theological Reviewer. Critique the following lesson for:
1. Theological accuracy
2. Alignment with source material
3. Hallucinations (making up quotes/facts not in scripture or material)
4. Missing context or depth
5. CRITICAL: Check for any em dashes (—). If found, flag as NEEDS_FIX.

Output ONLY JSON:
{
    "status": "APPROVED" | "NEEDS_FIX",
    "feedback": string (Concise critique if NEEDS_FIX),
    "suggestedFix": string (Specific instruction for the writer)
}`;
                userMessage = `Review this lesson:\n${JSON.stringify(lesson)}\n\nSource Material: ${material ? material.substring(0, 5000) : 'None provided'}`;
            } else if (action === 'generate-insight') {
                userMessage = `Generate a daily devotional insight based on: "${effectiveContent}". 
                Schema: { "title": string, "content": string, "prayerPrompt": string }`;
            } else if (action === 'generate-plan') {
                userMessage = `Generate a 3-7 day Bible study plan based on: "${effectiveContent}". 
                Schema: { 
                    "title": string, 
                    "description": string, 
                    "category": "Personal" | "Leadership" | "Knowledge" | "Wisdom" | "Inspiration" | "Growth",
                    "days": [
                        { "dayNumber": number, "title": string, "scripture": string, "content": string }
                    ]
                }`;
            } else if (action === 'generate-weekly-curriculum') {
                userMessage = `Act as a team of Christian Educators (Planner, Content Creator, and Engagement Specialist).
                Generate a COMPREHENSIVE 7-day Bible study curriculum for one week based on the theme: "${effectiveContent}".
                
                ${material ? `Use the following source material as the primary foundation: \n\n ${material} \n\n` : ''}
                ${specifications ? `IMPORTANT ADDITIONAL SPECIFICATIONS: \n\n ${specifications} \n\n` : ''}

                The curriculum MUST include:
                1. A weekly theme title and summary.
                2. Seven individual daily lessons.
                3. CRITICAL: DO NOT use em dashes (—) in any part of the response.
                4. Each lesson must have:
                   - dayNumber (1-7)
                   - title (Specific to the day)
                   - scripture (Full reference and text snippet)
                   - content (200-300 words of teaching/exposition)
                   - reflectionQuestions (Array of 3 deep questions)
                   - prayerPoint (A specific prayer focus for the day)
                
                Output ONLY valid JSON matching this schema:
                {
                    "theme": string,
                    "summary": string,
                    "lessons": [
                        {
                            "dayNumber": number,
                            "title": string,
                            "scripture": string,
                            "content": string,
                            "reflectionQuestions": string[],
                            "prayerPoint": string
                        }
                    ]
                }`;
            }
        } else {
            switch (action) {
                case 'explain-scripture':
                    userMessage = `Explain this scripture passage in detail: "${effectiveContent}"
    
    Help me understand:
    - What did this mean to the original audience?
    - What is the historical and cultural context?
    - Are there significant words in the original language?
    - How does this connect to the broader story of the Bible?
    - How can I apply this to my life today?
    
    ${context ? `Additional context: ${context}` : ''}`;
                    break;

                case 'study-insight':
                    userMessage = `I'm studying: "${effectiveContent}"
    ${context ? `Context: ${context}` : ''}
    
    Provide deep insights for my Bible study. Help me see things I might miss on a surface reading. Include original language insights where relevant.`;
                    break;

                case 'devotion-reflection':
                    userMessage = `Today's devotion scripture is: "${effectiveContent}"
    
    Help me reflect on this passage for my personal devotion time. Structure your response with:
    - A brief meditation thought
    - Key observations from the text
    - Questions for self-reflection
    - A closing prayer focus`;
                    break;

                case 'prayer-guidance':
                    userMessage = `Based on this scripture: "${effectiveContent}"
    
    Help me form a prayer response to God's Word. Structure your response with:
    - Themes to bring before God
    - Praise points from the passage
    - Personal application prayers
    - A sample prayer`;
                    break;

                case 'ask-question':
                    userMessage = effectiveContent;
                    break;

                case 'generate':
                    userMessage = effectiveContent;
                    break;

                default:
                    userMessage = effectiveContent;
            }
        }

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I will provide the requested guidance in the specified format." }] },
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            generationConfig,
            safetySettings
        });

        let aiResponse = result.response.text();

        // Clean JSON if requested
        if (format === 'json') {
            try {
                // More robust JSON extraction: find first '{' and last '}'
                const firstBrace = aiResponse.indexOf('{');
                const lastBrace = aiResponse.lastIndexOf('}');

                if (firstBrace === -1 || lastBrace === -1) {
                    throw new Error('No JSON object found in response');
                }

                const cleanedJson = aiResponse.substring(firstBrace, lastBrace + 1);
                return NextResponse.json(JSON.parse(cleanedJson));
            } catch (err: any) {
                console.error('JSON parsing failed. Raw response:', aiResponse);
                return NextResponse.json({
                    error: 'AI produced invalid JSON',
                    details: err.message,
                    rawResponse: aiResponse.substring(0, 500) + '...'
                }, { status: 500 });
            }
        }

        return NextResponse.json({ response: aiResponse });
    } catch (error: any) {
        console.error('AI route error:', error?.message || error);
        return NextResponse.json(
            { error: error?.message || 'Internal server error', details: error?.message },
            { status: 500 }
        );
    }
}
