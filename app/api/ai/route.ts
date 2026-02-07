import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
        return NextResponse.json(
            { error: 'Gemini API key not configured' },
            { status: 500 }
        );
    }

    try {
        const { action, content, context, messages } = await req.json();

        // Handle multi-turn chat
        if (action === 'chat') {
            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: ADMIN_ASSISTANT_PROMPT }] },
                    { role: 'model', parts: [{ text: "Understood. I will help you create high-quality theology curriculum and study materials." }] },
                    ...messages.map((m: any) => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1500,
                },
            });

            // The last message in 'messages' is the actual prompt
            const lastMessage = messages[messages.length - 1]?.content || '';
            const result = await chat.sendMessage(lastMessage);
            const responseText = result.response.text();

            return NextResponse.json({ response: responseText });
        }

        // Handle single-turn actions (legacy/user actions)
        let systemPrompt = SYSTEM_PROMPT;
        let userMessage = '';

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

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I will provide scholarly and pastoral biblical guidance with the formatting you requested." }] },
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
            }
        });

        const aiResponse = result.response.text();

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error('AI route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
