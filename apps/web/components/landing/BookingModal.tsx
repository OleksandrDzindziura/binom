'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const BANK_REQUISITES = {
  recipient: 'Захарко Андрій Юрійович',
  iban: 'UA503220010000026202362467162',
  taxId: '3667906692',
};

function formatUAH(kopecks: number): string {
  return new Intl.NumberFormat('uk-UA').format(kopecks / 100) + ' грн';
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Скопійовано!' : label}
    </button>
  );
}

export function BookingModal({
  open,
  onOpenChange,
  carId,
  carName,
  bookingAmount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: number;
  carName: string;
  bookingAmount: number;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const paymentPurpose = `Бронювання авто ${carName} #${carId}`;

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) {
      newErrors.name = "Введіть ваше ім'я (мінімум 2 символи)";
    }
    if (!isValidPhone(phone)) {
      newErrors.phone = 'Введіть коректний номер телефону (наприклад: +380671234567)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createCallback = useMutation(orpc.callbacks.create.mutationOptions({
    onSuccess: () => {
      setSubmitted(true);
      setName('');
      setPhone('');
      setErrors({});
      toast.success('Заявку надіслано! Менеджер зв\'яжеться з вами для підтвердження.');
    },
    onError: () => {
      toast.error('Не вдалося надіслати заявку. Спробуйте ще раз.');
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createCallback.mutate({ name, phone, carId, type: 'booking' });
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSubmitted(false);
      setErrors({});
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Бронювання автомобіля</DialogTitle>
          <DialogDescription className="text-slate-400">
            Переведіть суму бронювання за реквізитами нижче та залиште свої контакти
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bank Requisites */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-400">Отримувач</p>
              <p className="text-sm font-medium">{BANK_REQUISITES.recipient}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">IBAN</p>
                <CopyButton text={BANK_REQUISITES.iban} label="Копіювати" />
              </div>
              <p className="text-sm font-mono break-all">{BANK_REQUISITES.iban}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ІПН/ЄДРПОУ</p>
              <p className="text-sm">{BANK_REQUISITES.taxId}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Призначення платежу</p>
                <CopyButton text={paymentPurpose} label="Копіювати" />
              </div>
              <p className="text-sm font-medium text-amber-400">{paymentPurpose}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Сума</p>
              <p className="text-lg font-bold text-amber-400">{formatUAH(bookingAmount)}</p>
            </div>
          </div>

          {/* Contact Form */}
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-green-400">Дякуємо! Менеджер зв&apos;яжеться з вами для підтвердження.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-slate-400">Залиште контакти для підтвердження бронювання:</p>

              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Ваше ім'я"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                  className={`w-full px-4 py-2.5 rounded-lg bg-slate-800 border text-white placeholder-slate-400 focus:outline-none text-sm transition-colors ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <input
                  type="tel"
                  placeholder="+380671234567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                  className={`w-full px-4 py-2.5 rounded-lg bg-slate-800 border text-white placeholder-slate-400 focus:outline-none text-sm transition-colors ${
                    errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
              </div>

              <button
                type="submit"
                disabled={createCallback.isPending}
                className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {createCallback.isPending ? 'Надсилання...' : 'Підтвердити бронювання'}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
