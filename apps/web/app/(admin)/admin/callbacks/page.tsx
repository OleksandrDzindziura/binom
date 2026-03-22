'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { CallbackCard } from './_components';
import { Button } from '@/components/ui/button';

type TypeFilter = 'all' | 'callback' | 'booking';

export default function CallbacksAdminPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const { data, isLoading, refetch } = useQuery(orpc.callbacks.list.queryOptions({
    input: {
      limit: 50,
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    },
  }));

  const updateStatus = useMutation(orpc.callbacks.updateStatus.mutationOptions({
    onSuccess: () => refetch(),
  }));

  const confirmBooking = useMutation(orpc.callbacks.confirmBooking.mutationOptions({
    onSuccess: () => refetch(),
  }));

  const cancelBooking = useMutation(orpc.callbacks.cancelBooking.mutationOptions({
    onSuccess: () => refetch(),
  }));

  if (isLoading) return <div>Завантаження...</div>;

  const callbacks = data?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Заявки на зворотній дзвінок</h1>
        <div className="flex gap-2">
          {([['all', 'Всі'], ['callback', 'Дзвінки'], ['booking', 'Бронювання']] as const).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={typeFilter === value ? 'default' : 'outline'}
              onClick={() => setTypeFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {callbacks.map((cb) => (
          <CallbackCard
            key={cb.id}
            callback={cb}
            onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
            onConfirmBooking={(id) => confirmBooking.mutate({ id })}
            onCancelBooking={(id) => cancelBooking.mutate({ id })}
          />
        ))}
        {callbacks.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Заявок ще немає</p>
        )}
      </div>
    </div>
  );
}
