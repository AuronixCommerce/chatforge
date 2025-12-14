// src/app/api/chat/[[...chat]]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, limit } from 'firebase/firestore';
import { generateChatResponse, generateChatResponseStream } from '@/ai/flows/generate-chat-response';


export async function POST(req: NextRequest) {
    const { message, apiKey, history, stream } = await req.json();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required.' }, { status: 401 });
    }
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const db = getDb();
    
    const chatbotQuery = query(collection(db, 'chatbots'), where('apiKey', '==', apiKey), limit(1));
    const chatbotSnap = await getDocs(chatbotQuery);

    if (chatbotSnap.empty) {
        return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 });
    }
    const chatbotDoc = chatbotSnap.docs[0];
    const chatbot = chatbotDoc.data();


    // --- Domain Authorization Check ---
    const origin = req.headers.get('origin');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const allowedDomains = chatbot.authorizedDomains || [];
    
    const isTestPage = origin === appUrl;

    if (origin && !isTestPage && allowedDomains.length > 0) {
        const originHost = new URL(origin).hostname;
        const isAuthorized = allowedDomains.some((domain: string) => {
            const domainPattern = new RegExp(`^(.+\\.)?${domain.replace('.', '\\.')}$`);
            return domainPattern.test(originHost);
        });

        if (!isAuthorized) {
             return NextResponse.json({ reply: `This chatbot is not authorized to be used on this domain. Please contact the site administrator.` });
        }
    }
    
    const userRef = doc(db, 'users', chatbot.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return NextResponse.json({ error: 'Chatbot owner not found.' }, { status: 500 });
    }

    let user = userSnap.data();

    if (user.isBanned) {
      return NextResponse.json({ error: 'This API key has been disabled.' }, { status: 403 });
    }

    // --- Message Limit and Cycle Reset Logic ---
    const now = new Date();
    const cycleStartDate = user.planCycleStartDate.toDate();
    const cycleEndDate = new Date(cycleStartDate.getTime());
    cycleEndDate.setDate(cycleEndDate.getDate() + 30);

    let messagesSent = user.messagesSent;

    if (now > cycleEndDate) {
        // More than 30 days have passed, reset the cycle.
        await updateDoc(userRef, { messagesSent: 1, planCycleStartDate: Timestamp.now() });
        messagesSent = 1;
    } else {
        if (user.messagesSent >= user.messageLimit) {
            return NextResponse.json({ error: 'Monthly message limit reached. Please upgrade your plan.' }, { status: 429 });
        }
        const newCount = (user.messagesSent || 0) + 1;
        await updateDoc(userRef, { messagesSent: newCount });
        messagesSent = newCount;
    }

    const flowInput = {
        message,
        instructions: chatbot.instructions || 'You are a helpful assistant.',
        qa: chatbot.qa || [],
        history: history || [],
    };
    
    if (stream) {
      const { stream: aiStream, response } = await generateChatResponseStream(flowInput);
      response.catch(err => console.error("Error in streaming response:", err)); // Don't block the response
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
