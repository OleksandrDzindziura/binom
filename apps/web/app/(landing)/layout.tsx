import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-white">
      <Header />
      <main className="flex-1 min-h-[calc(100vh-4rem)]">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
