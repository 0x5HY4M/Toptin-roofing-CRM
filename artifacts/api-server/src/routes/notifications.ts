import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, invoicesTable } from "@workspace/db";
import { eq, and, lt, ne } from "drizzle-orm";

const router = Router();

// GET /notifications — list all, newest first
router.get("/notifications", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(notificationsTable)
      .orderBy(notificationsTable.createdAt);
    // Return newest first
    res.json(rows.reverse());
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST /notifications/:id/read — mark one as read
router.post("/notifications/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to mark read" });
  }
});

// POST /notifications/read-all
router.post("/notifications/read-all", async (req, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.read, false));
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

// POST /notifications/check-overdue — call at dashboard load to auto-generate overdue alerts
router.post("/notifications/check-overdue", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const overdueInvoices = await db
      .select()
      .from(invoicesTable)
      .where(
        and(
          ne(invoicesTable.status, "paid"),
          lt(invoicesTable.dueDate, today)
        )
      );

    let created = 0;
    for (const inv of overdueInvoices) {
      // Check if we already have an unread notification for this invoice
      const existing = await db
        .select()
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.entityId, inv.id),
            eq(notificationsTable.entityType, "invoice"),
            eq(notificationsTable.type, "overdue_invoice"),
            eq(notificationsTable.read, false)
          )
        );
      if (existing.length === 0) {
        const amount = inv.totalAmount ? parseFloat(inv.totalAmount) : 0;
        await db.insert(notificationsTable).values({
          type: "overdue_invoice",
          title: "Invoice Overdue",
          body: `${inv.invoiceNumber} — $${amount.toLocaleString()} was due on ${inv.dueDate}`,
          entityId: inv.id,
          entityType: "invoice",
          read: false,
        });
        created++;
      }
    }
    res.json({ checked: overdueInvoices.length, created });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to check overdue invoices" });
  }
});

export default router;
