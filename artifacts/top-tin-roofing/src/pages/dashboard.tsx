import { AppShell } from "@/components/layout/shell";
import { 
  useGetDashboardSummary, 
  useGetRevenueTimeline,
  useGetLeadFunnel,
  useGetProjectStatusBreakdown,
  useGetRecentActivity
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { Activity, DollarSign, Users, Briefcase, FileText } from "lucide-react";
import { format } from "date-fns";

function MetricCard({ title, value, icon: Icon, loading, trend }: any) {
  return (
    <Card className="glass relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 bg-white/5" />
        ) : (
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
        )}
        {trend !== undefined && !loading && (
          <p className={`text-xs mt-1 ${trend >= 0 ? "text-secondary" : "text-destructive"}`}>
            {trend >= 0 ? "+" : ""}{trend}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: revenueTimeline, isLoading: loadingRevenue } = useGetRevenueTimeline();
  const { data: leadFunnel, isLoading: loadingFunnel } = useGetLeadFunnel();
  const { data: statusBreakdown, isLoading: loadingStatus } = useGetProjectStatusBreakdown();
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity();

  const COLORS = ['hsl(183, 100%, 50%)', 'hsl(152, 100%, 50%)', 'hsl(211, 100%, 50%)', 'hsl(280, 100%, 60%)', 'hsl(320, 100%, 60%)'];

  return (
    <AppShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text mb-1">Command Center</h1>
          <p className="text-muted-foreground">Overview of your roofing operations.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Revenue" 
            value={summary ? `$${summary.monthlyRevenue.toLocaleString()}` : "$0"} 
            icon={DollarSign} 
            loading={loadingSummary} 
            trend={summary?.revenueChange}
          />
          <MetricCard 
            title="Active Leads" 
            value={summary?.totalLeads ?? 0} 
            icon={Users} 
            loading={loadingSummary}
            trend={summary?.leadsChange}
          />
          <MetricCard 
            title="Active Projects" 
            value={summary?.activeProjects ?? 0} 
            icon={Briefcase} 
            loading={loadingSummary}
            trend={summary?.projectsChange}
          />
          <MetricCard 
            title="Open Invoices" 
            value={summary ? `$${summary.openInvoiceAmount?.toLocaleString() ?? 0}` : "$0"} 
            icon={FileText} 
            loading={loadingSummary}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="glass lg:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loadingRevenue ? (
                  <Skeleton className="w-full h-full bg-white/5" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTimeline ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-3">
            <CardHeader>
              <CardTitle>Lead Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loadingFunnel ? (
                  <Skeleton className="w-full h-full bg-white/5" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadFunnel ?? []} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="glass lg:col-span-3">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {loadingStatus ? (
                  <Skeleton className="w-48 h-48 rounded-full bg-white/5" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown ?? []}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        stroke="none"
                      >
                        {(statusBreakdown ?? []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingActivity ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                        <Skeleton className="h-3 w-1/4 bg-white/5" />
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivity?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 relative before:absolute before:left-[19px] before:top-10 before:bottom-[-16px] before:w-[2px] before:bg-white/5 last:before:hidden">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 z-10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-foreground">
                          {activity.actor} <span className="text-muted-foreground">{activity.action}</span> {activity.entityName}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {(!recentActivity || recentActivity.length === 0) && !loadingActivity && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
