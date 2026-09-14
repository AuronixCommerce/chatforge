'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Gem, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    copy: 'A focused way to build and validate your first AI assistant.',
    features: ['1 chatbot', '1,000 messages monthly', 'Custom personality and Q&A', 'Website embed', 'Community support'],
    cta: 'Start free',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$15.99',
    period: 'per month',
    copy: 'For teams turning website conversations into real customer outcomes.',
    features: ['10 chatbots', '50,000 messages monthly', 'Advanced brand controls', 'Analytics dashboard', 'Priority email and chat support'],
    cta: 'Choose Pro',
    href: '/contact',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'built around you',
    copy: 'Flexible capacity, support, and integrations for high-volume operations.',
    features: ['Unlimited chatbots', 'Custom message capacity', 'Custom integrations', 'Priority onboarding', '24/7 support'],
    cta: 'Talk to sales',
    href: '/contact',
  },
];

export default function PricingPage() {
  return (
    <main className="page-enter relative isolate overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-[-28rem] -z-10 h-[48rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[125px]" />
      <section className="container mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-xl"><Sparkles className="h-3.5 w-3.5 text-primary" /> Simple pricing. Serious capability.</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-7xl">Start lean.<br /><span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Scale intelligently.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Every plan includes the complete ChatForge experience. Upgrade when your audience and conversations grow.</p>
        </div>

        <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .08, duration: .55 }}
              className={'relative flex min-h-[570px] flex-col overflow-hidden rounded-[2rem] border p-7 shadow-[0_24px_80px_-42px_rgba(8,15,35,.4)] sm:p-8 ' + (plan.featured ? 'border-white/15 bg-[#07101d] text-white lg:-translate-y-4 lg:shadow-[0_35px_100px_rgba(8,15,35,.3)]' : 'border-border/70 bg-card/70 backdrop-blur-2xl')}
            >
              {plan.featured && <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,.2),transparent_28rem),radial-gradient(circle_at_100%_100%,rgba(139,92,246,.22),transparent_30rem)]" />}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className={'grid h-11 w-11 place-items-center rounded-2xl ' + (plan.featured ? 'bg-white/10 text-cyan-300' : 'bg-primary/10 text-primary')}>{index === 0 ? <Zap className="h-5 w-5" /> : index === 1 ? <Gem className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</span>
                  {plan.featured && <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[.2em] text-cyan-200">Most popular</span>}
                </div>
                <p className={'mt-8 font-mono text-[10px] uppercase tracking-[.22em] ' + (plan.featured ? 'text-cyan-300' : 'text-primary')}>{plan.name}</p>
                <div className="mt-3 flex items-end gap-2"><h2 className="text-5xl font-extrabold tracking-[-.06em]">{plan.price}</h2>{plan.price !== 'Custom' && <span className={'pb-1.5 text-sm ' + (plan.featured ? 'text-white/40' : 'text-muted-foreground')}>/mo</span>}</div>
                <p className={'mt-2 text-xs font-semibold ' + (plan.featured ? 'text-white/35' : 'text-muted-foreground')}>{plan.period}</p>
                <p className={'mt-6 min-h-16 text-sm leading-6 ' + (plan.featured ? 'text-white/[.52]' : 'text-muted-foreground')}>{plan.copy}</p>
              </div>
              <div className={'relative my-7 h-px ' + (plan.featured ? 'bg-white/10' : 'bg-border/70')} />
              <ul className="relative grid gap-4">
                {plan.features.map(feature => <li key={feature} className={'flex items-start gap-3 text-sm font-semibold ' + (plan.featured ? 'text-white/70' : 'text-foreground/75')}><span className={'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ' + (plan.featured ? 'bg-cyan-300/10 text-cyan-300' : 'bg-emerald-500/10 text-emerald-600')}><Check className="h-3 w-3" /></span>{feature}</li>)}
              </ul>
              <Button asChild size="lg" variant={plan.featured ? 'default' : 'outline'} className={'relative mt-auto w-full group ' + (plan.featured ? 'bg-white text-[#07101d] hover:bg-cyan-50' : '')}><Link href={plan.href}>{plan.cta}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
            </motion.article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-[1.75rem] border border-border/60 bg-background/55 p-6 backdrop-blur-xl sm:flex-row sm:px-8">
          <div><p className="text-sm font-extrabold">Need a plan designed around your traffic?</p><p className="mt-1 text-sm text-muted-foreground">We can tailor message capacity, onboarding, and integration support.</p></div>
          <Button asChild variant="outline"><Link href="/contact">Contact our team <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </section>
    </main>
  );
}
