import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, MessageSquare, Briefcase, Mail, RefreshCcw } from 'lucide-react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface DashboardStats {
  counts: {
    users: number;
    projects: number;
    blogs: number;
    messages: number;
    subscribers: number;
    unreadMessages: number;
  };
  recent: {
    messages: any[];
    projects: any[];
  };
}

export default function DashboardPage() {
  const { data: stats, isLoading: isStatsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.dashboard.getStats,
  });

  const isLoading = isStatsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <ModernLoader size="lg" text="Memuat Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.counts.projects || 0}</div>
            <p className="text-xs text-muted-foreground">Portfolio projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artikel Blog</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.counts.blogs || 0}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesan Masuk</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.counts.messages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.counts.unreadMessages || 0} pesan belum dibaca
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.counts.subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">Newsletter subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Messages */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Pesan Terbaru</CardTitle>
            <CardDescription>
              5 pesan terakhir yang masuk dari formulir kontak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats?.recent?.messages?.length > 0 ? (
                stats.recent.messages.map((msg: any) => (
                  <div key={msg.id} className="flex items-start">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4 space-y-1 w-full overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none truncate">{msg.senderName}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(msg.createdAt), 'dd MMM', { locale: id })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1" title={msg.message}>
                        {msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesan masuk.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Proyek Terbaru</CardTitle>
            <CardDescription>
              Proyek yang baru saja ditambahkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-8">
              {stats?.recent?.projects?.length > 0 ? (
                stats.recent.projects.map((project: any) => (
                  <div key={project.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="ml-4 space-y-1 overflow-hidden w-full">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium leading-none truncate">{project.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${project.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} whitespace-nowrap ml-2`}>
                            {project.is_published ? 'Pub' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: id })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada proyek.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
