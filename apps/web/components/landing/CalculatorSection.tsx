'use client';

import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

/** Defaults (немає окремого delivery-ендпоінта в API — було зі старого сайту). */
const DEFAULT_SETTINGS: Record<string, number> = {
  shipping_usa: 1500,
  auction_fee_percent: 10,
  export_docs: 0,
  port_unload: 0,
  port_to_city: 0,
  border_crossing: 0,
  excise_petrol_per_liter: 50,
  excise_diesel_per_liter: 75,
  excise_electric: 1,
  customs_duty_percent: 10,
  vat_percent: 20,
  brokerage_fee: 300,
  customs_delivery: 0,
  commission: 0,
};

export function CalculatorSection() {
  const [carPrice, setCarPrice] = useState(0);
  const [engineType, setEngineType] = useState<string>('petrol');
  const [engineVolume, setEngineVolume] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('passenger');
  const [year, setYear] = useState<string>('');
  const [auction, setAuction] = useState<string>('');
  const [usaShipping, setUsaShipping] = useState<string>('');

  const calculation = useMemo(() => {
    const s = DEFAULT_SETTINGS;
    const shippingUsa = s.shipping_usa ?? 1500;
    const auctionFee = carPrice * (s.auction_fee_percent ?? 10) / 100;
    const exportDocs = s.export_docs ?? 0;
    const portUnload = s.port_unload ?? 0;
    const portToCity = s.port_to_city ?? 0;
    const borderCrossing = s.border_crossing ?? 0;

    let exciseTax = 0;
    const vol = parseFloat(engineVolume) || 2.0;
    if (engineType === 'petrol') {
      exciseTax = vol * (s.excise_petrol_per_liter ?? 50);
    } else if (engineType === 'diesel') {
      exciseTax = vol * (s.excise_diesel_per_liter ?? 75);
    } else if (engineType === 'electric') {
      exciseTax = s.excise_electric ?? 1;
    }

    const importDuty = carPrice * (s.customs_duty_percent ?? 10) / 100;
    const subtotal = carPrice + auctionFee + shippingUsa + exportDocs + portUnload + portToCity + borderCrossing + exciseTax + importDuty;
    const vat = subtotal * (s.vat_percent ?? 20) / 100;
    const brokerage = s.brokerage_fee ?? 300;
    const customsDelivery = s.customs_delivery ?? 0;
    const commission = s.commission ?? 0;
    const total = subtotal + vat + brokerage + customsDelivery + commission;

    return {
      shippingUsa: Math.round(shippingUsa),
      auctionFee: Math.round(auctionFee),
      exportDocs: Math.round(exportDocs),
      portUnload: Math.round(portUnload),
      portToCity: Math.round(portToCity),
      borderCrossing: Math.round(borderCrossing),
      exciseTax: Math.round(exciseTax),
      importDuty: Math.round(importDuty),
      vat: Math.round(vat),
      brokerage: Math.round(brokerage),
      customsDelivery: Math.round(customsDelivery),
      commission: Math.round(commission),
      total: Math.round(total),
    };
  }, [carPrice, engineType, engineVolume]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const resultRows = [
    { label: 'Доставка з США:', value: calculation?.shippingUsa ?? 0 },
    { label: 'Аукціонний збір:', value: calculation?.auctionFee ?? 0 },
    { label: 'Документи на експорт авто:', value: calculation?.exportDocs ?? 0 },
    { label: 'Вигрузка з порту Клайпеда:', value: calculation?.portUnload ?? 0 },
    { label: 'Доставка Клайпеда - Львів:', value: calculation?.portToCity ?? 0 },
    { label: 'Проходження кордону і залучення спец. транспорту:', value: calculation?.borderCrossing ?? 0 },
    { label: 'Акциз:', value: calculation?.exciseTax ?? 0 },
    { label: 'Ввізне мито:', value: calculation?.importDuty ?? 0 },
    { label: 'ПДВ:', value: calculation?.vat ?? 0 },
    { label: 'Брокерські послуги:', value: calculation?.brokerage ?? 0 },
    { label: 'Доставка на митницю:', value: calculation?.customsDelivery ?? 0 },
    { label: 'Комісія AV SALON RV:', value: calculation?.commission ?? 0 },
  ];

  return (
    <section id="calculator" className="py-16 bg-white">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Results */}
          <div className="bg-slate-900 border border-slate-700 p-6 lg:p-8">
            <h3 className="text-xl font-extrabold text-center mb-6 uppercase">Результат:</h3>
            <div className="space-y-3">
              {resultRows.map((row) => (
                <div key={row.label} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-300">{row.label}</span>
                  <span className="text-white font-semibold">${row.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-amber-400">
              <div className="flex justify-between text-lg font-extrabold">
                <span>Вартість авто з доставкою:</span>
                <span className="text-amber-400">${(calculation?.total ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Calculator Form */}
          <div className="border-2 border-amber-400 p-6 lg:p-8 bg-slate-900">
            <h3 className="text-xl font-extrabold text-center mb-6 uppercase">Калькулятор доставки:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Тип транспортного засобу:</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                >
                  <option value="passenger">Легковий</option>
                  <option value="suv">Позашляховик</option>
                  <option value="van">Мінівен</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Тип двигуна:</label>
                <select
                  value={engineType}
                  onChange={(e) => setEngineType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                >
                  <option value="petrol">Бензин</option>
                  <option value="diesel">Дизель</option>
                  <option value="electric">Електро</option>
                  <option value="hybrid">Гібрид</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Об&apos;єм двигуна, см³:</label>
                <select
                  value={engineVolume}
                  onChange={(e) => setEngineVolume(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                >
                  <option value="">Об&apos;єм двигуна, см³</option>
                  <option value="1.0">1000</option>
                  <option value="1.2">1200</option>
                  <option value="1.4">1400</option>
                  <option value="1.5">1500</option>
                  <option value="1.6">1600</option>
                  <option value="1.8">1800</option>
                  <option value="2.0">2000</option>
                  <option value="2.2">2200</option>
                  <option value="2.4">2400</option>
                  <option value="2.5">2500</option>
                  <option value="3.0">3000</option>
                  <option value="3.5">3500</option>
                  <option value="4.0">4000</option>
                  <option value="5.0">5000</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Об&apos;єм батареї (квт*год)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Вартість ($):</label>
                <input
                  type="number"
                  value={carPrice || ''}
                  onChange={(e) => setCarPrice(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Рік випуску:</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                >
                  <option value="">Рік випуску:</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Аукціон:</label>
                <select
                  value={auction}
                  onChange={(e) => setAuction(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                >
                  <option value="">Аукціон</option>
                  <option value="copart">Copart</option>
                  <option value="iaai">IAAI</option>
                  <option value="manheim">Manheim</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Доставка по США:</label>
                <select
                  value={usaShipping}
                  onChange={(e) => setUsaShipping(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm"
                >
                  <option value="">Доставка по США</option>
                  <option value="included">Включена</option>
                  <option value="separate">Окремо</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/contact"
          className="mt-0 flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg transition-colors uppercase"
        >
          Хочу детальну пропозицію <ChevronRight className="h-5 w-5" />
        </Link>
    </section>
  );
}
