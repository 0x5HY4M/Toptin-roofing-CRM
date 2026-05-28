import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, notesTable, notificationsTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";

const router = Router();

router.get("/leads", async (req, res) => {
  try {
    const { stage, assignedTo, search } = req.query as Record<string, string>;
    let query = db.select().from(leadsTable);
    const conditions = [];
    if (stage) conditions.push(eq(leadsTable.stage, stage));
    if (assignedTo) conditions.push(eq(leadsTable.assignedTo, assignedTo));
    if (search) {
      conditions.push(
        or(
          ilike(leadsTable.name, `%${search}%`),
          ilike(leadsTable.email, `%${search}%`),
        )!
      );
    }
    const rows = conditions.length > 0
      ? await db.select().from(leadsTable).where(conditions[0])
      : await db.select().from(leadsTable).orderBy(leadsTable.createdAt);
    res.json(rows.map(row => ({
      ...row,
      squareFootage: row.squareFootage ? parseFloat(row.squareFootage) : null,
      estimatedValue: row.estimatedValue ? parseFloat(row.estimatedValue) : null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.post("/leads", async (req, res) => {
  try {
    const { name, email, phone, address, roofType, squareFootage, stage, priority, source, assignedTo, notes, estimatedValue } = req.body;
    const [lead] = await db.insert(leadsTable).values({
      name, email, phone, address, roofType,
      squareFootage: squareFootage?.toString(),
      stage: stage || "New Request",
      priority: priority || "medium",
      source: source || "website",
      assignedTo, notes,
      estimatedValue: estimatedValue?.toString(),
    }).returning();
    // Fire-and-forget notification
    db.insert(notificationsTable).values({
      type: "new_lead",
      title: "New Lead",
      body: `${lead.name}${lead.address ? ` — ${lead.address}` : ""}${lead.estimatedValue ? ` · $${parseFloat(lead.estimatedValue).toLocaleString()}` : ""}`,
      entityId: lead.id,
      entityType: "lead",
      read: false,
    }).catch(() => {/* ignore */});

    res.status(201).json({
      ...lead,
      squareFootage: lead.squareFootage ? parseFloat(lead.squareFootage) : null,
      estimatedValue: lead.estimatedValue ? parseFloat(lead.estimatedValue) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.get("/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({
      ...lead,
      squareFootage: lead.squareFootage ? parseFloat(lead.squareFootage) : null,
      estimatedValue: lead.estimatedValue ? parseFloat(lead.estimatedValue) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

router.patch("/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { squareFootage, estimatedValue, ...rest } = req.body;
    const [lead] = await db.update(leadsTable).set({
      ...rest,
      squareFootage: squareFootage?.toString(),
      estimatedValue: estimatedValue?.toString(),
    }).where(eq(leadsTable.id, id)).returning();
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({
      ...lead,
      squareFootage: lead.squareFootage ? parseFloat(lead.squareFootage) : null,
      estimatedValue: lead.estimatedValue ? parseFloat(lead.estimatedValue) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

router.patch("/leads/:id/stage", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { stage } = req.body;
    const [lead] = await db.update(leadsTable).set({ stage }).where(eq(leadsTable.id, id)).returning();
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({
      ...lead,
      squareFootage: lead.squareFootage ? parseFloat(lead.squareFootage) : null,
      estimatedValue: lead.estimatedValue ? parseFloat(lead.estimatedValue) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update lead stage" });
  }
});

router.delete("/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(leadsTable).where(eq(leadsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

router.post("/leads/:id/notes", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const { content, author } = req.body;
    const [note] = await db.insert(notesTable).values({ content, author, leadId }).returning();
    res.status(201).json(note);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

export default router;
