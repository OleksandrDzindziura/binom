import type { Metadata } from 'next';
import PortfolioClient from './portfolio-client';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Портфоліо робіт',
  description: 'Виконані роботи з ремонту та встановлення кухонь. Перегляньте наші проекти.',
  openGraph: {
    title: 'Портфоліо — Binom Mebli',
    description: 'Виконані роботи з ремонту та встановлення кухонь.',
  },
};

export default function PortfolioPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Портфоліо', path: '/portfolio' }]} />
      <PortfolioClient />
    </>
  );
}
