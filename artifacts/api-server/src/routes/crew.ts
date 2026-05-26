import { Router } from "express";
import { db } from "@workspace/db";
import { crewMembersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function parseCrew(row: any) {
  return {
    ...row,
    hourlyRate: row.hourlyRate ? parseFloat(row.hourlyRate) : null,
  };
}

router.get("/crew", async (req, res) => {
  try {
    const rows = await db.select().from(crewMembersTable).orderBy(crewMembersTable.createdAt);
    res.json(rows.map(parseCrew));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch crew members" });
  }
});

router.post("/crew", async (req, res) => {
  try {
    const { hourlyRate, ...rest } = req.body;
    const [crew] = await db.insert(crewMembersTable).values({
      ...rest,
      hourlyRate: hourlyRate?.toString(),
    }).returning();
    res.status(201).json(parseCrew(crew));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create crew member" });
  }
});

router.get("/crew/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [crew] = await db.select().from(crewMembersTable).where(eq(crewMembersTable.id, id));
    if (!crew) return res.status(404).json({ error: "Crew member not found" });
    res.json(parseCrew(crew));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch crew member" });
  }
});

router.patch("/crew/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { hourlyRate, ...rest } = req.body;
    const [crew] = await db.update(crewMembersTable).set({
      ...rest,
      hourlyRate: hourlyRate?.toString(),
    }).where(eq(crewMembersTable.id, id)).returning();
    if (!crew) return res.status(404).json({ error: "Crew member not found" });
    res.json(parseCrew(crew));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update crew member" });
  }
});

router.delete("/crew/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(crewMembersTable).where(eq(crewMembersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete crew member" });
  }
});

export default router;
