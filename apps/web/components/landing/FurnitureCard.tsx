'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';

interface Props {
    id: number;
    title: string;
    imageUrl?: string | null;
    category: string;
    href: string;
}

const FurnitureCard = ({ id, title, imageUrl, href }: Props) => {
  const { toggle, isFavorite } = useFavorites();

  return (
    <Link
      href={href}
      key={id}
      className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400/50 transition-colors group block relative"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(id);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        aria-label={isFavorite(id) ? 'Видалити з вибраного' : 'Додати у вибране'}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isFavorite(id)
              ? 'fill-red-500 text-red-500'
              : 'text-white/70 hover:text-white'
          }`}
        />
      </button>
      <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center overflow-hidden">
        {imageUrl
          ? (
            <Image
              src={imageUrl}
              alt={title}
              width={400}
              height={300}
              className="w-full h-full object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )
          : (
            <span className="text-slate-500 text-sm">Фото</span>
          )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
};
export default FurnitureCard;