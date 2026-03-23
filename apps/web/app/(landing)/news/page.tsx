import type { Metadata } from 'next';
import NewsClient from './news-client';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Новини',
  description:
    'Новини Binom Mebli — актуальні пропозиції, нові надходження та корисна інформація про виготовлення та сервіс меблів.',
  openGraph: {
    title: 'Новини — Binom Mebli',
    description: 'Актуальні новини та пропозиції від Binom Mebli у Львові.',
  },
};

export default function NewsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Новини', path: '/news' }]} />
      <NewsClient />
    </>
  );
}
