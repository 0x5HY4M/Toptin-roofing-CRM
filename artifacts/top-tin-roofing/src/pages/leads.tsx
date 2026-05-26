import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import { useGetLeads, useUpdateLeadStage, getGetLeadsQueryKey, type Lead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const STAGES = [
  "New Request", "Contacted", "Inspection Scheduled", 
  "Quote Sent", "Negotiation", "In Progress", 
  "Completed", "Lost"
];

function LeadCard({ lead, onDragStart }: { lead: Lead, onDragStart: (id: number) => void }) {
  return (
    <Card 
      className="glass mb-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id.toString());
        onDragStart(lead.id);
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm text-foreground">{lead.name}</h4>
          <Badge variant={lead.priority === "high" || lead.priority === "urgent" ? "destructive" : "secondary"} className="text-[10px] px-1 py-0 h-4">
            {lead.priority}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mb-2">{lead.address || "No address"}</div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-primary font-medium">{lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : "TBD"}</span>
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: string, e: React.DragEvent) => {
    e.preventDefault();
    const leadIdStr = e.dataTransfer.getData("text/plain");
    const leadId = parseInt(leadIdStr, 10);
    
    if (isNaN(leadId)) return;

    const lead = leads?.find(l => l.id === leadId);
    if (lead && lead.stage !== stage) {
      // Optimistic update
      qc.setQueryData(getGetLeadsQueryKey(), (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(l => l.id === leadId ? { ...l, stage } : l);
      });

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text">Pipeline</h1>
            <p className="text-muted-foreground">Manage your sales opportunities.</p>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex space-x-4 h-full min-w-max">
            {STAGES.map(stage => {
              const stageLeads = leads?.filter(l => l.stage === stage) || [];
              
              return (
                <div 
                  key={stage} 
                  className="w-80 flex flex-col bg-card/20 rounded-xl border border-white/5"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(stage, e)}
                >
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-card/40 rounded-t-xl">
                    <h3 className="font-semibold text-sm text-foreground">{stage}</h3>
                    <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">{isLoading ? "-" : stageLeads.length}</Badge>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full mb-3 bg-white/5 rounded-xl" />
                      ))
                    ) : (
                      stageLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} onDragStart={setDraggedLead} />
                      ))
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
