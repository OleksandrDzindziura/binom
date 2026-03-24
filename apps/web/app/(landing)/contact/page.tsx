import type { Metadata } from 'next';
import { CallbackForm } from '@/components/landing/CallbackForm';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Контакти',
  description:
    'Контакти Binom Mebli — адреси майданчиків у Львові, телефони, email, графік роботи. Залиште заявку онлайн.',
  openGraph: {
    title: 'Контакти — Binom Mebli',
    description: 'Зв\'яжіться з Binom Mebli — адреси, телефони, email та форма зворотного зв\'язку.',
  },
};

export default function ContactPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[{ name: 'Контакти', path: '/contact' }]} />
    <div className="py-12">
      <div>
        <h1 className="text-3xl font-bold mb-8 text-center text-black">Контакти</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Адреса</h3>
              <a
                href="https://maps.app.goo.gl/3zCD5x6bm1UJHLMH9"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-amber-400 transition-colors"
              >
                с. Пісочна, вул. 1 Листопада 
              </a>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Телефон</h3>
              <a
                href="tel:+380961786832"
                className="block text-gray-300 hover:text-amber-400 transition-colors"
              >
                +380 96 178 68 32
              </a>
              <a
                href="tel:+380933991621"
                className="block text-gray-300 hover:text-amber-400 transition-colors mt-1"
              >
                +380 93 399 16 21
              </a>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Email</h3>
              <a
                href="mailto:binommebli@gmail.com"
                className="block text-gray-300 hover:text-amber-400 transition-colors"
              >
                binommebli@gmail.com
              </a>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Графік роботи</h3>
              <p className="text-gray-300">Щодня: 9:00 – 18:00</p>
            </div>
          </div>

          <div id="callback" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center text-black">Залиште заявку</h2>
            <CallbackForm />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-black">Ми на карті</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden">
              <h3 className="font-semibold mb-2 text-center">с. Пісочна, вул. 1 Листопада</h3>
              <iframe
                src="https://maps.google.com/maps?q=Пісочна+1+Листопада&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Binom Mebli — с. Пісочна, вул. 1 Листопада"
              />
            </div>
        
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
