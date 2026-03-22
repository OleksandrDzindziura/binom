import type { Metadata } from 'next';
import { CallbackForm } from '@/components/landing/CallbackForm';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { MapPin, Users, BadgeDollarSign, Handshake, Car, ArrowLeftRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Про нас',
  description:
    'AV SALON RV — команда професіоналів з понад 5-річним досвідом продажу автомобілів у Рівному. Два автосалони, 250+ авто, повний сервіс.',
  openGraph: {
    title: 'Про нас — AV SALON RV',
    description: 'Дізнайтесь більше про автосалон AV SALON RV — наша історія, цінності та майданчики у Рівненській області.',
  },
};

const values = [
  {
    icon: BadgeDollarSign,
    title: 'Реалізація авто',
    desc: 'Допоможемо продати ваше авто швидко та за найкращою ціною. Беремо на себе всі етапи — від оцінки до оформлення угоди.',
  },
  {
    icon: Handshake,
    title: 'Чесні умови',
    desc: 'Жодних прихованих платежів чи несподіванок. Ви завжди знаєте повну вартість та отримуєте всі документи.',
  },
  {
    icon: Car,
    title: 'Широкий вибір',
    desc: 'На наших майданчиках завжди представлено понад 250 автомобілів різних марок, моделей та цінових категорій.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Комплексний сервіс',
    desc: 'Викуп, обмін (Trade-In), кредитування, лізинг та реалізація — повний спектр послуг в одному місці.',
  },
];

const locations = [
  {
    name: 'м. Рівне, Млинівська 29 Б',
    desc: 'Основний майданчик у місті Рівне з великим вибором автомобілів.',
  },
  {
    name: 'Обарів, вул. Миколаївська, 1',
    desc: 'Другий майданчик у Рівненській області з додатковим асортиментом.',
  },
];

export default function AboutPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[{ name: 'Про нас', path: '/about' }]} />
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase">Про нас</h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            AV SALON RV — це команда професіоналів, яка вже понад 5 років допомагає жителям Рівненщини знаходити надійні автомобілі за найкращими цінами. Ми розпочали свою діяльність з невеликого майданчика, а сьогодні маємо два повноцінних автосалони у Рівненській області.
          </p>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Наша історія</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Все розпочалося з простої ідеї — створити місце, де кожен зможе придбати якісний автомобіль без зайвих ризиків та переплат. Ми знаємо, як складно буває обрати авто: питання технічного стану, юридичної чистоти, реального пробігу.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Саме тому ми створили зручну систему підбору та реалізації автомобілів, де кожен клієнт отримує професійний супровід на кожному етапі угоди.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Чому обирають нас</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                За роки роботи ми заслужили довіру сотень клієнтів. Наш підхід — це не просто продаж автомобілів, а повний супровід від підбору до оформлення документів.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Ми пропонуємо зручні умови придбання: кредитування, лізинг, обмін вашого авто (Trade-In) та послуги з реалізації. Кожен клієнт отримує індивідуальний підхід та професійну консультацію.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 uppercase">Наші цінності</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item) => (
              <div
                key={item.title}
                className="p-6 bg-slate-900 border border-slate-800 rounded-lg"
              >
                <div className="w-12 h-12 bg-amber-400 rounded flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-slate-900" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 mb-16">
          <div className="flex items-center gap-3 justify-center mb-8">
            <Users className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold uppercase">AV SALON RV у цифрах</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">5+</p>
              <p className="text-sm text-slate-400 mt-1">років на ринку</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">250+</p>
              <p className="text-sm text-slate-400 mt-1">авто в наявності</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">2</p>
              <p className="text-sm text-slate-400 mt-1">локації</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">500+</p>
              <p className="text-sm text-slate-400 mt-1">задоволених клієнтів</p>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 uppercase">Наші майданчики</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {locations.map((loc) => (
              <div
                key={loc.name}
                className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-amber-400 rounded flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{loc.name}</h3>
                  <p className="text-sm text-slate-400">{loc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <section className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Маєте питання? <span className="text-amber-400">Залиште заявку!</span>
          </h2>
          <CallbackForm />
        </section>
      </div>
    </div>
    </>
  );
}
