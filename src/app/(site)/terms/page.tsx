import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  ['Using ChatForge', 'You may use ChatForge to create and operate AI assistants for lawful websites and services. You are responsible for the content, instructions, domains, and integrations connected to your account.'],
  ['Accounts and security', 'Keep your login details and API keys confidential. Tell us promptly if you believe your account or a key has been compromised. You are responsible for activity performed through your workspace.'],
  ['Plans and usage', 'Plan limits apply to chatbots, messages, and support levels. Paid-plan inquiries and custom arrangements become effective only when confirmed by ChatForge in writing.'],
  ['Acceptable use', 'Do not use the service to break the law, harm others, distribute malware, interfere with the platform, attempt unauthorized access, or misrepresent automated output as guaranteed professional advice.'],
  ['AI responses', 'AI-generated responses may be incomplete or incorrect. You should review important outputs and configure your assistant with appropriate instructions, approved knowledge, and human escalation paths.'],
  ['Availability and changes', 'We work to keep ChatForge reliable, but uninterrupted availability is not guaranteed. We may improve, replace, or discontinue features while taking reasonable steps to protect active customers.'],
  ['Termination', 'You may stop using ChatForge at any time. We may restrict access when these terms are violated, the service is abused, or continued access creates security or legal risk.'],
  ['Contact', 'Questions about these terms can be sent through the ChatForge contact page.'],
];

export default function TermsPage() {
  return (
    <main className="page-enter relative isolate overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-[-28rem] -z-10 h-[44rem] w-[58rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[125px]" />
      <div className="container mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="-ml-3 mb-8"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back home</Link></Button>
        <header className="overflow-hidden rounded-[2rem] bg-[#07101d] p-8 text-white shadow-[0_30px_90px_rgba(8,15,35,.24)] sm:p-12">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.22em] text-cyan-300"><FileText className="h-4 w-4" /> Legal · Terms</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-.055em] sm:text-6xl">Terms of service</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">The rules that keep ChatForge useful, secure, and fair for everyone building with the platform.</p>
          <p className="mt-8 font-mono text-[9px] uppercase tracking-[.16em] text-white/30">Last updated September 14, 2026</p>
        </header>
        <div className="mt-8 grid gap-4">
          {sections.map(([title, copy], index) => <section key={title} className="rounded-[1.5rem] border border-border/60 bg-card/65 p-6 backdrop-blur-xl sm:p-8"><div className="flex gap-5"><span className="font-mono text-[9px] text-primary">0{index + 1}</span><div><h2 className="text-xl font-extrabold tracking-tight">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p></div></div></section>)}
        </div>
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[.05] p-5 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />Using ChatForge means you agree to these terms and our Privacy Policy.</div>
      </div>
    </main>
  );
}
