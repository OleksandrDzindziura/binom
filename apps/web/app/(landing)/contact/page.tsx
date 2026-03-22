import type { Metadata } from 'next';
import { CallbackForm } from '@/components/landing/CallbackForm';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Контакти',
  description:
    'Контакти автосалону AV SALON RV — адреси майданчиків у Рівному та Обарові, телефони, email, графік роботи. Залиште заявку онлайн.',
  openGraph: {
    title: 'Контакти — AV SALON RV',
    description: 'Зв\'яжіться з AV SALON RV — адреси, телефони, email та форма зворотного зв\'язку.',
  },
};

export default function ContactPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[{ name: 'Контакти', path: '/contact' }]} />
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Контакти</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Адреса</h3>
              <a
                href="https://maps.app.goo.gl/EzapDvQhfcJWMgLh7"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-400 hover:text-amber-400 transition-colors"
              >
                м. Рівне, Млинівська 29 Б
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Обарів+Миколаївська+1"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-400 hover:text-amber-400 transition-colors mt-1"
              >
                Обарів, вул. Миколаївська, 1
              </a>
            </div>
            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Телефон</h3>
              <a
                href="tel:+380973994720"
                className="block text-slate-400 hover:text-amber-400 transition-colors"
              >
                +380 97 399 47 20
              </a>
              <a
                href="tel:+380988854481"
                className="block text-slate-400 hover:text-amber-400 transition-colors mt-1"
              >
                +380 98 885 44 81
              </a>
            </div>
            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Email</h3>
              <a
                href="mailto:vikupa000@ukr.net"
                className="block text-slate-400 hover:text-amber-400 transition-colors"
              >
                vikupa000@ukr.net
              </a>
            </div>
            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Графік роботи</h3>
              <p className="text-slate-400">Щодня: 9:00 – 18:00</p>
            </div>
          </div>

          <div id="callback" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4">Залиште заявку</h2>
            <CallbackForm />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Ми на карті</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden">
              <h3 className="font-semibold mb-2 text-center">вул. Млинівська, 29б, м. Рівне</h3>
              <iframe
                src="https://maps.google.com/maps?q=AV+SALON+RV+Млинівська+29Б+Рівне&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AV SALON RV — вул. Млинівська, 29б, Рівне"
              />
            </div>
            <div className="rounded-lg overflow-hidden">
              <h3 className="font-semibold mb-2 text-center">Обарів, вул. Миколаївська, 1</h3>
              <iframe
                src="https://maps.google.com/maps?q=Обарів+Миколаївська+1&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AV SALON RV — Обарів, Миколаївська 1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
