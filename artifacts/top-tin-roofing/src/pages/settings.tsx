import { AppShell } from "@/components/layout/shell";
import { UserButton, useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Users, Building2, Shield } from "lucide-react";

function Section({ title, icon: Icon, children }: any) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm sm:text-base text-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <AppShell>
      <div className="flex flex-col space-y-5 max-w-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and application preferences.</p>
        </div>

        <Section title="Profile" icon={Settings}>
          <div className="flex items-center gap-4">
            <UserButton appearance={{ elements: { avatarBox: "w-12 h-12 sm:w-14 sm:h-14" } }} />
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{user?.fullName ?? "—"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress ?? "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground">First Name</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue={user?.firstName ?? ""} readOnly />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Name</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue={user?.lastName ?? ""} readOnly />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""} readOnly />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60">Profile is managed via your account settings.</p>
        </Section>

        <Section title="Company" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue="Top Tin Roofing" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" placeholder="(512) 555-0100" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Website</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" placeholder="www.toptin.com" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" placeholder="123 Main St, Austin, TX 78701" />
            </div>
          </div>
          <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">Save Changes</Button>
        </Section>

        <Section title="Notifications" icon={Bell}>
          <div className="space-y-1">
            {[
              { label: "New lead notifications", desc: "Get notified when a new lead comes in" },
              { label: "Invoice payment alerts", desc: "Receive alerts when invoices are paid or overdue" },
              { label: "Task reminders", desc: "Daily digest of pending and overdue tasks" },
              { label: "Project status updates", desc: "Notify when project status changes" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-primary/20 border border-primary/30 relative cursor-pointer flex-shrink-0">
                  <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Team" icon={Users}>
          <p className="text-sm text-muted-foreground">Manage your team and permissions in the Crew section. Invite new users through your account settings.</p>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm px-0">Go to Crew Management</Button>
        </Section>

        <Section title="Security" icon={Shield}>
          <div className="space-y-1">
            <div className="flex items-start sm:items-center justify-between py-3 border-b border-white/5 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Managed via your account settings</p>
              </div>
              <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full flex-shrink-0">Configured</span>
            </div>
            <div className="flex items-start sm:items-center justify-between py-3 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Session Management</p>
                <p className="text-xs text-muted-foreground">Active sessions and device management</p>
              </div>
              <Button variant="ghost" className="text-xs text-muted-foreground hover:text-foreground flex-shrink-0">Manage</Button>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
