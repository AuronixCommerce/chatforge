
// src/app/admin/layout.tsx
'use client';

import {
  Home,
  MailQuestion,
  Newspaper,
  PanelLeft,
  Shield,
  Users,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ReactNode, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { checkAdminAuthStatus, verifyAdminAccess } from '../actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


function AdminAccessGate({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const { toast } = useToast();

    // Rate limiting state
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState<number | null>(null);
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

    useEffect(() => {
        const checkAuth = async () => {
            const { isAuthenticated: authStatus } = await checkAdminAuthStatus();
            if (authStatus) {
                setIsAuthenticated(true);
            }
            setIsVerifying(false);
        };
        checkAuth();

        // Load rate limit state from localStorage
        const storedAttempts = localStorage.getItem('admin_attempts');
        const storedLockout = localStorage.getItem('admin_lockout');
        if (storedAttempts) setFailedAttempts(Number(storedAttempts));
        if (storedLockout) {
            const lockoutEnd = Number(storedLockout);
            if (lockoutEnd > Date.now()) {
                setLockoutTime(lockoutEnd);
            } else {
                localStorage.removeItem('admin_lockout');
                localStorage.removeItem('admin_attempts');
            }
        }
    }, []);
    
    // Timer to update lockout display
    useEffect(() => {
        if (lockoutTime) {
            const interval = setInterval(() => {
                if (Date.now() > lockoutTime) {
                    setLockoutTime(null);
                    setFailedAttempts(0);
                    localStorage.removeItem('admin_lockout');
                    localStorage.removeItem('admin_attempts');
                } else {
                    // Force re-render to update timer
                    setLockoutTime(lockoutTime => lockoutTime);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [lockoutTime]);

    const handleVerifyKey = async () => {
        if (lockoutTime && Date.now() < lockoutTime) {
             toast({ title: 'Access Locked', description: `Too many failed attempts. Please try again in ${Math.ceil((lockoutTime - Date.now()) / 60000)} minutes.`, variant: 'destructive' });
             return;
        }

        setIsLoading(true);
        const result = await verifyAdminAccess({ key: inputValue });
        if (result.success) {
            setIsAuthenticated(true);
            setFailedAttempts(0);
            localStorage.removeItem('admin_attempts');
            localStorage.removeItem('admin_lockout');
            toast({ title: 'Access Granted', description: 'Welcome, Admin!', variant: 'success' });
        } else {
            const newAttemptCount = failedAttempts + 1;
            setFailedAttempts(newAttemptCount);
            localStorage.setItem('admin_attempts', String(newAttemptCount));

            if (newAttemptCount >= MAX_ATTEMPTS) {
                const newLockoutTime = Date.now() + LOCKOUT_DURATION;
                setLockoutTime(newLockoutTime);
                localStorage.setItem('admin_lockout', String(newLockoutTime));
                toast({ title: 'Access Locked', description: `Too many failed attempts. Please try again in 5 minutes.`, variant: 'destructive' });
            } else {
                toast({ title: 'Invalid Access Key', description: `${result.error || 'The key you entered is incorrect.'} You have ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`, variant: 'destructive' });
            }
        }
        setIsLoading(false);
    };

    const isLockedOut = useMemo(() => {
        return lockoutTime ? Date.now() < lockoutTime : false;
    }, [lockoutTime]);

    const lockoutMessage = useMemo(() => {
        if (!isLockedOut || !lockoutTime) return null;
        const minutes = Math.floor((lockoutTime - Date.now()) / 60000);
        const seconds = Math.floor(((lockoutTime - Date.now()) % 60000) / 1000);
        return `Try again in ${minutes}m ${seconds}s`;
    }, [isLockedOut, lockoutTime]);


    if (isVerifying) {
        return (
             <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                <span className="ios-spinner h-7 w-7 text-primary" />
                <p className="eyebrow">Verifying secure access</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <Dialog open={true}>
                <DialogContent className="glass-surface rounded-[1.5rem] border-white/50 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Admin Verification Required</DialogTitle>
                        <DialogDescription>
                            {isLockedOut
                                ? `Too many failed attempts. Access is temporarily locked.`
                                : `Please enter the administrator access key to proceed.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder='Enter Access Key'
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyKey()}
                            disabled={isLoading || isLockedOut}
                        />
                         {isLockedOut && <p className="text-sm text-destructive text-center pt-2">{lockoutMessage}</p>}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleVerifyKey} disabled={isLoading || isLockedOut}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return <>{children}</>;
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/submissions', label: 'Submissions', icon: MailQuestion },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/direct-mail', label: 'Direct Mail', icon: Mail },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Newspaper },
  ];

  return (
    <AdminAccessGate>
        <SidebarProvider>
        <Sidebar className="border-r border-white/10 [--sidebar-background:222_47%_7%] [--sidebar-foreground:210_40%_96%] [--sidebar-accent:220_28%_14%] [--sidebar-accent-foreground:0_0%_100%] [--sidebar-border:220_22%_18%]">
            <SidebarHeader className="px-4 pb-3 pt-5">
            <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-tight group-data-[collapsible=icon]:hidden">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_12px_30px_rgba(34,211,238,.24)]"><Shield className="h-4 w-4" /></span><span>ChatForge <span className="block font-mono text-[8px] font-medium uppercase tracking-[.2em] text-sidebar-foreground/40">Control plane</span></span>
            </h2>
            <div className="mt-4 w-full border-t border-sidebar-border group-data-[collapsible=icon]:hidden"></div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-3">
            <SidebarMenu>
                {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)} className="my-0.5 h-11 rounded-xl px-3 font-semibold transition-all duration-300 data-[active=true]:bg-white/10 data-[active=true]:text-white data-[active=true]:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 group-data-[collapsible=icon]:hidden">
                <div className="mb-2 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" /><span className="text-[10px] font-bold text-sidebar-foreground/80">Systems operational</span></div>
                <span className="font-mono text-[8px] uppercase tracking-[.14em] text-sidebar-foreground/35">ChatForge Admin v2</span>
            </div>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset className="relative isolate min-h-dvh overflow-hidden bg-background/80">
            <div className="pointer-events-none absolute -right-40 -top-52 -z-10 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-48 left-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[120px]" />
            <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/60 bg-background/75 px-4 backdrop-blur-2xl md:hidden">
            <SidebarTrigger size="icon" variant="outline">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </SidebarTrigger>
            <div><p className="text-sm font-extrabold">ChatForge Admin</p><p className="font-mono text-[8px] uppercase tracking-[.16em] text-muted-foreground">Control plane</p></div>
            </header>
            <main className="page-enter relative px-4 sm:px-7 xl:px-10">{children}</main>
        </SidebarInset>
        </SidebarProvider>
    </AdminAccessGate>
  );
}
