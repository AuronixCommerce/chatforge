
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, User, CornerDownLeft, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';


// Helper to convert hex to HSL for theme colors
const hexToHsl = (hex: string): [number, number, number] => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

type Message = {
    role: 'bot' | 'user';
    text: string;
};

type GenkitHistory = {
    role: 'user' | 'model';
    content: { text: string }[];
}

type Config = {
    name: string;
    welcome: string;
    color: string;
    plan: 'Free' | 'Pro' | 'Epic' | 'Enterprise';
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [config, setConfig] = useState<Config>({ name: 'Assistant', welcome: 'Hello!', color: '#2563EB', plan: 'Free' });
    const [isLoaded, setIsLoaded] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const params = useParams();
    const apiKey = params.api as string;

    const [baseUrl, setBaseUrl] = useState('');
    useEffect(() => {
        setBaseUrl(window.location.origin);
        // Preload audio
        audioRef.current = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABodHRwOi8vd3d3Lm11c2Vzb2Z0LmNvbS9mcmVlLWF1ZGlvLWNsaXBzL2J1dHRvbi1jbGljay1zb3VuZC1lZmZlY3RzLmh0bWwAAAAAAExhdmc1OC40NS4xMDBVTkJDAAAAPkVkdGl0ZWQgYnkgQnJpYW4gUGV0ZXIgZm9yIGh0dHA6Ly93d3cubXVzZXNvZnQuY29tIC0gaHR0cDovL3d3dy5zdG9ja211c2ljLmNvbQAAAAAA//tAwEAAABA6QZ3AAAAAAAAAAAAAAB94Y5ZgAcoDJwAGQzOAAAAAABhjbWIAFwEAAAFcQioaWk334U+n//sNw+D/8SoAAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX//tA4BM0B4A0AIKwBmgGfoA4AAAAABBuZXQgYWxsIG5ldCBhbGwgbmV0IGFsbCBuZXQgYWxsIG5ldCBhbGwgISBjbGljayBzb3VuZCBtdXNpYyB0byBkb3dubG9hZCBodHRwOi8vd3d3Lm11c2Vzb2Z0LmNvbS8gDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KDQoNCg0KLy8gaHR0cHM6Ly93d3cubXVzZXNvZnQuY29tL3NvdW5kLWVmZmVjdHMvZG93bmxvYWQucGhwP2lkPTY3MiAm//tA4BQCBAIhASQCGZg//u4ADSAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVle.g");
    }, []);

     // Load messages from localStorage on initial render
     useEffect(() => {
        if (!apiKey || !isLoaded) return;
        try {
            const storedMessages = localStorage.getItem(`chatforge_history_${apiKey}`);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                // If no history, set the welcome message
                setMessages([{ role: 'bot', text: config.welcome }]);
            }
        } catch (error) {
            console.error("Could not load messages from localStorage", error);
            localStorage.removeItem(`chatforge_history_${apiKey}`);
            setMessages([{ role: 'bot', text: config.welcome }]);
        }
    }, [apiKey, isLoaded, config.welcome]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (!apiKey || !isLoaded) return;
        // Don't save if it's just the initial welcome message and nothing else
        if (messages.length <= 1 && messages[0]?.text === config.welcome) return;
        try {
            localStorage.setItem(`chatforge_history_${apiKey}`, JSON.stringify(messages));
        } catch (error) {
            console.error("Could not save messages to localStorage", error);
        }
    }, [messages, apiKey, isLoaded, config.welcome]);

    useEffect(() => {
        if (apiKey && baseUrl) {
            fetch(`${baseUrl}/api/chat/config/${apiKey}`)
                .then(res => res.json())
                .then(configData => {
                    if (configData && !configData.error) {
                        const newConfig: Config = {
                            name: configData.name || 'Assistant',
                            welcome: configData.welcome || 'Hello! How can I help you today?',
                            color: configData.color || '#007BFF',
                            plan: configData.plan || 'Free',
                        };
                        setConfig(newConfig);

                        // Apply theme colors
                        const [h, s, l] = hexToHsl(newConfig.color);
                        document.documentElement.style.setProperty('--theme-primary-h', `${h}`);
                        document.documentElement.style.setProperty('--theme-primary-s', `${s}%`);
                        document.documentElement.style.setProperty('--theme-primary-l', `${l}%`);
                    } else {
                        setMessages([{ role: 'bot', text: 'Error: Could not load chatbot configuration.' }]);
                    }
                }).catch(() => {
                     setMessages([{ role: 'bot', text: 'Error: Could not load chatbot configuration.' }]);
                }).finally(() => {
                    setIsLoaded(true);
                });
        }
    // Only run this once on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey, baseUrl]);


    useEffect(() => {
        setTimeout(() => {
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }, [messages, isSending]);

    const handleSendMessage = async () => {
        const msg = inputValue.trim();
        if (msg === '' || isSending || !apiKey || !baseUrl) return;

        const userMessage: Message = { role: 'user', text: msg };
        
        // If the only message is the welcome message, replace it
        const newMessages = messages.length === 1 && messages[0].text === config.welcome 
            ? [userMessage] 
            : [...messages, userMessage];

        setMessages(newMessages);
        setInputValue('');
        setIsSending(true);
        
        const historyForApi: GenkitHistory[] = newMessages
            .slice(0, -1) // Exclude the user message we just added
            .filter(m => m.text !== config.welcome) // Don't send the welcome message in history
            .map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                content: [{ text: m.text }]
            }));

        try {
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, apiKey: apiKey, history: historyForApi }),
            });

            const data = await response.json();

            if (!response.ok && data.error) {
                 const errorMessage: Message = { role: 'bot', text: `Sorry, an error occurred: ${data.error}` };
                 setMessages(prev => [...prev, errorMessage]);
                 return;
            }

            const unauthorizedMessage = 'This chatbot is not authorized to be used on this domain.';
            if (data.reply && data.reply.includes(unauthorizedMessage)) {
                const errorMessage: Message = { role: 'bot', text: data.reply };
                setMessages(prev => [...prev, errorMessage]);
                return;
            }
            
            if (!data.reply) throw new Error('Received an empty response from the server.');
            
            const botMessage: Message = { role: 'bot', text: data.reply };
            setMessages(prev => [...prev, botMessage]);
            audioRef.current?.play().catch(e => console.log("Audio play failed:", e));

        } catch (err: any) {
            const errorMessage: Message = { role: 'bot', text: `Sorry, an error occurred: ${err.message}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    };
    
    const isPremium = config.plan !== 'Free';

    return (
        <div
            className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-[#f4f7fb] text-slate-900"
            style={{
                // @ts-ignore Custom properties are populated from each chatbot's saved brand color.
                '--theme-primary': 'hsl(var(--theme-primary-h), var(--theme-primary-s), var(--theme-primary-l))',
                '--theme-primary-light': 'hsl(var(--theme-primary-h), var(--theme-primary-s), 96%)',
            }}
        >
            <header className="relative z-10 shrink-0 overflow-hidden bg-[#07101d] px-4 pb-4 pt-5 text-white shadow-[0_12px_40px_rgba(8,15,35,.18)]">
                <div className="pointer-events-none absolute inset-0 opacity-80" style={{ background: 'radial-gradient(circle at 8% 0%, var(--theme-primary), transparent 52%)' }} />
                <div className="relative flex items-center gap-3.5">
                    <Avatar className="h-11 w-11 rounded-2xl border border-white/30 bg-white/15 shadow-lg backdrop-blur-xl">
                        <div className="flex h-full w-full items-center justify-center"><Bot className="h-5 w-5" /></div>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-[15px] font-extrabold tracking-tight">{config.name}</h1>
                            {isPremium && <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[.14em] text-white/80" title={config.plan + ' Plan'}><Star className="h-2.5 w-2.5" fill="currentColor" />{config.plan}</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                            <motion.span animate={{ opacity: [.45, 1, .45], scale: [.9, 1.15, .9] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.9)]" />
                            <p className="text-[10px] font-semibold text-white/[.58]">Online · Typically replies instantly</p>
                        </div>
                    </div>
                    <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[.07]"><Star className="h-3.5 w-3.5 text-white/60" /></div>
                </div>
            </header>

            <div ref={chatContainerRef} className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[--theme-primary-light] to-transparent opacity-70" />
                {!isLoaded && messages.length === 0 ? (
                    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3">
                        <span className="ios-spinner h-7 w-7 text-slate-400" />
                        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-slate-400">Preparing conversation</p>
                    </div>
                ) : (
                    <div className="relative">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, y: 14, scale: .98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: .35 }}
                                    className={cn('my-3 flex items-end gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                                >
                                    {msg.role === 'bot' && <Avatar className="h-7 w-7 shrink-0 rounded-xl bg-[--theme-primary] text-white shadow-md"><div className="flex h-full w-full items-center justify-center"><Bot className="h-3.5 w-3.5" /></div></Avatar>}
                                    <div className={cn(
                                        'max-w-[82%] px-4 py-3 text-[13px] leading-5 shadow-sm',
                                        msg.role === 'user'
                                            ? 'rounded-[1.25rem] rounded-br-md bg-[--theme-primary] text-white shadow-[0_10px_28px_rgba(15,23,42,.12)]'
                                            : 'rounded-[1.25rem] rounded-bl-md border border-slate-200/80 bg-white text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,.06)]'
                                    )}><p className="whitespace-pre-wrap">{msg.text}</p></div>
                                    {msg.role === 'user' && <Avatar className="h-7 w-7 shrink-0 rounded-xl bg-slate-200 text-slate-500"><div className="flex h-full w-full items-center justify-center"><User className="h-3.5 w-3.5" /></div></Avatar>}
                                </motion.div>
                            ))}
                            {isSending && (
                                <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="my-3 flex items-end gap-2.5">
                                    <Avatar className="h-7 w-7 shrink-0 rounded-xl bg-[--theme-primary] text-white shadow-md"><div className="flex h-full w-full items-center justify-center"><Bot className="h-3.5 w-3.5" /></div></Avatar>
                                    <div className="rounded-[1.25rem] rounded-bl-md border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_10px_30px_rgba(15,23,42,.06)]">
                                        <motion.div className="flex gap-1" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: .18 } } }}>
                                            {[0, 1, 2].map(dot => <motion.span key={dot} variants={{ visible: { y: [0, -3, 0], opacity: [.35, 1, .35] }, hidden: { y: 0 } }} transition={{ repeat: Infinity, duration: .9, delay: dot * .14 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />)}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t border-slate-200/80 bg-white/90 p-3 pb-2 backdrop-blur-2xl">
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner transition-all focus-within:border-[--theme-primary] focus-within:bg-white focus-within:shadow-[0_0_0_4px_var(--theme-primary-light)]">
                    <input type="text" aria-label="Message" placeholder="Ask me anything..." className="h-10 w-full bg-transparent pl-3 pr-12 text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400" value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()} disabled={isSending} />
                    <button type="button" aria-label="Send message" onClick={handleSendMessage} disabled={isSending || !inputValue.trim()} className="absolute right-1.5 top-1.5 grid h-10 w-10 place-items-center rounded-xl bg-[--theme-primary] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-slate-400">
                    <span className="hidden items-center gap-1 sm:flex"><CornerDownLeft className="h-3 w-3" /> Enter to send</span>
                    <span className="ml-auto">Powered by <a href="https://chatforge.thechohan.space/" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-500 transition-colors hover:text-[--theme-primary]">ChatForge AI</a></span>
                </div>
            </div>
        </div>
    );
}
