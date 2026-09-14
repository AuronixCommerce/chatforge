// src/app/test/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, Bot, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatbotEmbed = ({ apiKey }: { apiKey: string }) => {
  if (typeof window === 'undefined') return null;

  const appUrl = window.location.origin;
  const scriptContent = `
    (function() {
        // Clean up previous instances
        const oldTrigger = document.getElementById('chatforge-trigger');
        if (oldTrigger) oldTrigger.remove();
        const oldContainer = document.getElementById('chatforge-iframe-container');
        if (oldContainer) oldContainer.remove();
        const oldStyle = document.getElementById('chatforge-style');
        if(oldStyle) oldStyle.remove();

        const API_KEY = '${apiKey}';
        const APP_URL = '${appUrl}';
        
        const style = document.createElement('style');
        style.id = 'chatforge-style';
        style.innerHTML = \`
            #chatforge-trigger, #chatforge-iframe-container { transition: all .45s cubic-bezier(.22,1,.36,1); font-family: Manrope, Inter, ui-sans-serif, system-ui, sans-serif; }
            #chatforge-trigger { position: fixed; bottom: 24px; right: 24px; width: 64px; height: 64px; border-radius: 22px; border: 1px solid rgba(255,255,255,.45); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 18px 45px rgba(8,15,35,.25), inset 0 1px 0 rgba(255,255,255,.3); z-index: 9999998; transform: translateY(0) scale(1); }
            #chatforge-trigger::before { content: ''; position: absolute; inset: -7px; border: 1px solid currentColor; border-radius: 27px; opacity: .12; }
            #chatforge-trigger:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 24px 55px rgba(8,15,35,.3), inset 0 1px 0 rgba(255,255,255,.35); }
            #chatforge-trigger svg { width: 28px; height: 28px; position: absolute; transition: opacity 0.2s, transform 0.2s; }
            #chatforge-trigger .icon-close { opacity: 0; transform: rotate(-90deg); }
            #chatforge-iframe-container { position: fixed; bottom: 104px; right: 24px; width: min(calc(100vw - 32px), 410px); height: min(78vh, 720px); box-shadow: 0 35px 100px rgba(8,15,35,.28), 0 8px 28px rgba(8,15,35,.14); border-radius: 28px; overflow: hidden; z-index: 9999999; transform-origin: bottom right; opacity: 0; transform: translateY(18px) scale(.94); pointer-events: none; border: 1px solid rgba(255,255,255,.7); background: #fff; }
            #chatforge-iframe-container.open { opacity: 1; transform: scale(1); pointer-events: all; }
            #chatforge-iframe { width: 100%; height: 100%; border: none; opacity: 0; transition: opacity 0.3s ease-in-out; }
            #chatforge-iframe.loaded { opacity: 1; }
            #chatforge-trigger.open .icon-open { opacity: 0; transform: rotate(90deg); }
            #chatforge-trigger.open .icon-close { opacity: 1; transform: rotate(0deg); }
            .chatforge-loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px; transition: opacity 0.3s ease-in-out; }
            @media (max-width: 520px) { #chatforge-trigger { right: 16px; bottom: 16px; } #chatforge-iframe-container { right: 16px; bottom: 94px; width: calc(100vw - 32px); height: min(76vh, 680px); border-radius: 24px; } }
        \`;
        document.head.appendChild(style);

        const trigger = document.createElement('button');
        trigger.id = 'chatforge-trigger';
        trigger.setAttribute('aria-label', 'Open chat');
        trigger.innerHTML = \`<svg class="icon-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><svg class="icon-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>\`;
        
        const container = document.createElement('div');
        container.id = 'chatforge-iframe-container';
        
        const loader = document.createElement('div');
        loader.className = 'chatforge-loader';
        loader.textContent = 'Loading Support Bot...';
        container.appendChild(loader);
        
        document.body.appendChild(trigger);
        document.body.appendChild(container);
        
        let botName = 'Support Bot';
        fetch(\`\${APP_URL}/api/chat/config/\${API_KEY}\`).then(res => res.json()).then(config => { if (config.color) { trigger.style.backgroundColor = config.color; } if(config.name) { botName = config.name; loader.textContent = \`Loading \${botName}...\`; } });
        
        let isOpen = false, iframeLoaded = false;
        function createIframe() { if (iframeLoaded) return; iframeLoaded = true; const iframe = document.createElement('iframe'); iframe.id = 'chatforge-iframe'; iframe.src = \`\${APP_URL}/gen/ai/cfai/\${API_KEY}\`; iframe.setAttribute('allow', 'clipboard-write'); iframe.onload = () => { iframe.classList.add('loaded'); loader.style.opacity = '0'; }; container.appendChild(iframe); }
        function toggleChat() { isOpen = !isOpen; trigger.classList.toggle('open'); if (isOpen) createIframe(); container.classList.toggle('open'); }
        trigger.addEventListener('click', toggleChat);
    })();
  `;
  return <Script id="chatforge-test-embed" dangerouslySetInnerHTML={{ __html: scriptContent }} />;
};


function TestPageContent() {
  const searchParams = useSearchParams();
  const [apiKey, setApiKey] = useState('');
  const [loadedApiKey, setLoadedApiKey] = useState<string | null>(null);

  useEffect(() => {
    const keyFromQuery = searchParams.get('apiKey');
    if (keyFromQuery) {
        setApiKey(keyFromQuery);
        setLoadedApiKey(keyFromQuery);
    }
  }, [searchParams]);

  const handleLoad = () => {
    if (apiKey.trim()) {
      setLoadedApiKey(apiKey.trim());
    }
  };

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#07101d] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,.18),transparent_28rem),radial-gradient(circle_at_88%_12%,rgba(139,92,246,.2),transparent_30rem)]" />
      <div className="premium-grid pointer-events-none absolute inset-0 -z-10 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_12px_35px_rgba(34,211,238,.25)]"><Bot className="h-5 w-5" /></span><div><p className="text-sm font-extrabold tracking-tight">ChatForge</p><p className="font-mono text-[9px] uppercase tracking-[.22em] text-white/45">Preview environment</p></div></div>
        <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-xs text-white/65 backdrop-blur-xl sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Isolated test session</span>
      </header>

      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-12 py-14 lg:grid-cols-[1.05fr_.75fr] lg:py-10">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="max-w-2xl">
          <p className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.28em] text-cyan-300"><Sparkles className="h-3.5 w-3.5" /> Live experience lab</p>
          <h1 className="text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">See your assistant<br /><span className="bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">in the wild.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/[.58] sm:text-lg">Load a chatbot and test the exact floating experience your customers will see—complete with your color, greeting, memory, and domain rules.</p>
          <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
            {['Real widget behavior', 'Live API responses', 'Responsive preview'].map((item, index) => <motion.div key={item} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 + index * .08 }} className="rounded-2xl border border-white/10 bg-white/[.05] p-4 text-xs font-bold text-white/70 backdrop-blur-xl"><CheckCircle2 className="mb-3 h-4 w-4 text-cyan-300" />{item}</motion.div>)}
          </div>
        </motion.section>

        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65, delay: .08 }}>
          <Card className="border-white/15 bg-white/[.08] text-white shadow-[0_35px_100px_rgba(0,0,0,.3)] backdrop-blur-2xl">
            <CardHeader className="border-b border-white/10">
              <div className="mb-5 flex items-center justify-between"><span className="rounded-full bg-cyan-300/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.2em] text-cyan-200">01 · Connect</span><ArrowUpRight className="h-5 w-5 text-white/35" /></div>
              <CardTitle className="text-2xl font-extrabold tracking-tight text-white">Launch your preview</CardTitle>
              <CardDescription className="leading-6 text-white/[.48]">Paste the API key from your dashboard. If you arrived from a chatbot configuration, it is already filled in.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="api-key-input" className="text-xs font-bold text-white/70">ChatForge API key</Label>
                <Input id="api-key-input" type="text" placeholder="cfai_..." value={apiKey} onChange={(event) => setApiKey(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleLoad()} className="h-12 border-white/10 bg-black/20 font-mono text-white placeholder:text-white/25 focus-visible:border-cyan-300/50" />
                <Button onClick={handleLoad} disabled={!apiKey.trim()} className="h-12 w-full bg-white text-[#07101d] shadow-xl hover:bg-cyan-50">{loadedApiKey ? 'Reload preview' : 'Load chatbot'} <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
                <span className={'mt-1 h-2 w-2 shrink-0 rounded-full ' + (loadedApiKey ? 'bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.8)]' : 'bg-white/25')} />
                <div><p className="text-xs font-bold">{loadedApiKey ? 'Preview is ready' : 'Waiting for a chatbot'}</p><p className="mt-1 text-xs leading-5 text-white/40">{loadedApiKey ? 'Use the launcher in the bottom-right corner to start chatting.' : 'Your floating launcher will appear after a valid key is loaded.'}</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {loadedApiKey && <ChatbotEmbed key={loadedApiKey} apiKey={loadedApiKey} />}
    </main>
  );
}


export default function TestPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
                <span className="ios-spinner h-8 w-8 text-primary" />
            </div>
        }>
            <TestPageContent />
        </Suspense>
    );
}