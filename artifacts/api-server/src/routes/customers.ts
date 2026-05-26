import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";

const router = Router();

router.get("/customers", async (req, res) => {
  try {
    const { search } = req.query as Record<string, string>;
    let rows;
    if (search) {
      rows = await db.select().from(customersTable).where(
        or(ilike(customersTable.name, `%${search}%`), ilike(customersTable.email, `%${search}%`))!
      ).orderBy(customersTable.createdAt);
    } else {
      rows = await db.select().from(customersTable).orderBy(customersTable.createdAt);
    }
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.post("/customers", async (req, res) => {
  try {
    const [customer] = await db.insert(customersTable).values(req.body).returning();
    res.status(201).json(customer);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

router.patch("/customers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [customer] = await db.update(customersTable).set(req.body).where(eq(customersTable.id, id)).returning();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;
