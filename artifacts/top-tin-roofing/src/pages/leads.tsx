import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import { useGetLeads, useUpdateLeadStage, getGetLeadsQueryKey, type Lead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STAGES = [
  "New Request", "Contacted", "Inspection Scheduled",
  "Quote Sent", "Negotiation", "In Progress",
  "Completed", "Lost"
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-destructive/20 text-destructive border-destructive/20",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted/50 text-muted-foreground border-white/10",
};

function LeadCard({ lead, onDragStart }: { lead: Lead; onDragStart: (id: number) => void }) {
  return (
    <Card
      className="glass mb-2.5 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors touch-manipulation"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id.toString());
        onDragStart(lead.id);
      }}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-medium text-sm text-foreground leading-tight">{lead.name}</h4>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ml-1", PRIORITY_COLORS[lead.priority] ?? PRIORITY_COLORS.low)}>
            {lead.priority}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{lead.address || "No address"}</p>
        <div className="flex justify-between items-center text-xs">
          <span className="text-primary font-semibold">{lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : "TBD"}</span>
          <span className="text-muted-foreground">{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Leads() {
  const { data: leads, isLoading } = useGetLeads();
  const updateStage = useUpdateLeadStage();
  const qc = useQueryClient();
  const [draggedLead, setDraggedLead] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (stage: string, e: React.DragEvent) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(leadId)) return;

    const lead = leads?.find(l => l.id === leadId);
    if (lead && lead.stage !== stage) {
      qc.setQueryData(getGetLeadsQueryKey(), (old: Lead[] | undefined) =>
        old ? old.map(l => l.id === leadId ? { ...l, stage } : l) : old
      );
      updateStage.mutate({ id: leadId, data: { stage } }, {
        onSuccess: () => toast.success(`Moved to ${stage}`),
        onError: () => {
          toast.error("Failed to move lead");
          qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() });
        }
      });
    }
    setDraggedLead(null);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Drag cards to move leads through your pipeline.</p>
        </div>

        {/* Kanban board — horizontal scroll on mobile */}
        <div className="flex-1 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-3 h-full" style={{ minWidth: `${STAGES.length * 248}px` }}>
            {STAGES.map(stage => {
              const stageLeads = leads?.filter(l => l.stage === stage) || [];
              return (
                <div
                  key={stage}
                  className="w-60 sm:w-64 flex-shrink-0 flex flex-col bg-card/20 rounded-xl border border-white/5"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(stage, e)}
                >
                  <div className="p-3 border-b border-white/5 flex justify-between items-center bg-card/40 rounded-t-xl">
                    <h3 className="font-semibold text-xs text-foreground leading-tight">{stage}</h3>
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary border border-primary/20 flex-shrink-0">
                      {isLoading ? "–" : stageLeads.length}
                    </span>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto">
                    {isLoading ? (
                      [...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full mb-2.5 bg-white/5 rounded-xl" />
                      ))
                    ) : (
                      stageLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} onDragStart={setDraggedLead} />
                      ))
                    )}
                    {!isLoading && stageLeads.length === 0 && (
                      <div className="h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground/40">Drop here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
