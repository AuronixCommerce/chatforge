// src/app/dashboard/layout.tsx
'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only perform check after loading is complete
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <span className="ios-spinner h-7 w-7 text-primary" />
        <p className="eyebrow">Opening workspace</p>
      </div>
    );
  }

  return <>{children}</>;
}
