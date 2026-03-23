import type { Metadata } from 'next';
import { CallbackForm } from '@/components/landing/CallbackForm';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { MapPin, Users, BadgeDollarSign, Handshake, ArrowLeftRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Про нас — Binom Mebli',
  description:
    'Binom Mebli — виробник меблів на замовлення у Рівному. Виготовляємо кухні, шафи-купе, меблі для ванної кімнати та офісу з контролем якості на кожному етапі.',
  openGraph: {
    title: 'Про нас — Binom Mebli',
    description: 'Дізнайтесь більше про Binom Mebli — нашу історію, підхід та процес виготовлення меблів у Рівненській області.',
  },
};

const values = [
  {
    icon: BadgeDollarSign,
    title: 'Реалізація меблів',
    desc: 'Проєктуємо та виготовляємо меблі під ваш простір. Беремо на себе всі етапи — від замірів і ескізів до монтажу.',
  },
  {
    icon: Handshake,
    title: 'Чесні умови',
    desc: 'Без прихованих доплат і сюрпризів. Узгоджуємо деталі до старту робіт та тримаємо план виконання.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Індивідуальний підхід',
    desc: 'Кожен проект розробляється під ваші побажання, особливості приміщення та бюджет.',
  },
  {
    icon: Users,
    title: 'Команда професіоналів',
    desc: 'Ми супроводжуємо клієнта від першої консультації до встановлення та гарантійного обслуговування.',
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
          <p className="text-lg text-black leading-relaxed">
            Binom Mebli — виробник меблів на замовлення з понад 10-річним досвідом. Виготовляємо кухні, шафи-купе, меблі для ванної кімнати та офісу з контролем якості на кожному етапі.
          </p>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Наша історія</h2>
              <p className="text-black leading-relaxed mb-4">
                Ми починали з простої ідеї: створити команду, яка допомагає клієнтам отримати меблі своєї мрії без зайвих ризиків і переплат.
                Ми знаємо, як важливо обрати правильне рішення для простору — від планування до матеріалів та фурнітури.
              </p>
              <p className="text-black leading-relaxed">
                Тому ми побудували процес виготовлення меблів так, щоб ви отримували професійний супровід на кожному етапі: заміри, проєкт, узгодження, виробництво та монтаж.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Чому обирають нас</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                За роки роботи ми заслужили довіру клієнтів, які отримують меблі під ключ і з реальним відчуттям контролю на кожному етапі.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Ми працюємо зручними етапами: заміри, проєктування, узгодження деталей, виготовлення та доставка/монтаж. Кожен клієнт отримує індивідуальний підхід і консультацію.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-black mb-8 uppercase">Наші цінності</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item) => (
              <div
                key={item.title}
                className="p-6 bg-gray-800 border border-slate-800 rounded-lg"
              >
                <div className="w-12 h-12 bg-amber-400 rounded flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-slate-900" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Stats */}
        <div className="bg-gray-800 border border-slate-800 rounded-lg p-8 md:p-12 mb-16">
          <div className="flex items-center gap-3 justify-center mb-8">
            <Users className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold uppercase">Binom Mebli у цифрах</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">10+</p>
              <p className="text-sm text-gray-300 mt-1">років досвіду</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">100+</p>
              <p className="text-sm text-gray-300 mt-1">готових проєктів</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">2</p>
              <p className="text-sm text-gray-300 mt-1">локації в регіоні</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">500+</p>
              <p className="text-sm text-gray-300 mt-1">задоволених клієнтів</p>
            </div>
          </div>
        </div>


        {/* CTA */}
        <section className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl text-black font-bold mb-4">
            Маєте питання? {' '}<span className="text-amber-400">Залиште заявку!</span>
          </h2>
          <CallbackForm />
        </section>
      </div>
    </div>
    </>
  );
}
