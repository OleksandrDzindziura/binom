"use client";
import FurnitureCard from "@/components/landing/FurnitureCard";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { useFavorites } from "@/hooks/use-favorites";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

const FavoritesSection = () => {
  const { favorites } = useFavorites();
  const { data, isLoading } = useQuery(orpc.catalog.projects.list.queryOptions({
    input: { publishedOnly: true, limit: 100, page: 1 },
  }));

  const favoriteSet = new Set(favorites);
  const projects = (data?.items ?? []).filter((p) => favoriteSet.has(p.id));

  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Вибрані проекти", path: "/favorites" }]} />
      <div>
        <h1 className="text-2xl font-bold mb-4 text-black">Вибрані проекти</h1>
      </div>
      <div>
        {isLoading
          ? <p>Завантаження...</p>
          : projects.length > 0
            ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((p) => (
                  <FurnitureCard key={p.id} id={p.id} title={p.title} imageUrl={p.imageUrl} category={p.category} href={`/portfolio/${p.id}`} />
                ))}
              </div>
            )
            : <p>У вас ще немає вибраних проектів.</p>}
      </div>
    </div>
  );

};
export default FavoritesSection;