'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Code2, Copy, Globe2, ShieldCheck, Wand2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { generateScriptsFromTemplate } from '@/lib/templates';
import { listUserChatbots } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const benefits = [
  { icon: Code2, label: 'Framework ready' },
  { icon: ShieldCheck, label: 'Domain controlled' },
  { icon: Globe2, label: 'Works anywhere' },
];

function InstallPageContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [scripts, setScripts] = useState<{ htmlScript: string; reactScript: string; nextjsScript: string } | null>(null);
  const [copiedStates, setCopiedStates] = useState({ html: false, react: false, nextjs: false });

  useEffect(() => {
    async function generateScriptForApiKey() {
      const apiKey = searchParams.get('apiKey');
      if (!apiKey || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { chatbots, error } = await listUserChatbots(user.id);
        if (error) throw new Error(error);
        const targetBot = chatbots?.find(bot => bot.apiKey === apiKey);
        if (!targetBot) throw new Error('Invalid API key or chatbot not found.');
        setScripts(generateScriptsFromTemplate({ apiKey: targetBot.apiKey }));
      } catch (error: any) {
        toast({ title: 'Generation failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }

    if (user) generateScriptForApiKey();
    else setIsLoading(false);
  }, [user, searchParams, toast]);

  const handleCopy = (textToCopy: string, type: 'html' | 'react' | 'nextjs') => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedStates({ html: false, react: false, nextjs: false, [type]: true });
    setTimeout(() => setCopiedStates(previous => ({ ...previous, [type]: false })), 2000);
    toast({ title: 'Code copied to clipboard' });
  };

  return (
    <main className="page-enter relative isolate overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-[-24rem] -z-10 h-[42rem] w-[55rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="eyebrow">Integration studio</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-[-.055em]">Go live with one clean install.</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">Choose your stack, copy the generated snippet, and paste it into your website. Your branding and behavior stay synced from ChatForge.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {benefits.map(item => <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-2 text-xs font-bold shadow-sm"><item.icon className="h-3.5 w-3.5 text-primary" />{item.label}</span>)}
          </div>
        </div>

        <Card className="overflow-hidden shadow-[0_30px_90px_-40px_rgba(8,15,35,.4)]">
          <CardHeader className="border-b border-border/60 bg-background/35">
            <p className="eyebrow">Generated for your bot</p>
            <CardTitle className="flex items-center pt-1 text-2xl font-extrabold"><Wand2 className="mr-2 h-5 w-5 text-primary" /> Your embed code</CardTitle>
            <CardDescription>Your API key is already included. Copy, paste, and go live.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center"><span className="ios-spinner h-8 w-8 text-primary" /></div>
            ) : scripts ? (
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid h-12 w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                </TabsList>
                <TabsContent value="html"><CodeBlock code={scripts.htmlScript} onCopy={() => handleCopy(scripts.htmlScript, 'html')} isCopied={copiedStates.html} /></TabsContent>
                <TabsContent value="react"><CodeBlock code={scripts.reactScript} onCopy={() => handleCopy(scripts.reactScript, 'react')} isCopied={copiedStates.react} /></TabsContent>
                <TabsContent value="nextjs"><CodeBlock code={scripts.nextjsScript} onCopy={() => handleCopy(scripts.nextjsScript, 'nextjs')} isCopied={copiedStates.nextjs} /></TabsContent>
              </Tabs>
            ) : (
              <div className="py-12 text-center text-muted-foreground"><p>Select a chatbot from your dashboard to generate its installation script.</p></div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 text-sm backdrop-blur-xl sm:flex-row sm:items-center">
          <div><p className="font-bold">Want to test before publishing?</p><p className="mt-1 text-xs text-muted-foreground">Open your assistant in the live preview environment.</p></div>
          <Button asChild variant="outline"><Link href="/test">Open preview <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </main>
  );
}

function CodeBlock({ code, onCopy, isCopied }: { code: string; onCopy: () => void; isCopied: boolean }) {
  return (
    <div className="relative mt-4">
      <pre className="max-h-[420px] overflow-x-auto rounded-2xl border border-white/10 bg-[#07101d] p-6 font-mono text-xs leading-6 text-cyan-50 shadow-inner"><code>{code}</code></pre>
      <Button variant="ghost" size="icon" className="absolute right-3 top-3 h-9 w-9 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={onCopy} aria-label="Copy installation code">
        {isCopied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function InstallPage() {
  return <Suspense fallback={<div className="flex h-screen items-center justify-center"><span className="ios-spinner h-8 w-8 text-primary" /></div>}><InstallPageContent /></Suspense>;
}
