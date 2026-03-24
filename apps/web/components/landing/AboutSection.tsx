'use client';

import { useState } from 'react';

export function AboutSection() {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="py-16 bg-white">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 uppercase text-black">Про нас</h2>

        {expanded && (
          <p className="text-slate-300 leading-relaxed mb-6">
            Binom Mebli — виробник меблів на замовлення з понад 10-річним досвідом. Ми виготовляємо кухні, шафи-купе, меблі для ванної кімнати та офісу. Кожен проект розробляється індивідуально: враховуємо ваші побажання, особливості приміщення та бюджет. Власне виробництво дозволяє нам контролювати якість на кожному етапі та дотримуватись узгоджених термінів.
          </p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="px-6 py-2.5 border border-gray-700 text-black text-sm font-medium hover:border-gray-500 transition-colors"
        >
          {expanded ? 'Сховати' : 'Детальніше'}
        </button>
      </div>
    </section>
  );
}
