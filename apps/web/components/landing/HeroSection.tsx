import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative mx-4 mt-18 flex min-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-sm text-white md:mx-5 lg:mx-6">
      {/* Background image */}
      <Image
        src="/hero.jpg"
        alt="Binom Mebli — меблі на замовлення"
        fill
        priority
        className="pointer-events-none absolute inset-0 object-cover"
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-8 pt-16 md:px-16 lg:px-24">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tighter uppercase sm:text-6xl md:text-7xl lg:text-8xl">
          Меблі{' '}
          <span className="text-amber-400">на замовлення</span>
        </h1>
        <p className="mt-5 max-w-md text-base text-white/60 sm:text-lg md:max-w-lg">
          Виготовляємо кухні, шафи та меблі під індивідуальні розміри. Від ескізу до монтажу — під ключ.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/portfolio"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg transition-colors text-center"
          >
            Наші роботи
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 font-bold text-lg transition-colors text-center backdrop-blur-sm"
          >
            Замовити консультацію
          </Link>
        </div>
      </div>

      {/* Bottom feature cards */}
      <div className="relative z-10 grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-4 md:gap-5 md:p-6">
        <FeatureCard title="500+" subtitle="виконаних проектів" />
        <FeatureCard title="10+" subtitle="років досвіду" />
        <FeatureCard title="100%" subtitle="гарантія якості" />
        <FeatureCard title="30" subtitle="днів до готового виробу" />
      </div>
    </section>
  );
}

function FeatureCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-sm bg-white/10 p-4 backdrop-blur-md sm:p-5">
      <p className="text-2xl font-bold text-amber-400 sm:text-3xl">{title}</p>
      <p className="mt-1 text-xs text-white/60 sm:text-sm">{subtitle}</p>
    </div>
  );
}
