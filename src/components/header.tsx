'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Download, LayoutDashboard, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').filter(Boolean);
const navigation = [
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name?: string, email?: string) => {
    if (name?.trim()) {
      const parts = name.split(' ').filter(Boolean);
      return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase();
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/50 bg-background/70 shadow-[0_8px_40px_-24px_rgba(15,23,42,.35)] backdrop-blur-2xl dark:border-white/10">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 sm:px-6">
        <Link href="/" className="group mr-7 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <span className="text-sm font-black tracking-[-.08em]">CF</span>
          </span>
          <span className="font-extrabold tracking-[-.035em]">ChatForge <span className="text-primary">AI</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map(item => <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">{item.label}</Link>)}
          {user && <Link href="/install" className="rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">Install</Link>}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent className="w-[88%] overflow-hidden border-white/10 bg-[#07101d] p-0 text-white">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-[90px]" />
              <div className="relative flex h-full flex-col p-6">
                <SheetHeader className="border-b border-white/10 pb-6 text-left">
                  <SheetTitle className="text-xl font-extrabold text-white">ChatForge <span className="text-cyan-300">AI</span></SheetTitle>
                  <SheetDescription className="font-mono text-[9px] uppercase tracking-[.2em] text-white/35">Intelligence for every conversation</SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2">
                  {[{ label: 'Home', href: '/' }, ...navigation].map((item, index) => (
                    <SheetClose asChild key={item.href}>
                      <Link href={item.href} className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-4 text-lg font-bold text-white/70 transition-all hover:border-white/10 hover:bg-white/[.06] hover:text-white">
                        <span><span className="mr-3 font-mono text-[9px] text-cyan-300/60">0{index + 1}</span>{item.label}</span>
                        <ArrowUpRight className="h-4 w-4 opacity-30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    </SheetClose>
                  ))}
                  {user && <>
                    <SheetClose asChild><Link href="/dashboard" className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-extrabold text-[#07101d]"><LayoutDashboard className="h-4 w-4" /> Open dashboard</Link></SheetClose>
                    <SheetClose asChild><Link href="/install" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] px-4 py-4 text-sm font-bold text-white"><Download className="h-4 w-4" /> Installation</Link></SheetClose>
                  </>}
                </nav>
                {!user ? (
                  <div className="mt-auto grid gap-3 border-t border-white/10 pt-6">
                    <SheetClose asChild><Link href="/login" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-center text-sm font-bold text-white">Sign in</Link></SheetClose>
                    <SheetClose asChild><Link href="/signup" className="rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 px-4 py-3 text-center text-sm font-bold text-white shadow-xl">Start building free</Link></SheetClose>
                  </div>
                ) : (
                  <button type="button" onClick={handleLogout} className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm font-bold text-white/70"><LogOut className="h-4 w-4" /> Log out</button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0">
                  <Avatar className="h-9 w-9 rounded-xl">
                    <AvatarImage src={user.avatar || ''} alt={user.name || user.email} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 font-bold text-primary">{getInitials(user.name, user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="rounded-xl bg-muted/45 p-3 font-normal"><div className="flex flex-col gap-1"><p className="text-sm font-bold">{user.name || 'ChatForge user'}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl py-2.5"><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl py-2.5"><Link href="/install"><Download className="mr-2 h-4 w-4" />Installation</Link></DropdownMenuItem>
                {isAdmin && <DropdownMenuItem asChild className="rounded-xl py-2.5"><Link href="/admin/dashboard"><ShieldCheck className="mr-2 h-4 w-4" />Admin console</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-2.5"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost"><Link href="/login">Sign in</Link></Button>
              <Button asChild><Link href="/signup">Start free</Link></Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
