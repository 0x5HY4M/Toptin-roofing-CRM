import { Router } from "express";
import { db } from "@workspace/db";
import {
  leadsTable, projectsTable, customersTable, invoicesTable,
  tasksTable, activityLogsTable
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const leads = await db.select().from(leadsTable);
    const projects = await db.select().from(projectsTable);
    const customers = await db.select().from(customersTable);
    const invoices = await db.select().from(invoicesTable);
    const tasks = await db.select().from(tasksTable);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const paidInvoices = invoices.filter(i => i.status === "paid");
    const thisMonthPaid = paidInvoices.filter(i => {
      const d = new Date(i.updatedAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthPaid = paidInvoices.filter(i => {
      const d = new Date(i.updatedAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const monthlyRevenue = thisMonthPaid.reduce((s, i) => s + parseFloat(i.totalAmount ?? "0"), 0);
    const lastRevenue = lastMonthPaid.reduce((s, i) => s + parseFloat(i.totalAmount ?? "0"), 0);
    const revenueChange = lastRevenue > 0 ? ((monthlyRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    const openInvoices = invoices.filter(i => i.status !== "paid");
    const openInvoiceAmount = openInvoices.reduce((s, i) => s + parseFloat(i.totalAmount ?? "0"), 0);
    const activeProjects = projects.filter(p => ["in_progress", "inspection", "permit", "active"].includes(p.status));

    const completedLeads = leads.filter(l => l.stage === "Completed");
    const conversionRate = leads.length > 0 ? (completedLeads.length / leads.length) * 100 : 0;
    const pendingTasks = tasks.filter(t => t.status !== "done" && t.status !== "completed");

    const thisMonthLeads = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthLeads = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
    const leadsChange = lastMonthLeads.length > 0
      ? ((thisMonthLeads.length - lastMonthLeads.length) / lastMonthLeads.length) * 100
      : 0;

    res.json({
      totalLeads: leads.length,
      activeProjects: activeProjects.length,
      monthlyRevenue,
      totalCustomers: customers.length,
      openInvoices: openInvoices.length,
      openInvoiceAmount,
      pendingTasks: pendingTasks.length,
      conversionRate: Math.round(conversionRate * 10) / 10,
      revenueChange: Math.round(revenueChange * 10) / 10,
      leadsChange: Math.round(leadsChange * 10) / 10,
      projectsChange: 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

router.get("/dashboard/revenue", async (req, res) => {
  try {
    const invoices = await db.select().from(invoicesTable);
    const monthMap: Record<string, { revenue: number; invoiceCount: number; projectCount: number }> = {};

    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthMap[key] = { revenue: 0, invoiceCount: 0, projectCount: 0 };
    }

    invoices.filter(i => i.status === "paid").forEach(inv => {
      const d = new Date(inv.updatedAt);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (monthMap[key] !== undefined) {
        monthMap[key].revenue += parseFloat(inv.totalAmount ?? "0");
        monthMap[key].invoiceCount += 1;
      }
    });

    const projects = await db.select().from(projectsTable);
    projects.forEach(p => {
      if (p.startDate) {
        const d = new Date(p.startDate);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (monthMap[key] !== undefined) {
          monthMap[key].projectCount += 1;
        }
      }
    });

    res.json(Object.entries(monthMap).map(([month, data]) => ({ month, ...data })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch revenue timeline" });
  }
});

router.get("/dashboard/lead-funnel", async (req, res) => {
  try {
    const stages = ["New Request", "Contacted", "Inspection Scheduled", "Quote Sent", "Negotiation", "In Progress", "Completed", "Lost"];
    const leads = await db.select().from(leadsTable);
    const result = stages.map(stage => {
      const stageLeads = leads.filter(l => l.stage === stage);
      return {
        stage,
        count: stageLeads.length,
        value: stageLeads.reduce((s, l) => s + parseFloat(l.estimatedValue ?? "0"), 0),
      };
    });
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch lead funnel" });
  }
});

router.get("/dashboard/recent-activity", async (req, res) => {
  try {
    const rows = await db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt)).limit(10);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

router.get("/dashboard/project-status", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable);
    const statusMap: Record<string, number> = {};
    projects.forEach(p => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    res.json(Object.entries(statusMap).map(([status, count]) => ({ status, count })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch project status breakdown" });
  }
});

export default router;
