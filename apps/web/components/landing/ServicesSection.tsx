import Link from 'next/link';
import { Ruler, Hammer, Truck, PenTool, Wrench, MessageCircle } from 'lucide-react';

const services = [
  {
    icon: PenTool,
    title: 'Дизайн-проект',
    desc: 'Розробимо індивідуальний проект з урахуванням ваших побажань, розмірів та стилю інтер\'єру.',
  },
  {
    icon: Ruler,
    title: 'Обмір та розрахунок',
    desc: 'Виїдемо на об\'єкт, зробимо точні заміри та підготуємо детальний кошторис.',
  },
  {
    icon: Hammer,
    title: 'Виготовлення',
    desc: 'Виготовляємо меблі на власному виробництві з якісних матеріалів та фурнітури.',
  },
  {
    icon: Truck,
    title: 'Доставка',
    desc: 'Доставляємо готові вироби у зручний для вас час без пошкоджень та затримок.',
  },
  {
    icon: Wrench,
    title: 'Монтаж',
    desc: 'Професійне встановлення меблів з перевіркою всіх механізмів та регулюванням.',
  },
  {
    icon: MessageCircle,
    title: 'Гарантійне обслуговування',
    desc: 'Надаємо гарантію та оперативно усуваємо будь-які питання після монтажу.',
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-foreground font-extrabold text-center mb-4 uppercase">
          Як ми працюємо
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Повний цикл від першої консультації до встановлення та гарантійного обслуговування.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl p-6 border border-border bg-gray-800 hover:border-amber-400/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center mb-5">
                <service.icon className="h-6 w-6 text-slate-900" />
              </div>
              <h3 className="text-lg font-bold mb-3 uppercase  transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/contact"
            className="inline-block px-10 py-4 border-2 border-border text-foreground font-bold text-lg hover:bg-accent transition-colors uppercase"
          >
            Замовити консультацію
          </Link>
        </div>
      </div>
    </section>
  );
}
