// src/app/api/chat/[[...chat]]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp, limit } from 'firebase/firestore';
import { generateChatResponse, generateChatResponseStream } from '@/ai/flows/generate-chat-response';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const bearer = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    const apiKey = bearer || body.apiKey;
    const history = Array.isArray(body.history) ? body.history.slice(-30) : [];
    const stream = body.stream === true;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required.' }, { status: 401 });
    }
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const db = getDb();
    // Find the specific chatbot by its API key
    const chatbotQuery = query(collection(db, 'chatbots'), where('apiKey', '==', apiKey), limit(1));
    const chatbotSnap = await getDocs(chatbotQuery);
    const chatbotDoc = chatbotSnap.docs[0];
    const chatbot = chatbotDoc?.data();

    if (!chatbot) {
        return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 });
    }

    // --- Domain Authorization Check ---
    const origin = req.headers.get('origin');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const allowedDomains = chatbot.authorizedDomains || [];
    
    // The test page is on the same origin, so we allow it.
    const isTestPage = origin === appUrl;

    if (origin && !isTestPage && allowedDomains.length > 0) {
        const originHost = new URL(origin).hostname;
        const isAuthorized = allowedDomains.some((domain: string) => {
            const domainPattern = new RegExp(`^(.+\\.)?${domain.replace('.', '\\.')}$`);
            return domainPattern.test(originHost);
        });

        if (!isAuthorized) {
             return NextResponse.json({ error: 'This chatbot is not authorized for this website.' }, { status: 403 });
        }
    }
    
    // Find the owner of the chatbot
    const userSnap = await getDoc(doc(db, 'users', chatbot.userId));
    let user = userSnap.exists() ? userSnap.data() : null;

    if (!user) {
        // This case should ideally not happen if data integrity is maintained
        return NextResponse.json({ error: 'Chatbot owner not found.' }, { status: 500 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'This API key has been disabled.' }, { status: 403 });
    }

    // --- Message Limit and Cycle Reset Logic ---
    const now = new Date();
    const cycleStartDate = user.planCycleStartDate?.toDate ? user.planCycleStartDate.toDate() : new Date(user.planCycleStartDate || 0);
    const cycleEndDate = new Date(cycleStartDate.getTime());
    cycleEndDate.setDate(cycleEndDate.getDate() + 30);

    let updates: any = {};
    if (now > cycleEndDate) {
        // More than 30 days have passed, reset the cycle.
        updates = { messagesSent: 1, planCycleStartDate: Timestamp.now() };
        // Update user object for the check below
        user.messagesSent = 1;
    } else {
        if (user.messagesSent >= user.messageLimit) {
            return NextResponse.json({ error: 'Monthly message limit reached. Please upgrade your plan.' }, { status: 429 });
        }
        updates = { messagesSent: (user.messagesSent || 0) + 1 };
    }
    
    // Atomically update the user's message count
    await updateDoc(doc(db, 'users', chatbot.userId), updates);

    const flowInput = {
        message,
        instructions: chatbot.instructions || 'You are a helpful assistant.',
        qa: chatbot.qa || [],
        history: history || [],
    };

    await addDoc(collection(db, 'usageEvents'), {
        userId: chatbot.userId,
        botId: chatbotDoc.id,
        type: 'chat_request',
        model: chatbot.model || process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
        messageCount: 1,
        timestamp: Timestamp.now(),
        conversationId: typeof body.conversationId === 'string' ? body.conversationId : null,
    });
    
    if (stream) {
      const { stream: aiStream, response } = await generateChatResponseStream(flowInput);
      response.catch((err: unknown) => console.error('Streaming response failed', err));
      return new Response(aiStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
      });
    } else {
       const aiResponse = await generateChatResponse(flowInput);
       return NextResponse.json({ reply: aiResponse.reply });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}
