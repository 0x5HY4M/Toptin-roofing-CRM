import { Router } from "express";
import { db } from "@workspace/db";
import { materialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function parseMaterial(row: any) {
  return {
    ...row,
    pricePerUnit: row.pricePerUnit ? parseFloat(row.pricePerUnit) : 0,
  };
}

router.get("/materials", async (req, res) => {
  try {
    const rows = await db.select().from(materialsTable).orderBy(materialsTable.category);
    res.json(rows.map(parseMaterial));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

router.post("/materials", async (req, res) => {
  try {
    const { pricePerUnit, ...rest } = req.body;
    const [mat] = await db.insert(materialsTable).values({
      ...rest,
      pricePerUnit: pricePerUnit?.toString() ?? "0",
    }).returning();
    res.status(201).json(parseMaterial(mat));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create material" });
  }
});

router.patch("/materials/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { pricePerUnit, ...rest } = req.body;
    const [mat] = await db.update(materialsTable).set({
      ...rest,
      pricePerUnit: pricePerUnit?.toString(),
    }).where(eq(materialsTable.id, id)).returning();
    if (!mat) return res.status(404).json({ error: "Material not found" });
    res.json(parseMaterial(mat));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update material" });
  }
});

router.delete("/materials/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(materialsTable).where(eq(materialsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete material" });
  }
});

export default router;
