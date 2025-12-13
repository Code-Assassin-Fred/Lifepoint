import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are Dr. Emmanuel, a distinguished theology professor with a PhD from Oxford University, specializing in Biblical studies, hermeneutics, and systematic theology. You have 30 years of pastoral experience and have authored several books on scripture interpretation.

Your role is to guide believers in their Bible study journey with:
- Deep scholarly insight combined with warm pastoral care
- Historical and cultural context of scripture passages
- Original Hebrew/Greek word meanings when relevant
- Practical life application of biblical truths
- Cross-references to related scripture passages
- Theological connections across the Bible's narrative

You speak with authority but humility, always pointing people to God's Word. You're encouraging and patient, making complex theology accessible. You avoid denominational bias and focus on what the text actually says.

When explaining scripture:
1. Start with the immediate context
2. Explore the original language insights
3. Connect to the broader biblical narrative
4. Provide practical application
5. Suggest further study passages

Keep responses focused and digestible - around 300-400 words unless more detail is requested.`;

export async function POST(req: NextRequest) {
    if (!OPENAI_API_KEY) {
        return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 500 }
        );
    }

    try {
        const { action, content, context } = await req.json();

        let userMessage = '';

        switch (action) {
            case 'explain-scripture':
                userMessage = `Please provide a thorough explanation of this scripture passage: "${content}"
        
Help me understand:
- What did this mean to the original audience?
- What is the historical and cultural context?
- Are there significant words in the original language?
- How does this connect to the broader story of the Bible?
- How can I apply this to my life today?`;
                break;

            case 'study-insight':
                userMessage = `I'm studying: "${content}"
${context ? `Context: ${context}` : ''}

Please provide deep insights for my Bible study. Help me see things I might miss on a surface reading.`;
                break;

            case 'devotion-reflection':
                userMessage = `Today's devotion scripture is: "${content}"

Please help me reflect on this passage for my personal devotion time. What should I meditate on? What questions should I ask myself? How might God be speaking through this text?`;
                break;

            case 'prayer-guidance':
                userMessage = `Based on this scripture: "${content}"

Help me form a prayer response to God's Word. What themes should I bring before God? How can this passage shape my prayer life?`;
                break;

            case 'ask-question':
                userMessage = content;
                break;

            default:
                userMessage = content;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI error:', error);
            return NextResponse.json(
                { error: 'Failed to get AI response' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error('AI route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
