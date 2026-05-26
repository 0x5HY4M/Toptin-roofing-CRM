import { Router } from "express";
import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/activity", async (req, res) => {
  try {
    const { leadId, projectId, limit } = req.query as Record<string, string>;
    let rows = await db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt));
    if (leadId) rows = rows.filter(r => r.leadId === parseInt(leadId));
    if (projectId) rows = rows.filter(r => r.projectId === parseInt(projectId));
    const take = limit ? parseInt(limit) : 20;
    res.json(rows.slice(0, take));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

export default router;
