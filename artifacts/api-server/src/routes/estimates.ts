import { Router } from "express";
import { db } from "@workspace/db";
import { estimatesTable, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function parseEstimate(row: any) {
  return {
    ...row,
    squareFootage: row.squareFootage ? parseFloat(row.squareFootage) : null,
    materialCost: row.materialCost ? parseFloat(row.materialCost) : null,
    laborCost: row.laborCost ? parseFloat(row.laborCost) : null,
    taxRate: row.taxRate ? parseFloat(row.taxRate) : null,
    discountAmount: row.discountAmount ? parseFloat(row.discountAmount) : null,
    totalAmount: row.totalAmount ? parseFloat(row.totalAmount) : 0,
  };
}

router.get("/estimates", async (req, res) => {
  try {
    const { customerId, status } = req.query as Record<string, string>;
    const rows = await db.select({
      id: estimatesTable.id,
      customerId: estimatesTable.customerId,
      customerName: customersTable.name,
      projectId: estimatesTable.projectId,
      status: estimatesTable.status,
      roofType: estimatesTable.roofType,
      squareFootage: estimatesTable.squareFootage,
      materialCost: estimatesTable.materialCost,
      laborCost: estimatesTable.laborCost,
      taxRate: estimatesTable.taxRate,
      discountAmount: estimatesTable.discountAmount,
      totalAmount: estimatesTable.totalAmount,
      notes: estimatesTable.notes,
      validUntil: estimatesTable.validUntil,
      lineItems: estimatesTable.lineItems,
      createdAt: estimatesTable.createdAt,
      updatedAt: estimatesTable.updatedAt,
    }).from(estimatesTable)
      .leftJoin(customersTable, eq(estimatesTable.customerId, customersTable.id))
      .orderBy(estimatesTable.createdAt);
    let filtered = rows;
    if (customerId) filtered = filtered.filter(r => r.customerId === parseInt(customerId));
    if (status) filtered = filtered.filter(r => r.status === status);
    res.json(filtered.map(parseEstimate));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch estimates" });
  }
});

router.post("/estimates", async (req, res) => {
  try {
    const { squareFootage, materialCost, laborCost, taxRate, discountAmount, totalAmount, ...rest } = req.body;
    const [est] = await db.insert(estimatesTable).values({
      ...rest,
      squareFootage: squareFootage?.toString(),
      materialCost: materialCost?.toString(),
      laborCost: laborCost?.toString(),
      taxRate: taxRate?.toString(),
      discountAmount: discountAmount?.toString(),
      totalAmount: totalAmount?.toString() ?? "0",
    }).returning();
    const [full] = await db.select({
      id: estimatesTable.id,
      customerId: estimatesTable.customerId,
      customerName: customersTable.name,
      projectId: estimatesTable.projectId,
      status: estimatesTable.status,
      roofType: estimatesTable.roofType,
      squareFootage: estimatesTable.squareFootage,
      materialCost: estimatesTable.materialCost,
      laborCost: estimatesTable.laborCost,
      taxRate: estimatesTable.taxRate,
      discountAmount: estimatesTable.discountAmount,
      totalAmount: estimatesTable.totalAmount,
      notes: estimatesTable.notes,
      validUntil: estimatesTable.validUntil,
      lineItems: estimatesTable.lineItems,
      createdAt: estimatesTable.createdAt,
      updatedAt: estimatesTable.updatedAt,
    }).from(estimatesTable)
      .leftJoin(customersTable, eq(estimatesTable.customerId, customersTable.id))
      .where(eq(estimatesTable.id, est.id));
    res.status(201).json(parseEstimate(full));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create estimate" });
  }
});

router.get("/estimates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [est] = await db.select({
      id: estimatesTable.id,
      customerId: estimatesTable.customerId,
      customerName: customersTable.name,
      projectId: estimatesTable.projectId,
      status: estimatesTable.status,
      roofType: estimatesTable.roofType,
      squareFootage: estimatesTable.squareFootage,
      materialCost: estimatesTable.materialCost,
      laborCost: estimatesTable.laborCost,
      taxRate: estimatesTable.taxRate,
      discountAmount: estimatesTable.discountAmount,
      totalAmount: estimatesTable.totalAmount,
      notes: estimatesTable.notes,
      validUntil: estimatesTable.validUntil,
      lineItems: estimatesTable.lineItems,
      createdAt: estimatesTable.createdAt,
      updatedAt: estimatesTable.updatedAt,
    }).from(estimatesTable)
      .leftJoin(customersTable, eq(estimatesTable.customerId, customersTable.id))
      .where(eq(estimatesTable.id, id));
    if (!est) return res.status(404).json({ error: "Estimate not found" });
    res.json(parseEstimate(est));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch estimate" });
  }
});

router.patch("/estimates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { squareFootage, materialCost, laborCost, taxRate, discountAmount, totalAmount, ...rest } = req.body;
    await db.update(estimatesTable).set({
      ...rest,
      squareFootage: squareFootage?.toString(),
      materialCost: materialCost?.toString(),
      laborCost: laborCost?.toString(),
      taxRate: taxRate?.toString(),
      discountAmount: discountAmount?.toString(),
      totalAmount: totalAmount?.toString(),
    }).where(eq(estimatesTable.id, id));
    const [full] = await db.select({
      id: estimatesTable.id,
      customerId: estimatesTable.customerId,
      customerName: customersTable.name,
      projectId: estimatesTable.projectId,
      status: estimatesTable.status,
      roofType: estimatesTable.roofType,
      squareFootage: estimatesTable.squareFootage,
      materialCost: estimatesTable.materialCost,
      laborCost: estimatesTable.laborCost,
      taxRate: estimatesTable.taxRate,
      discountAmount: estimatesTable.discountAmount,
      totalAmount: estimatesTable.totalAmount,
      notes: estimatesTable.notes,
      validUntil: estimatesTable.validUntil,
      lineItems: estimatesTable.lineItems,
      createdAt: estimatesTable.createdAt,
      updatedAt: estimatesTable.updatedAt,
    }).from(estimatesTable)
      .leftJoin(customersTable, eq(estimatesTable.customerId, customersTable.id))
      .where(eq(estimatesTable.id, id));
    if (!full) return res.status(404).json({ error: "Estimate not found" });
    res.json(parseEstimate(full));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update estimate" });
  }
});

router.delete("/estimates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(estimatesTable).where(eq(estimatesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete estimate" });
  }
});

export default router;
