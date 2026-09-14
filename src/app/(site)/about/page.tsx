'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Compass, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const principles = [
  { icon: Compass, number: '01', title: 'Clarity over complexity', copy: 'Powerful software should make the next action obvious. Every surface is designed to keep teams moving.' },
  { icon: ShieldCheck, number: '02', title: 'Trust by design', copy: 'Domain controls, protected keys, and clear usage boundaries are part of the product—not an afterthought.' },
  { icon: Layers3, number: '03', title: 'Built to compound', copy: 'Create once, learn from real conversations, and keep improving the customer experience as you scale.' },
];

export default function AboutPage() {
  return (
    <main className="page-enter overflow-hidden">
      <section className="relative isolate px-4 py-20 sm:px-6 lg:py-28">
        <div className="pointer-events-none absolute left-[-15rem] top-[-18rem] -z-10 h-[42rem] w-[42rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="container mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_.7fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <p className="eyebrow">About ChatForge</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-7xl">AI should make business feel <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">more human.</span></h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .6 }} className="border-l border-border/70 pl-6">
            <p className="text-base leading-8 text-muted-foreground">We built ChatForge to close the gap between powerful AI infrastructure and the simple, personal conversations customers actually want.</p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:pb-32">
        <div className="container mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#07101d] p-7 text-white shadow-[0_35px_100px_rgba(8,15,35,.25)] sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative min-h-[390px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[.055] p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.24),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(139,92,246,.25),transparent_45%)]" />
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }} className="relative mx-auto mt-10 grid h-36 w-36 place-items-center rounded-[2.5rem] border border-white/15 bg-white/10 shadow-[0_30px_70px_rgba(0,0,0,.25)] backdrop-blur-xl"><Bot className="h-14 w-14 text-cyan-300" /></motion.div>
              <div className="relative mt-12 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="font-mono text-[8px] uppercase tracking-[.18em] text-white/35">Purpose</p><p className="mt-2 text-sm font-bold">Useful conversations</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="font-mono text-[8px] uppercase tracking-[.18em] text-white/35">Standard</p><p className="mt-2 text-sm font-bold">Beautiful simplicity</p></div>
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.24em] text-cyan-300">Our mission</p>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Give every business an intelligent front door.</h2>
              <p className="mt-6 text-sm leading-7 text-white/[.52]">A website should do more than display information. It should listen, understand intent, and help people move forward. ChatForge makes that possible without a dedicated AI team or a complicated stack.</p>
              <p className="mt-4 text-sm leading-7 text-white/[.52]">From the first API key to the thousandth customer conversation, the product stays focused: fast setup, deep control, and an experience worthy of your brand.</p>
              <Button asChild className="mt-8 bg-white text-[#07101d] hover:bg-cyan-50"><Link href="/signup">Build with us <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:pb-32">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="eyebrow">What guides us</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Principles that show up in the product.</h2></div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {principles.map((item, index) => (
              <motion.article key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="group rounded-[1.75rem] border border-border/60 bg-card/65 p-7 shadow-[0_20px_65px_-42px_rgba(8,15,35,.4)] backdrop-blur-xl">
                <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></span><span className="font-mono text-[10px] text-muted-foreground/50">{item.number}</span></div>
                <h3 className="mt-12 text-2xl font-extrabold tracking-[-.035em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.copy}</p>
              </motion.article>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[.05] p-5 text-sm text-muted-foreground"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span><span><strong className="text-foreground">Built for momentum.</strong> Start free, learn from real usage, and expand when the value is proven.</span></div>
        </div>
      </section>
    </main>
  );
}
