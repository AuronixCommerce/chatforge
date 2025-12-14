// src/app/api/chat/config/[apiKey]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore';


// This new route provides the public configuration for a given chatbot.
export async function GET(req: NextRequest, { params }: { params: { apiKey: string }}) {
    const apiKey = params.apiKey;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required.' }, { status: 401 });
    }
  
    try {
      const db = getDb();
      const chatbotQuery = query(collection(db, 'chatbots'), where('apiKey', '==', apiKey), limit(1));
      const chatbotSnap = await getDocs(chatbotQuery);
  
      if (chatbotSnap.empty) {
          return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 });
      }

      const chatbot = chatbotSnap.docs[0].data();

      // Check if the owner is banned or get their plan
      const userRef = doc(db, 'users', chatbot.userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().isBanned) {
        return NextResponse.json({ error: 'This chatbot has been disabled.' }, { status: 403 });
      }
      
      const user = userSnap.data();

      // Return public-safe configuration from the chatbot document
      const response = NextResponse.json({
        name: chatbot.name || 'Chat with us',
        welcome: chatbot.welcomeMessage || 'Hello! How can I help you today?',
        color: chatbot.color || '#007BFF',
        plan: user?.plan || 'Free', // Send the plan name
      });
      
      // Allow requests from any origin to fetch the config
      response.headers.set('Access-Control-Allow-Origin', '*');
      
      return response;

    } catch (error) {
      console.error('Chat Config API Error:', error);
      return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function OPTIONS() {
  const response = new NextResponse(null, {
    status: 204,
  });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

    
