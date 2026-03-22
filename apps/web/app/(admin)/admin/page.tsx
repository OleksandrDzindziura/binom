'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid, Phone, CheckCircle, FileX, Archive, Plus, ArrowRight,
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
  kitchen: 'Кухня',
  wardrobe: 'Шафа',
  bathroom: 'Ванна',
  office: 'Офіс',
  other: 'Інше',
};

const callbackStatusLabels: Record<string, string> = {
  new: 'Нова',
  contacted: 'В обробці',
  closed: 'Закрита',
};

const callbackStatusColors: Record<string, string> = {
  new: 'bg-red-500',
  contacted: 'bg-yellow-500',
  closed: 'bg-green-500',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery(
    orpc.dashboard.stats.queryOptions({ input: {} }),
  );

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Панель керування</h1>
        <p className="text-muted-foreground">Завантаження...</p>
      </div>
    );
  }

  const { projects, callbacks, recentProjects } = data;

  const statCards = [
    { label: 'Всього проектів', value: projects.total, icon: LayoutGrid, color: 'text-blue-600' },
    { label: 'Нових заявок', value: callbacks.byStatus.new, icon: Phone, color: 'text-red-600' },
    { label: 'Опубліковано', value: projects.published, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Чернетки', value: projects.unpublished, icon: FileX, color: 'text-orange-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Панель керування</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-1" /> Додати проект
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/callbacks">
              <Phone className="h-4 w-4 mr-1" /> Заявки
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Projects by category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Проекти за категорією</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(projects.byCategory).map(([key, count]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{categoryLabels[key] ?? key}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: projects.total > 0 ? `${(count / projects.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project status + Callbacks */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Archive className="h-4 w-4" /> Статус проектів
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{projects.published}</p>
                  <p className="text-sm text-muted-foreground">Опублікованих</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{projects.unpublished}</p>
                  <p className="text-sm text-muted-foreground">Чернеток</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-slate-500">{projects.archived}</p>
                  <p className="text-sm text-muted-foreground">Архівованих</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Заявки за статусом</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(callbacks.byStatus).map(([key, count]) => (
                  <div key={key} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${callbackStatusColors[key]}`} />
                      <span className="text-xl font-bold">{count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{callbackStatusLabels[key] ?? key}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent callbacks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Останні заявки</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/callbacks">
                Всі <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {callbacks.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Заявок поки немає</p>
            ) : (
              <div className="space-y-3">
                {callbacks.recent.map((cb) => (
                  <div key={cb.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{cb.name}</p>
                      <a
                        href={`tel:${cb.phone}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {cb.phone}
                      </a>
                      {cb.message && (
                        <p className="text-xs text-muted-foreground truncate">{cb.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        <div className={`h-1.5 w-1.5 rounded-full mr-1 ${callbackStatusColors[cb.status]}`} />
                        {callbackStatusLabels[cb.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cb.createdAt).toLocaleDateString('uk-UA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Останні проекти</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/projects">
                Всі <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Проектів поки немає</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{categoryLabels[project.category] ?? project.category}</p>
                    </div>
                    <Badge variant={project.isPublished ? 'default' : 'secondary'} className="text-xs">
                      {project.isPublished ? 'Опубліковано' : 'Чернетка'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
