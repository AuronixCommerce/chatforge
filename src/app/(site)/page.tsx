'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Check,
  Palette,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react';
import ChatbotAnimation from '@/components/chatbot-animation';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: WandSparkles,
    eyebrow: 'Adaptive intelligence',
    title: 'Train the experience, not a model.',
    copy: 'Shape tone, knowledge, welcome messages, and custom Q&A from a focused workspace built for speed.',
    className: 'md:col-span-2',
    visual: 'from-cyan-400/20 via-primary/5 to-transparent',
  },
  {
    icon: ShieldCheck,
    eyebrow: 'Domain controls',
    title: 'Deploy with confidence.',
    copy: 'Authorize exactly where each assistant can run, with secure API keys and plan-aware limits.',
    className: '',
    visual: 'from-emerald-400/20 via-primary/5 to-transparent',
  },
  {
    icon: Palette,
    eyebrow: 'Brand-native',
    title: 'Feels like your product.',
    copy: 'Match every assistant to your visual identity with flexible color and behavior controls.',
    className: '',
    visual: 'from-violet-400/20 via-accent/5 to-transparent',
  },
  {
    icon: BarChart3,
    eyebrow: 'One control plane',
    title: 'Operate every chatbot from one place.',
    copy: 'Create multiple assistants, monitor message usage, manage keys, preview changes, and install in a few clicks.',
    className: 'md:col-span-2',
    visual: 'from-blue-400/20 via-primary/5 to-transparent',
  },
];

const steps = [
  { number: '01', title: 'Create', copy: 'Name your assistant and generate its private API key.' },
  { number: '02', title: 'Shape', copy: 'Add personality, answers, brand color, and approved domains.' },
  { number: '03', title: 'Launch', copy: 'Copy one clean snippet and bring it live on your website.' },
];

export default function Home() {
  return (
    <div className="page-enter overflow-hidden">
      <section className="relative isolate px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="ambient-float pointer-events-none absolute -left-56 -top-64 -z-10 h-[42rem] w-[42rem] rounded-full bg-primary/15 blur-[125px]" />
        <div className="pointer-events-none absolute -right-56 top-0 -z-10 h-[38rem] w-[38rem] rounded-full bg-accent/15 blur-[125px]" />
        <div className="container mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-xl">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-3 w-3" /></span>
              Customer intelligence, beautifully deployed
            </div>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[.96] tracking-[-.065em] sm:text-6xl lg:text-7xl xl:text-[5.35rem]">
              Turn every visit into a
              <span className="block bg-gradient-to-r from-primary via-cyan-500 to-violet-500 bg-clip-text text-transparent">smart conversation.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Design, train, and launch brand-native AI assistants that answer instantly, guide customers, and scale with your business.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group h-[52px] px-7">
                <Link href="/signup">Build your chatbot <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-[52px] px-7">
                <Link href="/pricing">Explore plans</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
              {['Free to start', 'No credit card', 'Install in minutes'].map(item => <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" />{item}</span>)}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 28, scale: .97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: .75, delay: .1, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
            <div className="glass-surface overflow-hidden rounded-[2rem] p-3 shadow-[0_35px_100px_-28px_rgba(8,15,35,.4)]">
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
                <span className="font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">Live assistant</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online</span>
              </div>
              <div className="min-h-[430px] overflow-hidden rounded-[1.4rem] border border-border/60 bg-background/80 p-1 sm:min-h-[470px]">
                <ChatbotAnimation />
              </div>
            </div>
            <motion.div animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }} className="glass-surface absolute -bottom-7 -left-5 hidden rounded-2xl p-4 sm:block">
              <p className="font-mono text-[8px] uppercase tracking-[.18em] text-muted-foreground">Resolution rate</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">Instant <span className="text-emerald-500">24/7</span></p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-background/45 px-4 py-7 backdrop-blur-xl sm:px-6">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <p className="font-mono text-[9px] uppercase tracking-[.2em] text-muted-foreground">One intelligent layer for every digital experience</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-extrabold text-foreground/35">
            <span>Commerce</span><span>SaaS</span><span>Support</span><span>Education</span><span>Services</span>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-24 sm:px-6 lg:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">Designed to feel effortless</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Serious infrastructure.<br />Remarkably simple.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">ChatForge brings configuration, brand control, testing, installation, and usage management into one cohesive product—without the usual AI-tool clutter.</p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article key={feature.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * .06, duration: .55 }} className={'group relative min-h-[280px] overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/65 p-7 shadow-[0_18px_60px_-38px_rgba(8,15,35,.35)] backdrop-blur-xl ' + feature.className}>
                <div className={'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity duration-500 group-hover:opacity-100 ' + feature.visual} />
                <div className="relative flex h-full flex-col">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/60 bg-background/70 text-primary shadow-sm"><feature.icon className="h-5 w-5" /></span>
                  <div className="mt-auto pt-14">
                    <p className="font-mono text-[9px] uppercase tracking-[.2em] text-primary">{feature.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-extrabold tracking-[-.035em]">{feature.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{feature.copy}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:pb-32">
        <div className="container relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#07101d] px-6 py-16 text-white shadow-[0_35px_100px_rgba(8,15,35,.25)] sm:px-10 lg:px-14 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.2),transparent_30rem),radial-gradient(circle_at_100%_100%,rgba(139,92,246,.25),transparent_34rem)]" />
          <div className="relative grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.24em] text-cyan-300">From zero to live</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Three steps.<br />One polished launch.</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/[.5]">No complex infrastructure. No scattered settings. Everything you need is already connected.</p>
            </div>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <motion.div key={step.number} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[.055] p-5 backdrop-blur-xl transition-colors hover:bg-white/[.09]">
                  <span className="font-mono text-xs text-cyan-300">{step.number}</span>
                  <div><h3 className="text-lg font-extrabold">{step.title}</h3><p className="mt-1.5 text-sm leading-6 text-white/[.45]">{step.copy}</p></div>
                  <ArrowRight className="ml-auto h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:pb-32">
        <div className="container mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-background/70 to-accent/15 p-8 text-center shadow-[0_30px_90px_-45px_hsl(var(--primary)/.45)] sm:p-14">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-xl shadow-primary/20"><Zap className="h-6 w-6" /></span>
          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">Your next customer is already on the page.</h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">Give them an intelligent answer before they leave. Start with a free workspace and launch when you are ready.</p>
          <Button asChild size="lg" className="group mt-8"><Link href="/signup">Start building free <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
        </div>
      </section>
    </div>
  );
}
