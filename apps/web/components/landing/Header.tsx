'use client';

import {
  ChevronRight,
  MenuIcon,
  Phone,
  X,
} from 'lucide-react';
import {
  Fragment,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

interface MenuItem {
  title: string;
  url: string;
}

const LOGO = {
  url: '/',
  title: 'Binom Mebli',
};

const NAVIGATION: MenuItem[] = [
  { title: 'Портфоліо', url: '/portfolio' },
  { title: 'Про нас', url: '/about' },
  { title: 'Контакти', url: '/contact' },
  { title: 'FAQ', url: '/faq' },
];

const MOBILE_BREAKPOINT = 1024;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  return (
    <Fragment>
      <header className="pointer-events-auto fixed top-0 left-0 right-0 z-[999] flex w-full flex-col items-center bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <NavigationMenu className="h-16 max-w-full w-full">
          <div className="relative z-[999] container grid w-full grid-cols-2 items-center justify-between gap-8 xl:grid-cols-3 px-4">
            {/* Logo */}
            <Link href={LOGO.url} className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-amber-400 tracking-wider uppercase">
                Binom Mebli
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden xl:flex justify-center">
              <NavigationMenuList>
                {NAVIGATION.map((item, index) => {
                  const isActive = pathname === item.url;
                  return (
                    <NavigationMenuItem key={`nav-${index}`} value={`${index}`}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            'h-fit bg-transparent font-medium transition-colors',
                            isActive ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400',
                          )}
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </div>

            {/* Phone + mobile toggle */}
            <div className="justify-self-end flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2">
                <a
                  href="tel:+380000000000"
                  className="flex items-center gap-2 px-4 py-2 border border-amber-400 text-amber-400 hover:bg-amber-400/10 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-bold text-sm">+380 00 000 00 00</span>
                </a>
              </div>
              <div className="xl:hidden">
                <Button
                  className="size-11 text-slate-300 hover:text-amber-400"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <X className="size-5.5" /> : <MenuIcon className="size-5.5" />}
                </Button>
              </div>
            </div>
          </div>
        </NavigationMenu>
      </header>

      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <SheetContent
          aria-describedby={undefined}
          side="top"
          className="inset-0 z-[998] h-dvh w-full bg-slate-950 pt-20 [&>button]:hidden"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="container py-8 px-4">
              <SheetTitle className="sr-only">Меню навігації</SheetTitle>
              <div className="flex flex-col gap-2">
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex h-12 items-center border-b border-slate-800 text-base font-medium transition-colors',
                      pathname === item.url ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400',
                    )}
                  >
                    {item.title}
                  </Link>
                ))}

                <a
                  href="tel:+380000000000"
                  className="mt-4 flex items-center justify-center gap-2 py-3 border border-amber-400 text-amber-400 font-bold"
                >
                  <Phone className="h-4 w-4" />
                  +380 00 000 00 00
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}
