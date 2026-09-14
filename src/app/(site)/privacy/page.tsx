import Link from 'next/link';
import { ArrowLeft, Database, Eye, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  { icon: Database, title: 'Information we process', copy: 'We process account details, chatbot configuration, plan and usage information, support requests, and the technical data required to provide and protect the service.' },
  { icon: Eye, title: 'How information is used', copy: 'Information is used to operate accounts, generate chatbot responses, enforce plan limits, provide support, improve reliability, prevent abuse, and communicate important service updates.' },
  { icon: LockKeyhole, title: 'Security and retention', copy: 'We use reasonable safeguards designed to protect stored information. Data is retained only as long as needed for the service, security, legal obligations, and legitimate business records.' },
  { icon: ShieldCheck, title: 'Your choices', copy: 'You can update chatbot information from your dashboard and contact us about account data, access, correction, or deletion requests. Some records may be retained where legally required.' },
];

export default function PrivacyPage() {
  return (
    <main className="page-enter relative isolate overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div className="pointer-events-none absolute -right-48 -top-56 -z-10 h-[42rem] w-[42rem] rounded-full bg-accent/15 blur-[125px]" />
      <div className="container mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="-ml-3 mb-8"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back home</Link></Button>
        <header className="overflow-hidden rounded-[2rem] bg-[#07101d] p-8 text-white shadow-[0_30px_90px_rgba(8,15,35,.24)] sm:p-12">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.22em] text-cyan-300"><ShieldCheck className="h-4 w-4" /> Trust · Privacy</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-.055em] sm:text-6xl">Privacy, made clear.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">A straightforward view of the information ChatForge processes and the principles used to protect it.</p>
          <p className="mt-8 font-mono text-[9px] uppercase tracking-[.16em] text-white/30">Last updated September 14, 2026</p>
        </header>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sections.map((section, index) => <section key={section.title} className="rounded-[1.5rem] border border-border/60 bg-card/65 p-6 backdrop-blur-xl sm:p-8"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><section.icon className="h-5 w-5" /></span><span className="font-mono text-[9px] text-muted-foreground/40">0{index + 1}</span></div><h2 className="mt-8 text-xl font-extrabold tracking-tight">{section.title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{section.copy}</p></section>)}
        </div>
        <section className="mt-8 rounded-[1.5rem] border border-border/60 bg-background/55 p-6 backdrop-blur-xl sm:p-8"><h2 className="text-xl font-extrabold">Questions or requests</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Use the contact page to ask a privacy question or submit a request related to your ChatForge account.</p><Button asChild variant="outline" className="mt-5"><Link href="/contact">Contact ChatForge</Link></Button></section>
      </div>
    </main>
  );
}
