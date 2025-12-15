
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import ChatbotAnimation from '@/components/chatbot-animation';
import HowItWorksAnimation from '@/components/how-it-works-animation';
import AnimatedFeatures from '@/components/animated-features';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import HomePageGame from '@/components/home-page-game';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <HomePageGame>
      {({ isGameActive, startGame, isGameOver }) => (
        <div className="flex flex-col items-center justify-center bg-background">
          <section className="relative w-full overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20 py-20 md:py-32">
            <div className="absolute inset-0 z-0">
              <div className="absolute right-0 top-0 -mr-48 -mt-48 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-48 -ml-48 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl"></div>
            </div>
            <div className="container relative z-10 px-4 md:px-6">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col justify-center space-y-6">
                  <div className="space-y-4">
                    <h1 
                      className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl outline-none"
                      contentEditable={isGameActive}
                      suppressContentEditableWarning={true}
                    >
                      Build and Deploy Your Own Chatbot in Minutes
                    </h1>
                    <p 
                      className="max-w-[600px] text-muted-foreground md:text-xl outline-none"
                      contentEditable={isGameActive}
                      suppressContentEditableWarning={true}
                    >
                      ChatForge AI provides everything you need to integrate a powerful AI chatbot into your website. Get your unique API key instantly and customize your bot.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 min-[400px]:flex-row">
                    <Button 
                      onClick={() => {
                        if (isGameActive || !isGameOver) {
                          startGame();
                        } else {
                          router.push('/auth');
                        }
                      }} 
                      size="lg" 
                      className="group"
                    >
                      {isGameOver ? 'Sign Up Now' : 'Get Started Free'} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="#features">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                    <ChatbotAnimation />
                </div>
              </div>
            </div>
          </section>

          <AnimatedFeatures />

          <HowItWorksAnimation />

          <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
              <div className="space-y-3">
                <h2 
                  className="text-3xl font-bold tracking-tighter md:text-4xl/tight outline-none"
                  contentEditable={isGameActive}
                  suppressContentEditableWarning={true}
                >
                  Simple, Transparent Pricing
                </h2>
                <p 
                  className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed outline-none"
                  contentEditable={isGameActive}
                  suppressContentEditableWarning={true}
                >
                  Choose a plan that works for you. Start for free and scale as you grow.
                </p>
              </div>
              <div className="mx-auto mt-10 grid max-w-sm grid-cols-1 gap-8 lg:max-w-5xl lg:grid-cols-3">
                <Card className="flex flex-col justify-between rounded-lg border shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-2xl outline-none">Free</CardTitle>
                        <p contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-muted-foreground outline-none">Perfect for getting started.</p>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="space-y-1">
                            <span contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-4xl font-bold outline-none">$0</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <ul className="grid gap-2 text-muted-foreground text-left">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">1 Chatbot</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">1,000 Messages/Month</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">Community Support</span></li>
                        </ul>
                    </CardContent>
                    <div className="p-6">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">Get Started</Link>
                        </Button>
                    </div>
                </Card>
                <Card className="flex flex-col justify-between rounded-lg border-2 border-primary shadow-lg shadow-primary/20">
                    <CardHeader className="text-center">
                        <CardTitle contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-2xl outline-none">Pro Plan</CardTitle>
                        <p contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-muted-foreground outline-none">For professionals and businesses.</p>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="space-y-1">
                            <span contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-4xl font-bold outline-none">$15.99</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <ul className="grid gap-2 text-muted-foreground text-left">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">10 Chatbots</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">50,000 Messages/Month</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">Email & Chat Support</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">Analytics Dashboard</span></li>
                        </ul>
                    </CardContent>
                     <div className="p-6">
                        <Button asChild className="w-full" variant="default">
                            <Link href="/contact">Get Started with Pro</Link>
                        </Button>
                    </div>
                </Card>
                 <Card className="flex flex-col justify-between rounded-lg border shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-2xl outline-none">Enterprise</CardTitle>
                        <p contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-muted-foreground outline-none">For large-scale applications.</p>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="space-y-1">
                            <span contentEditable={isGameActive} suppressContentEditableWarning={true} className="text-4xl font-bold outline-none">Custom</span>
                        </div>
                        <ul className="grid gap-2 text-muted-foreground text-left">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">Unlimited Chatbots</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">Custom Message Quotas</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">24/7 Priority Support</span></li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span contentEditable={isGameActive} suppressContentEditableWarning={true} className="outline-none">Custom Integrations</span></li>
                        </ul>
                    </CardContent>
                     <div className="p-6">
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/contact">Contact Sales</Link>
                        </Button>
                    </div>
                </Card>
              </div>
            </div>
          </section>

           <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
            <div className="container text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to build your AI Chatbot?</h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
                    Sign up today and get your API key in seconds. No credit card required.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg" className="group">
                      <Link href="/auth">
                        Sign Up Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                </div>
            </div>
          </section>
        </div>
      )}
    </HomePageGame>
  );
}
