import type { Metadata } from 'next';
import { client } from '@/lib/orpc';
import ProjectDetailClient from './project-detail-client';

type Props = { params: Promise<{ id: string }> };

async function getProject(id: string) {
  try {
    return await client.catalog.projects.getById({ id: parseInt(id) });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return {};

  const title = project.title;
  const description = project.description ?? `Проект Binom Mebli — ${title}`;
  const imageUrl = project.images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Binom Mebli`,
      description,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://binom-mebli.com' },
      { '@type': 'ListItem', position: 2, name: 'Портфоліо', item: 'https://binom-mebli.com/portfolio' },
      ...(project
        ? [{ '@type': 'ListItem', position: 3, name: project.title, item: `https://binom-mebli.com/portfolio/${id}` }]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProjectDetailClient id={id} />
    </>
  );
}
