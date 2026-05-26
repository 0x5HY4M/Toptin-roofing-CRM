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
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary flex-shrink-0" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <Skeleton className="h-7 w-24 bg-white/5" />
        ) : (
          <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
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
      <div className="flex flex-col space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text mb-0.5">Command Center</h1>
          <p className="text-sm text-muted-foreground">Overview of your roofing operations.</p>
        </div>

        {/* KPI grid — 2 cols on mobile, 4 on lg */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Monthly Revenue"
            value={summary ? `$${summary.monthlyRevenue.toLocaleString()}` : "$0"}
            icon={DollarSign}
            loading={loadingSummary}
            trend={summary?.revenueChange}
          />
          <MetricCard
            title="Total Leads"
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
            value={summary ? `$${(summary.openInvoiceAmount ?? 0).toLocaleString()}` : "$0"}
            icon={FileText}
            loading={loadingSummary}
          />
        </div>

        {/* Charts row 1 — stack on mobile, side-by-side on lg */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="glass lg:col-span-4">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm sm:text-base">Revenue Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-4">
              <div className="h-[220px] sm:h-[280px]">
                {loadingRevenue ? (
                  <Skeleton className="w-full h-full bg-white/5" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTimeline ?? []} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${v/1000}k` : v}`} width={40} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(var(--background))', strokeWidth: 2 }} activeDot={{ r: 5, fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-3">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm sm:text-base">Lead Funnel</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-4">
              <div className="h-[220px] sm:h-[280px]">
                {loadingFunnel ? (
                  <Skeleton className="w-full h-full bg-white/5" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadFunnel ?? []} layout="vertical" margin={{ left: 4, right: 8, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={90} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="glass lg:col-span-3">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm sm:text-base">Project Status</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-4">
              <div className="h-[220px] sm:h-[260px] flex items-center justify-center">
                {loadingStatus ? (
                  <Skeleton className="w-40 h-40 rounded-full bg-white/5" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown ?? []}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={4}
                        dataKey="count" nameKey="status"
                        stroke="none"
                      >
                        {(statusBreakdown ?? []).map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} />
                      <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-4">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-4">
                {loadingActivity
                  ? [...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="w-9 h-9 rounded-full bg-white/5 flex-shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-3/4 bg-white/5" />
                          <Skeleton className="h-3 w-1/3 bg-white/5" />
                        </div>
                      </div>
                    ))
                  : recentActivity?.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 relative before:absolute before:left-[17px] before:top-9 before:bottom-[-16px] before:w-px before:bg-white/5 last:before:hidden">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 z-10">
                          <Activity className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 pb-4 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            <span className="font-medium">{activity.actor}</span>
                            {" "}<span className="text-muted-foreground">{activity.action}</span>
                            {" "}<span className="font-medium">{activity.entityName}</span>
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            {format(new Date(activity.createdAt), "MMM d · h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                {(!recentActivity || recentActivity.length === 0) && !loadingActivity && (
                  <div className="text-center py-8 text-sm text-muted-foreground">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
