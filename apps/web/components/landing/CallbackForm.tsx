'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toast } from 'sonner';

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function CallbackForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

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
      setMessage('');
      setErrors({});
      toast.success('Заявку надіслано! Ми зв\'яжемося з вами найближчим часом.');
    },
    onError: () => {
      toast.error('Не вдалося надіслати заявку. Спробуйте ще раз.');
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createCallback.mutate({
      name,
      phone,
      message: message || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-green-400">Дякуємо! Ми зв&apos;яжемося з вами найближчим часом.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1">
        <input
          type="text"
          placeholder="Ваше ім'я"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          className={`w-full px-4 py-3 rounded-2xl bg-slate-800 border text-white placeholder-slate-400 focus:outline-none transition-colors ${
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
          className={`w-full px-4 py-3 rounded-2xl bg-slate-800 border text-white placeholder-slate-400 focus:outline-none transition-colors ${
            errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-400'
          }`}
        />
        {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
      </div>

      <textarea
        placeholder="Повідомлення (необов'язково)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none transition-colors"
      />

      <button
        type="submit"
        disabled={createCallback.isPending}
        className="px-6 py-3 bg-amber-400 cursor-pointer hover:bg-amber-600 text-slate-900 font-semibold rounded-2xl transition-colors disabled:opacity-50"
      >
        {createCallback.isPending ? 'Надсилання...' : 'Надіслати заявку'}
      </button>
    </form>
  );
}
