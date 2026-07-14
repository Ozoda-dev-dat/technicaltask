import { useGetRequestStats } from "@/hooks/api";
import { DepartmentBadge, StatusBadge, PriorityBadge } from "@/components/Badges";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Inbox, CheckCircle2, Clock, BarChart3, ListFilter, Activity } from "lucide-react";
import { format } from "date-fns";

const DEPT_COLORS: Record<string, string> = {
  hr: "hsl(var(--dept-hr))",
  it: "hsl(var(--dept-it))",
  finance: "hsl(var(--dept-finance))",
  legal: "hsl(var(--dept-legal))",
  complaints: "hsl(var(--dept-complaints))",
  general: "hsl(var(--dept-general))",
};

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useGetRequestStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-border">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-lg font-semibold text-foreground">Ma'lumotlarni yuklashda xatolik</h2>
        <p className="text-muted-foreground mt-2">Iltimos, sahifani yangilang yoki keyinroq qayta urinib ko'ring.</p>
      </div>
    );
  }

  const newRequests = stats.byStatus.find(s => s.status === 'new')?.count || 0;
  const inProgress = stats.byStatus.find(s => s.status === 'in_progress')?.count || 0;
  const resolved = stats.byStatus.find(s => s.status === 'resolved')?.count || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Boshqaruv paneli</h1>
        <p className="text-muted-foreground">Murojaatlar statistikasi va tizim holati</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami murojaatlar" value={stats.total} icon={<ListFilter size={20} />} />
        <StatCard title="Yangi" value={newRequests} icon={<Inbox size={20} />} trend="Ko'rib chiqilishi kerak" />
        <StatCard title="Jarayonda" value={inProgress} icon={<Clock size={20} />} />
        <StatCard title="Hal etilgan" value={resolved} icon={<CheckCircle2 size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-muted-foreground" />
              Bo'limlar bo'yicha taqsimot
            </CardTitle>
            <CardDescription>Murojaatlarning bo'limlarga yo'naltirilish ko'rsatkichlari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byDepartment} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <XAxis dataKey="departmentLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontSize: '13px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {stats.byDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[entry.department] || DEPT_COLORS.general} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={18} className="text-muted-foreground" />
              So'nggi faollik
            </CardTitle>
            <CardDescription>Tizimga kelib tushgan oxirgi murojaatlar</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {stats.recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                Ma'lumot topilmadi
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map(req => (
                  <Link key={req.id} href={`/requests/${req.id}`}>
                    <div className="p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <DepartmentBadge department={req.department} label={req.departmentLabel} />
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(req.createdAt), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 font-medium mb-3 group-hover:text-primary transition-colors">
                        {req.text}
                      </p>
                      <div className="flex justify-between items-center mt-auto">
                        <StatusBadge status={req.status} />
                        {req.priority && <PriorityBadge priority={req.priority} />}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend?: string }) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
