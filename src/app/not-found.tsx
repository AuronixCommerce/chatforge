import Link from 'next/link';
import { ArrowLeft, Bot, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="page-enter relative isolate grid min-h-[75dvh] place-items-center overflow-hidden px-4 py-20 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="w-full max-w-2xl">
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border/70 bg-background/65 px-4 py-2 font-mono text-[9px] uppercase tracking-[.2em] text-muted-foreground shadow-sm backdrop-blur-xl"><Compass className="h-3.5 w-3.5 text-primary" /> Lost in conversation</div>
        <div className="relative mx-auto mt-8 grid h-28 w-28 place-items-center rounded-[2rem] border border-white/60 bg-card/70 shadow-[0_24px_70px_-25px_rgba(8,15,35,.35)] backdrop-blur-2xl"><Bot className="h-10 w-10 text-primary" /><span className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#07101d] text-xs font-extrabold text-white shadow-xl">404</span></div>
        <h1 className="mt-9 text-5xl font-extrabold tracking-[-.06em] sm:text-6xl">This page left the chat.</h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground">The link may have moved or never existed. Your workspace and conversations are still exactly where you left them.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back home</Link></Button><Button asChild size="lg" variant="outline"><Link href="/contact">Contact support</Link></Button></div>
      </div>
    </main>
  );
}
