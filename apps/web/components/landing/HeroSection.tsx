import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen flex min-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-sm text-white">
      {/* Background image */}
      <Image
        src="/hero.webp"
        alt="Binom Mebli — меблі на замовлення"
        fill
        priority
        className="pointer-events-none absolute inset-0 object-cover"
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className=" container relative z-10 flex flex-1 flex-col items-start justify-center px-8 pt-16 md:px-16 lg:px-24">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter uppercase sm:text-6xl md:text-7xl lg:text-8xl">
          Меблі{' '}
          <span className="text-amber-400">на замовлення</span>
        </h1>
        <p className="mt-5 max-w-md text-base text-white/60 sm:text-lg md:max-w-lg">
          Виготовляємо кухні, шафи та меблі під індивідуальні розміри. Від ескізу до монтажу — під ключ.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/portfolio"
            className="px-8 py-4 rounded-xl bg-amber-400 text-black hover:bg-amber-500 font-bold text-lg transition-colors text-center"
          >
            Наші роботи
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 rounded-xl glass-container text-white hover:bg-gray-100 font-bold text-lg transition-colors text-center"
          >
            Замовити консультацію
          </Link>
        </div>
      </div>

      {/* Bottom feature cards */}
      <div className="relative container z-10 grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-4 md:gap-5 md:p-6">
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
    <div className="rounded-xl glass-container p-4 sm:p-5">
      <p className="text-2xl font-bold text-amber-400 sm:text-3xl">{title}</p>
      <p className="mt-1 text-xs text-white/60 sm:text-sm">{subtitle}</p>
    </div>
  );
}
