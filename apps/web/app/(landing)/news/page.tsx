import type { Metadata } from 'next';
import NewsClient from './news-client';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Новини',
  description:
    'Новини автосалону AV SALON RV — актуальні пропозиції, нові надходження та корисна інформація про автомобілі.',
  openGraph: {
    title: 'Новини — AV SALON RV',
    description: 'Актуальні новини та пропозиції від автосалону AV SALON RV у Рівному.',
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
