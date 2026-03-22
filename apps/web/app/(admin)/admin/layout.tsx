'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/app/(admin)/admin/_components/admin-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  if (isPending) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!session?.user) return null;

  const user = {
    name: session.user.name ?? session.user.email ?? 'User',
    email: session.user.email ?? '',
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex items-center gap-2 border-b bg-background p-3 md:hidden">
          <SidebarTrigger className="h-10 w-10">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <span className="font-semibold text-sm">Binom Mebli</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
