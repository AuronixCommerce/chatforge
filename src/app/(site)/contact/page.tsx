'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Clock3, Loader2, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { createSubmission } from '../../actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  company: z.string().optional(),
  plan: z.enum(['Pro', 'Enterprise'], { required_error: 'Please select a plan.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', company: '', message: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createSubmission(values);
      if (result.error) {
        toast({ title: 'Submission failed', description: 'We could not send your request. Please try again.', variant: 'destructive' });
      } else {
        toast({ title: 'Request sent', description: "Thanks for your interest. We'll get back to you shortly." });
        form.reset();
      }
    } catch {
      toast({ title: 'Submission failed', description: 'We could not send your request. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-enter relative isolate overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
      <div className="pointer-events-none absolute -left-56 -top-64 -z-10 h-[42rem] w-[42rem] rounded-full bg-primary/15 blur-[125px]" />
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[.72fr_1fr] lg:gap-16">
          <section className="lg:sticky lg:top-28 lg:h-fit">
            <p className="eyebrow">Talk to our team</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[.98] tracking-[-.065em] sm:text-6xl">Let’s build your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">next conversation.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">Tell us where you are today and what you want your AI experience to achieve. We will help you map the right plan and launch path.</p>

            <div className="mt-10 grid gap-3">
              <div className="flex gap-4 rounded-2xl border border-border/60 bg-background/55 p-4 backdrop-blur-xl"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Clock3 className="h-4 w-4" /></span><div><p className="text-sm font-extrabold">Fast, human response</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Expect a thoughtful reply from our team—not an automated sales sequence.</p></div></div>
              <div className="flex gap-4 rounded-2xl border border-border/60 bg-background/55 p-4 backdrop-blur-xl"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><ShieldCheck className="h-4 w-4" /></span><div><p className="text-sm font-extrabold">Your details stay private</p><p className="mt-1 text-xs leading-5 text-muted-foreground">We only use your information to understand and respond to your request.</p></div></div>
            </div>

            <div className="mt-7 flex items-center gap-3 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-primary" /><span>Prefer email? Use the form and we will reply directly.</span></div>
          </section>

          <Card className="overflow-hidden shadow-[0_30px_90px_-38px_rgba(8,15,35,.38)]">
            <CardHeader className="border-b border-border/60 bg-background/35 p-7 sm:p-9">
              <div className="mb-4 flex items-center justify-between"><span className="rounded-full bg-primary/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.18em] text-primary">Sales inquiry</span><Sparkles className="h-5 w-5 text-primary/50" /></div>
              <CardTitle className="text-3xl font-extrabold tracking-[-.04em]">Tell us about your goals</CardTitle>
              <CardDescription className="mt-2 leading-6">A few details help us make the first conversation useful.</CardDescription>
            </CardHeader>
            <CardContent className="p-7 sm:p-9">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
                  <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Full name</FormLabel><FormControl><Input autoComplete="name" placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Work email</FormLabel><FormControl><Input autoComplete="email" type="email" placeholder="you@company.com" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="company" render={({ field }) => <FormItem><FormLabel>Company <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Input autoComplete="organization" placeholder="Company name" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="plan" render={({ field }) => <FormItem><FormLabel>Plan of interest</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Pro">Pro plan</SelectItem><SelectItem value="Enterprise">Enterprise</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="message" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>What are you building?</FormLabel><FormControl><Textarea placeholder="Tell us about your website, traffic, use case, and what success looks like." {...field} className="min-h-[160px]" /></FormControl><FormMessage /></FormItem>} />
                  <div className="sm:col-span-2">
                    <Button type="submit" size="lg" className="group w-full" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending request</> : <>Send inquiry <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                    </Button>
                    <p className="mt-3 text-center text-[10px] leading-5 text-muted-foreground">By submitting, you agree that ChatForge may contact you about this request.</p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
