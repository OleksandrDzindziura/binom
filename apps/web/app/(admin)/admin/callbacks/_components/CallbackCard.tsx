'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import type { AppOutputs } from '@/lib/orpc';

type CallbackRequest = AppOutputs['callbacks']['list']['items'][number];

const typeLabels: Record<string, string> = {
  callback: 'Дзвінок',
  booking: 'Бронювання',
};

const typeColors: Record<string, string> = {
  callback: 'bg-slate-500',
  booking: 'bg-amber-500',
};

const statusLabels: Record<string, string> = {
  new: 'Нова',
  contacted: 'Опрацьована',
  closed: 'Закрита',
};

const statusColors: Record<string, string> = {
  new: 'bg-red-500',
  contacted: 'bg-yellow-500',
  closed: 'bg-green-500',
};

interface CallbackCardProps {
  callback: CallbackRequest;
  onUpdateStatus: (_id: number, _status: 'contacted' | 'closed') => void;
  onConfirmBooking?: (_id: number) => void;
  onCancelBooking?: (_id: number) => void;
}

export function CallbackCard({ callback: cb, onUpdateStatus, onConfirmBooking, onCancelBooking }: CallbackCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">{cb.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {cb.phone}
          </p>
          {cb.message && <p className="text-sm mt-1">{cb.message}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(cb.createdAt).toLocaleString('uk-UA')}
            {cb.carId && ` · ${cb.carName || `Авто #${cb.carId}`}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={typeColors[cb.type]}>{typeLabels[cb.type]}</Badge>
          <Badge className={statusColors[cb.status]}>{statusLabels[cb.status]}</Badge>
          {cb.status === 'new' && cb.type === 'booking' && cb.carId && onConfirmBooking && (
            <Button
              size="sm"
              className="min-h-[44px] md:min-h-0 bg-amber-500 hover:bg-amber-600 text-slate-900"
              onClick={() => onConfirmBooking(cb.id)}
            >
              Підтвердити бронь
            </Button>
          )}
          {cb.status === 'new' && (
            <Button
              size="sm"
              className="min-h-[44px] md:min-h-0"
              variant="outline"
              onClick={() => onUpdateStatus(cb.id, 'contacted')}
            >
              Опрацювати
            </Button>
          )}
          {cb.status === 'contacted' && cb.type === 'booking' && cb.carId && onCancelBooking && (
            <Button
              size="sm"
              className="min-h-[44px] md:min-h-0"
              variant="destructive"
              onClick={() => onCancelBooking(cb.id)}
            >
              Скасувати бронь
            </Button>
          )}
          {cb.status === 'contacted' && (
            <Button
              size="sm"
              className="min-h-[44px] md:min-h-0"
              variant="outline"
              onClick={() => onUpdateStatus(cb.id, 'closed')}
            >
              Закрити
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
