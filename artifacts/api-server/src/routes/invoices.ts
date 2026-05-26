import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function parseInvoice(row: any) {
  return {
    ...row,
    subtotal: row.subtotal ? parseFloat(row.subtotal) : null,
    taxAmount: row.taxAmount ? parseFloat(row.taxAmount) : null,
    discountAmount: row.discountAmount ? parseFloat(row.discountAmount) : null,
    totalAmount: row.totalAmount ? parseFloat(row.totalAmount) : 0,
    paidAmount: row.paidAmount ? parseFloat(row.paidAmount) : null,
  };
}

router.get("/invoices", async (req, res) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const rows = await db.select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      customerId: invoicesTable.customerId,
      customerName: customersTable.name,
      projectId: invoicesTable.projectId,
      status: invoicesTable.status,
      subtotal: invoicesTable.subtotal,
      taxAmount: invoicesTable.taxAmount,
      discountAmount: invoicesTable.discountAmount,
      totalAmount: invoicesTable.totalAmount,
      paidAmount: invoicesTable.paidAmount,
      dueDate: invoicesTable.dueDate,
      paidAt: invoicesTable.paidAt,
      notes: invoicesTable.notes,
      lineItems: invoicesTable.lineItems,
      createdAt: invoicesTable.createdAt,
      updatedAt: invoicesTable.updatedAt,
    }).from(invoicesTable)
      .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
      .orderBy(invoicesTable.createdAt);
    let filtered = rows;
    if (status) filtered = filtered.filter(r => r.status === status);
    if (customerId) filtered = filtered.filter(r => r.customerId === parseInt(customerId));
    res.json(filtered.map(parseInvoice));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { subtotal, taxAmount, discountAmount, totalAmount, paidAmount, ...rest } = req.body;
    // Auto-generate invoice number
    const count = await db.select().from(invoicesTable);
    const invoiceNumber = `INV-${String(count.length + 1).padStart(4, "0")}`;
    const [inv] = await db.insert(invoicesTable).values({
      ...rest,
      invoiceNumber,
      subtotal: subtotal?.toString(),
      taxAmount: taxAmount?.toString(),
      discountAmount: discountAmount?.toString(),
      totalAmount: totalAmount?.toString() ?? "0",
      paidAmount: paidAmount?.toString(),
    }).returning();
    const [full] = await db.select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      customerId: invoicesTable.customerId,
      customerName: customersTable.name,
      projectId: invoicesTable.projectId,
      status: invoicesTable.status,
      subtotal: invoicesTable.subtotal,
      taxAmount: invoicesTable.taxAmount,
      discountAmount: invoicesTable.discountAmount,
      totalAmount: invoicesTable.totalAmount,
      paidAmount: invoicesTable.paidAmount,
      dueDate: invoicesTable.dueDate,
      paidAt: invoicesTable.paidAt,
      notes: invoicesTable.notes,
      lineItems: invoicesTable.lineItems,
      createdAt: invoicesTable.createdAt,
      updatedAt: invoicesTable.updatedAt,
    }).from(invoicesTable)
      .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
      .where(eq(invoicesTable.id, inv.id));
    res.status(201).json(parseInvoice(full));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [inv] = await db.select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      customerId: invoicesTable.customerId,
      customerName: customersTable.name,
      projectId: invoicesTable.projectId,
      status: invoicesTable.status,
      subtotal: invoicesTable.subtotal,
      taxAmount: invoicesTable.taxAmount,
      discountAmount: invoicesTable.discountAmount,
      totalAmount: invoicesTable.totalAmount,
      paidAmount: invoicesTable.paidAmount,
      dueDate: invoicesTable.dueDate,
      paidAt: invoicesTable.paidAt,
      notes: invoicesTable.notes,
      lineItems: invoicesTable.lineItems,
      createdAt: invoicesTable.createdAt,
      updatedAt: invoicesTable.updatedAt,
    }).from(invoicesTable)
      .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
      .where(eq(invoicesTable.id, id));
    if (!inv) return res.status(404).json({ error: "Invoice not found" });
    res.json(parseInvoice(inv));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.patch("/invoices/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { subtotal, taxAmount, discountAmount, totalAmount, paidAmount, ...rest } = req.body;
    await db.update(invoicesTable).set({
      ...rest,
      subtotal: subtotal?.toString(),
      taxAmount: taxAmount?.toString(),
      discountAmount: discountAmount?.toString(),
      totalAmount: totalAmount?.toString(),
      paidAmount: paidAmount?.toString(),
    }).where(eq(invoicesTable.id, id));
    const [full] = await db.select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      customerId: invoicesTable.customerId,
      customerName: customersTable.name,
      projectId: invoicesTable.projectId,
      status: invoicesTable.status,
      subtotal: invoicesTable.subtotal,
      taxAmount: invoicesTable.taxAmount,
      discountAmount: invoicesTable.discountAmount,
      totalAmount: invoicesTable.totalAmount,
      paidAmount: invoicesTable.paidAmount,
      dueDate: invoicesTable.dueDate,
      paidAt: invoicesTable.paidAt,
      notes: invoicesTable.notes,
      lineItems: invoicesTable.lineItems,
      createdAt: invoicesTable.createdAt,
      updatedAt: invoicesTable.updatedAt,
    }).from(invoicesTable)
      .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
      .where(eq(invoicesTable.id, id));
    if (!full) return res.status(404).json({ error: "Invoice not found" });
    res.json(parseInvoice(full));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

router.delete("/invoices/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

export default router;
