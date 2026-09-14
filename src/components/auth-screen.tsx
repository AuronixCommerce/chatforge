'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Bot, Check, Code2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, User, Zap } from 'lucide-react';
import { customLogin, customSignUp } from '@/app/actions';
import { useAuth } from '@/components/providers/auth-provider';
import OtpDialog from '@/components/otp-dialog';
import GoogleSignInButton from '@/components/google-signin-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid work email.'),
  password: z.string().min(1, 'Enter your password.'),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().trim().email('Enter a valid work email.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  terms: z.boolean().refine(Boolean, 'Accept the terms to continue.'),
});

type Mode = 'login' | 'signup';

const highlights = [
  { icon: Zap, title: 'Live in minutes', text: 'Create, tune and install without touching backend code.' },
  { icon: ShieldCheck, title: 'Built for production', text: 'Domain controls, quotas and secure server-side AI requests.' },
  { icon: Code2, title: 'One-line install', text: 'A polished widget that works across modern websites.' },
];

function FieldShell({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      {children}
    </div>
  );
}

export default function AuthScreen({ initialMode = 'signup' }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpUserId, setOtpUserId] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const signupForm = useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema), defaultValues: { name: '', email: '', password: '', terms: false } });
  const password = signupForm.watch('password');
  const passwordScore = useMemo(() => [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length, [password]);

  const finishLogin = (token: string) => {
    login(token);
    router.push('/dashboard');
    router.refresh();
  };

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setBusy(true);
    try {
      const result = await customLogin(values);
      if (result.error) {
        const error = result.error as any;
        const message = error._errors?.[0] || error.email?.[0] || error.password?.[0] || 'Check your details and try again.';
        loginForm.setError('root', { message });
      } else if (result.requiresOtp && result.userId) {
        setOtpUserId(result.userId);
        setShowOtp(true);
      } else if (result.token) {
        toast({ title: 'Welcome back', description: 'Your workspace is ready.' });
        finishLogin(result.token);
      }
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setBusy(true);
    try {
      const result = await customSignUp(values);
      if (result.error) {
        const error = result.error as any;
        if (error.email?.[0]) signupForm.setError('email', { message: error.email[0] });
        else signupForm.setError('root', { message: error._errors?.[0] || 'We could not create your workspace.' });
      } else if (result.userId) {
        setOtpUserId(result.userId);
        setShowOtp(true);
        toast({ title: 'Check your inbox', description: 'We sent your verification code.' });
      }
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'h-12 rounded-xl border-border/70 bg-background/60 pl-11 pr-12 text-[15px] shadow-sm backdrop-blur-xl transition-all duration-300 placeholder:text-muted-foreground/60 hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10';

  return (
    <main className="page-enter relative isolate min-h-[calc(100dvh-3.5rem)] overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute left-[-12rem] top-[-14rem] h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-16rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-[120px]" />

      <div className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/50 bg-white/55 shadow-[0_35px_100px_-30px_rgba(15,23,42,.35)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.045] lg:grid-cols-[1.04fr_.96fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#08111f] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(34,211,238,.24),transparent_34%),radial-gradient(circle_at_90%_95%,rgba(139,92,246,.22),transparent_38%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 font-extrabold tracking-tight">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 shadow-lg shadow-cyan-400/20"><Bot className="h-5 w-5" /></span>
              <span>ChatForge</span>
            </Link>
            <div className="mt-20 max-w-lg">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs text-white/75"><Sparkles className="h-3.5 w-3.5 text-cyan-300" /> AI support infrastructure</span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-.045em] xl:text-5xl">Your smartest teammate,<br /><span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">on every page.</span></h1>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-300">Build intelligent website assistants, understand every conversation, and scale support from one beautiful workspace.</p>
            </div>
          </div>
          <div className="relative z-10 grid gap-3">
            {highlights.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 + index * .09 }} className="flex gap-4 rounded-2xl border border-white/[.08] bg-white/[.055] p-4 backdrop-blur-xl">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.08] text-cyan-300"><item.icon className="h-4 w-4" /></span>
                <div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.text}</p></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10 lg:p-12 xl:p-16">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 inline-flex items-center gap-2 font-extrabold lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white"><Bot className="h-4 w-4" /></span>ChatForge</Link>
            <div className="mb-8 flex rounded-2xl border border-border/70 bg-muted/55 p-1.5 shadow-inner">
              {(['signup', 'login'] as Mode[]).map(item => (
                <button key={item} type="button" onClick={() => setMode(item)} className={cn('relative flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors', mode === item ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {mode === item && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-xl border border-white/60 bg-background shadow-sm dark:border-white/10" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="relative">{item === 'signup' ? 'Create account' : 'Sign in'}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22 }}>
                <div className="mb-7"><p className="eyebrow">{mode === 'signup' ? 'Start building' : 'Welcome back'}</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.035em]">{mode === 'signup' ? 'Create your workspace' : 'Sign in to ChatForge'}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === 'signup' ? 'Launch your first AI chatbot in minutes.' : 'Continue managing your chatbots and conversations.'}</p></div>

                {mode === 'signup' ? (
                  <Form {...signupForm}><form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <FormField control={signupForm.control} name="name" render={({ field }) => <FormItem><FormLabel>Full name</FormLabel><FormControl><FieldShell icon={User}><Input autoComplete="name" placeholder="Abdullah Chohan" className={inputClass} {...field} /></FieldShell></FormControl><FormMessage /></FormItem>} />
                    <FormField control={signupForm.control} name="email" render={({ field }) => <FormItem><FormLabel>Work email</FormLabel><FormControl><FieldShell icon={Mail}><Input autoComplete="email" type="email" placeholder="you@company.com" className={inputClass} {...field} /></FieldShell></FormControl><FormMessage /></FormItem>} />
                    <FormField control={signupForm.control} name="password" render={({ field }) => <FormItem><FormLabel>Password</FormLabel><FormControl><FieldShell icon={LockKeyhole}><Input autoComplete="new-password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" className={inputClass} {...field} /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></FieldShell></FormControl><div className="flex gap-1.5 pt-1">{[1,2,3,4].map(n => <span key={n} className={cn('h-1 flex-1 rounded-full transition-colors', passwordScore >= n ? (passwordScore < 3 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-muted')} />)}</div><FormMessage /></FormItem>} />
                    <FormField control={signupForm.control} name="terms" render={({ field }) => <FormItem className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/35 p-3.5"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" /></FormControl><div className="leading-5"><FormLabel className="text-xs font-medium text-muted-foreground">I agree to the <Link href="/terms" className="text-foreground underline-offset-4 hover:underline">Terms</Link> and <Link href="/privacy" className="text-foreground underline-offset-4 hover:underline">Privacy Policy</Link>.</FormLabel><FormMessage /></div></FormItem>} />
                    {signupForm.formState.errors.root && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{signupForm.formState.errors.root.message}</p>}
                    <Button type="submit" size="lg" className="group w-full" disabled={busy}>{busy ? <span className="ios-spinner" /> : <>Create workspace <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}</Button>
                  </form></Form>
                ) : (
                  <Form {...loginForm}><form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><FieldShell icon={Mail}><Input autoComplete="email" type="email" placeholder="you@company.com" className={inputClass} {...field} /></FieldShell></FormControl><FormMessage /></FormItem>} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => <FormItem><div className="flex items-center justify-between"><FormLabel>Password</FormLabel><Link href="/contact" className="text-xs font-semibold text-primary hover:underline">Need help?</Link></div><FormControl><FieldShell icon={LockKeyhole}><Input autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className={inputClass} {...field} /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></FieldShell></FormControl><FormMessage /></FormItem>} />
                    {loginForm.formState.errors.root && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{loginForm.formState.errors.root.message}</p>}
                    <Button type="submit" size="lg" className="group w-full" disabled={busy}>{busy ? <span className="ios-spinner" /> : <>Open dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}</Button>
                  </form></Form>
                )}

                <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">or continue with</span><span className="h-px flex-1 bg-border" /></div>
                <GoogleSignInButton onLoginSuccess={() => router.push('/dashboard')} />
                <p className="mt-7 text-center text-xs text-muted-foreground"><Check className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />No credit card required · Free plan included</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
      {otpUserId && <OtpDialog isOpen={showOtp} onClose={() => setShowOtp(false)} onSuccess={finishLogin} userId={otpUserId} />}
    </main>
  );
}
