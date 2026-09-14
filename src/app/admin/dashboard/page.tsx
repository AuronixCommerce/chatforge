// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../actions';
import { useToast } from '@/hooks/use-toast';
import { Activity, ArrowUpRight, BarChart, Mail, Sparkles, UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardData = {
    stats: {
        totalUsers: number;
        newUsers: number;
        totalSubmissions: number;
    },
    recentSubmissions: any[];
    signupChartData: { date: string, signups: number }[];
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getDashboardStats();
        if (result.error) {
          toast({ title: 'Error fetching stats', description: result.error, variant: 'destructive' });
        } else {
          setData(result);
        }
      } catch (e) {
        toast({ title: 'An unexpected error occurred.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground">Could not load dashboard data.</div>;
  }

  const { stats, signupChartData } = data;

  const statCards = [
      { title: "Total Users", value: stats.totalUsers, description: "All registered users", icon: Users, tone: "from-cyan-500/20 to-blue-500/5", iconTone: "bg-cyan-500/10 text-cyan-600" },
      { title: "New Users (7d)", value: '+' + stats.newUsers, description: "Signups in the last week", icon: UserPlus, tone: "from-violet-500/20 to-fuchsia-500/5", iconTone: "bg-violet-500/10 text-violet-600" },
      { title: "Total Submissions", value: stats.totalSubmissions, description: "Plan inquiries received", icon: Mail, tone: "from-emerald-500/20 to-teal-500/5", iconTone: "bg-emerald-500/10 text-emerald-600" },
  ]

  return (
    <div className="admin-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#07101d] p-7 text-white shadow-[0_28px_80px_rgba(8,15,35,.22)] sm:p-9">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,.22),transparent_30rem),radial-gradient(circle_at_90%_110%,rgba(139,92,246,.28),transparent_30rem)]" />
            <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.24em] text-cyan-300"><Sparkles className="h-3.5 w-3.5" /> Executive overview</p>
                    <h1 className="text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Control center</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Monitor growth, customer intent, and platform activity from one operational view.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur-xl">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300"><Activity className="h-4 w-4" /></span>
                    <div><p className="text-xs font-bold">Platform live</p><p className="mt-0.5 font-mono text-[8px] uppercase tracking-[.16em] text-white/35">Realtime data connected</p></div>
                </div>
            </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
            {statCards.map((card, i) => (
                <motion.div
                    key={card.title}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                >
                    <Card className="group relative h-full overflow-hidden">
                        <div className={'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-500 group-hover:opacity-100 ' + card.tone} />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="font-mono text-[9px] font-medium uppercase tracking-[.16em] text-muted-foreground">{card.title}</CardTitle>
                            <span className={'grid h-9 w-9 place-items-center rounded-xl ' + card.iconTone}><card.icon className="h-4 w-4" /></span>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-extrabold tracking-[-.055em]">{card.value}</div>
                            <div className="mt-4 flex items-center justify-between"><p className="text-xs text-muted-foreground">{card.description}</p><ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>

        <div className="grid gap-8">
            <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-background/35 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="eyebrow mb-2">Growth signal</p><CardTitle className="flex items-center gap-2 font-extrabold"><BarChart className="h-5 w-5 text-primary"/>Weekly signups</CardTitle></div>
                    <span className="mt-3 w-fit rounded-full border border-border/60 bg-background/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground sm:mt-0">Last 7 days</span>
                </CardHeader>
                <CardContent className="pt-7">
                    <ResponsiveContainer width="100%" height={350}>
                        <RechartsBarChart data={signupChartData}>
                            <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                                stroke="#888888"
                                fontSize={12}
                            />
                            <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '14px',
                                    boxShadow: '0 18px 50px rgba(8,15,35,.14)',
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="signups" fill="hsl(var(--primary))" name="New users" radius={[10, 10, 2, 2]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

const DashboardSkeleton = () => (
    <div className="space-y-8">
        <div>
            <Skeleton className="h-9 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
         <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-8">
            <Card className="shadow-lg">
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
);
