import { AppShell } from "@/components/layout/shell";
import { useGetProjects } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Projects() {
  const { data: projects, isLoading } = useGetProjects();

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-primary/20 text-primary border-primary/20';
      case 'in progress': return 'bg-accent/20 text-accent border-accent/20';
      case 'planned': return 'bg-secondary/20 text-secondary border-secondary/20';
      default: return 'bg-muted/20 text-muted-foreground border-white/10';
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text">Projects</h1>
            <p className="text-muted-foreground">Active and past roofing jobs.</p>
          </div>
        </div>

        <div className="glass rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-card/80">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-primary">Project</TableHead>
                <TableHead className="text-primary">Status</TableHead>
                <TableHead className="text-primary">Roof Type</TableHead>
                <TableHead className="text-primary">Value</TableHead>
                <TableHead className="text-primary w-48">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-full bg-white/5" /></TableCell>
                  </TableRow>
                ))
              ) : projects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No projects found</TableCell>
                </TableRow>
              ) : (
                projects?.map((project) => (
                  <TableRow key={project.id} className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">{project.customerName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.roofType}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {project.contractValue ? `$${project.contractValue.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progressPercent || 0} className="h-2 bg-white/5" />
                        <span className="text-xs text-muted-foreground w-8">{project.progressPercent || 0}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
