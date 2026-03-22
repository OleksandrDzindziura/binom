import type { Metadata } from 'next';
import FAQClient from './faq-client';
import { faqs } from './faq-data';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Часті запитання',
  description:
    'Відповіді на часті запитання про купівлю автомобіля, кредитування, Trade-In, викуп авто та послуги AV SALON RV.',
  openGraph: {
    title: 'Часті запитання — AV SALON RV',
    description: 'Відповіді на найпоширеніші запитання про послуги автосалону AV SALON RV.',
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
