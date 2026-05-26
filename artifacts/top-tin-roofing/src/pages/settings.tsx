import { AppShell } from "@/components/layout/shell";
import { UserButton, useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Users, Building2, Shield, CreditCard } from "lucide-react";

function Section({ title, icon: Icon, children }: any) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <AppShell>
      <div className="flex flex-col space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>

        <Section title="Profile" icon={Settings}>
          <div className="flex items-center gap-4">
            <UserButton appearance={{ elements: { avatarBox: "w-14 h-14" } }} />
            <div>
              <p className="font-medium text-foreground">{user?.fullName ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress ?? "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground">First Name</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue={user?.firstName ?? ""} readOnly />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Name</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue={user?.lastName ?? ""} readOnly />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""} readOnly />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60">Profile managed via your account settings.</p>
        </Section>

        <Section title="Company" icon={Building2}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
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
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input className="bg-muted/30 border-white/10 mt-1" placeholder="123 Main St, Austin, TX 78701" />
            </div>
          </div>
          <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">Save Changes</Button>
        </Section>

        <Section title="Notifications" icon={Bell}>
          <div className="space-y-3">
            {[
              { label: "New lead notifications", desc: "Get notified when a new lead comes in" },
              { label: "Invoice payment alerts", desc: "Receive alerts when invoices are paid or overdue" },
              { label: "Task reminders", desc: "Daily digest of pending and overdue tasks" },
              { label: "Project status updates", desc: "Notify when project status changes" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-primary/20 border border-primary/30 relative cursor-pointer">
                  <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Team" icon={Users}>
          <p className="text-sm text-muted-foreground">Manage your team and permissions in the Crew section. Invite new users through your account settings.</p>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">Go to Crew Management →</Button>
        </Section>

        <Section title="Security" icon={Shield}>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Managed via your account settings</p>
              </div>
              <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Configured</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Session Management</p>
                <p className="text-xs text-muted-foreground">Active sessions and device management</p>
              </div>
              <Button variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">Manage</Button>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
