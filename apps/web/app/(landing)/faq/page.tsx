import type { Metadata } from 'next';
import FAQClient from './faq-client';
import { faqs } from './faq-data';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Часті запитання',
  description:
    'Відповіді на часті запитання про виготовлення та сервіс меблів.',
  openGraph: {
    title: 'Часті запитання — Binom Mebli',
    description: 'Відповіді на найпоширеніші запитання про виготовлення та сервіс меблів.',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Часті запитання', path: '/faq' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQClient />
    </>
  );
}
