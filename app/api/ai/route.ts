import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

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

You speak with authority but humility, always pointing people to God's Word. Keep responses focused - around 300-400 words unless more detail is requested.`;

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

Be thorough but practical. Provide content that can be directly used or easily adapted.`;

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
        const { action, content, context, messages, format, material, specifications } = body;

        const generationConfig = {
            temperature: 0.7,
            maxOutputTokens: 3500,
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
        let systemPrompt = SYSTEM_PROMPT;
        let userMessage = '';

        if (format === 'json') {
            systemPrompt = `You are a structured data generator for a church app. Output ONLY valid JSON matching the requested schema. Do not include markdown code blocks or additional text.`;
            
            if (action === 'generate-insight') {
                userMessage = `Generate a daily devotional insight based on: "${content}". 
                Schema: { "title": string, "content": string, "prayerPrompt": string }`;
            } else if (action === 'generate-plan') {
                userMessage = `Generate a 3-7 day Bible study plan based on: "${content}". 
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
                Generate a COMPREHENSIVE 7-day Bible study curriculum for one week based on the theme: "${content}".
                
                ${material ? `Use the following source material as the primary foundation: \n\n ${material} \n\n` : ''}
                ${specifications ? `IMPORTANT ADDITIONAL SPECIFICATIONS: \n\n ${specifications} \n\n` : ''}

                The curriculum MUST include:
                1. A weekly theme title and summary.
                2. Seven individual daily lessons.
                3. Each lesson must have:
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
                    userMessage = `Explain this scripture passage in detail: "${content}"
    
    Help me understand:
    - What did this mean to the original audience?
    - What is the historical and cultural context?
    - Are there significant words in the original language?
    - How does this connect to the broader story of the Bible?
    - How can I apply this to my life today?
    
    ${context ? `Additional context: ${context}` : ''}`;
                    break;
    
                case 'study-insight':
                    userMessage = `I'm studying: "${content}"
    ${context ? `Context: ${context}` : ''}
    
    Provide deep insights for my Bible study. Help me see things I might miss on a surface reading. Include original language insights where relevant.`;
                    break;
    
                case 'devotion-reflection':
                    userMessage = `Today's devotion scripture is: "${content}"
    
    Help me reflect on this passage for my personal devotion time. Structure your response with:
    - A brief meditation thought
    - Key observations from the text
    - Questions for self-reflection
    - A closing prayer focus`;
                    break;
    
                case 'prayer-guidance':
                    userMessage = `Based on this scripture: "${content}"
    
    Help me form a prayer response to God's Word. Structure your response with:
    - Themes to bring before God
    - Praise points from the passage
    - Personal application prayers
    - A sample prayer`;
                    break;
    
                case 'ask-question':
                    userMessage = content;
                    break;
    
                default:
                    userMessage = content;
            }
        }

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I will provide the requested guidance in the specified format." }] },
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            generationConfig
        });

        let aiResponse = result.response.text();

        // Clean JSON if requested
        if (format === 'json') {
            try {
                // If it contains ```json ... ``` or just ``` ... ```
                const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                const cleanedJson = jsonMatch ? jsonMatch[1] : aiResponse;
                return NextResponse.json(JSON.parse(cleanedJson));
            } catch (err) {
                console.error('JSON parsing failed. Raw response:', aiResponse);
                throw new Error('AI produced invalid JSON');
            }
        }

        return NextResponse.json({ response: aiResponse });
    } catch (error: any) {
        console.error('AI route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
