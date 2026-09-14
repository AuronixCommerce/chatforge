
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Code, Rocket } from 'lucide-react';

const features = [
  {
    icon: Key,
    title: "Instant API Key",
    description: "Sign up and immediately receive your unique API key to get started. No waiting, no lengthy approval process."
  },
  {
    icon: Code,
    title: "Customized Guides",
    description: "Our platform provides personalized integration snippets for HTML, React, & Next.js tailored to your chatbot settings."
  },
  {
    icon: Rocket,
    title: "Simple and Scalable",
    description: "A simple API endpoint and clear documentation ensure that you can get your chatbot up and running quickly."
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function AnimatedFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} id="features" className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden z-30">
        <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium">
                    Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Effortless Integration, Powerful Results</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From instant API key generation to customized integration guides, we make adding a chatbot to your site a breeze.
                </p>
            </motion.div>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-8 pt-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {features.map((feature, i) => (
                <motion.div
                    key={feature.title}
                    custom={i}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={cardVariants}
                >
                    <Card className="h-full relative overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-primary/20">
                    <div className="absolute -top-1 -right-1 h-16 w-16 bg-primary/10 blur-3xl"></div>
                    <CardHeader className="flex flex-col items-center text-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4 ring-1 ring-primary/20">
                            <feature.icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        {feature.description}
                    </CardContent>
                    </Card>
                </motion.div>
            ))}
            </div>
        </div>
    </section>
  );
}
