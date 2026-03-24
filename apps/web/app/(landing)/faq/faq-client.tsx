'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { faqs } from './faq-data';

export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-center uppercase text-black">Часті запитання</h1>
        <p className="text-slate-400 text-center mb-10">
          Відповіді на найпоширеніші питання про виготовлення та сервіс меблів
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i
                  ? null
                  : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <h3 className="font-semibold">{faq.question}</h3>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-amber-400 shrink-0 transition-transform',
                    openIndex === i && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
