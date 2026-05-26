import { Router } from "express";
import { db } from "@workspace/db";
import { calendarEventsTable, projectsTable, crewMembersTable, customersTable } from "@workspace/db";
import { eq, gte, lte, and } from "drizzle-orm";

const router = Router();

const eventSelect = {
  id: calendarEventsTable.id,
  title: calendarEventsTable.title,
  description: calendarEventsTable.description,
  type: calendarEventsTable.type,
  startTime: calendarEventsTable.startTime,
  endTime: calendarEventsTable.endTime,
  projectId: calendarEventsTable.projectId,
  projectName: projectsTable.name,
  crewId: calendarEventsTable.crewId,
  crewName: crewMembersTable.name,
  customerId: calendarEventsTable.customerId,
  customerName: customersTable.name,
  location: calendarEventsTable.location,
  status: calendarEventsTable.status,
  createdAt: calendarEventsTable.createdAt,
  updatedAt: calendarEventsTable.updatedAt,
};

router.get("/events", async (req, res) => {
  try {
    const rows = await db.select(eventSelect)
      .from(calendarEventsTable)
      .leftJoin(projectsTable, eq(calendarEventsTable.projectId, projectsTable.id))
      .leftJoin(crewMembersTable, eq(calendarEventsTable.crewId, crewMembersTable.id))
      .leftJoin(customersTable, eq(calendarEventsTable.customerId, customersTable.id))
      .orderBy(calendarEventsTable.startTime);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const [event] = await db.insert(calendarEventsTable).values(req.body).returning();
    const [full] = await db.select(eventSelect)
      .from(calendarEventsTable)
      .leftJoin(projectsTable, eq(calendarEventsTable.projectId, projectsTable.id))
      .leftJoin(crewMembersTable, eq(calendarEventsTable.crewId, crewMembersTable.id))
      .leftJoin(customersTable, eq(calendarEventsTable.customerId, customersTable.id))
      .where(eq(calendarEventsTable.id, event.id));
    res.status(201).json(full);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(calendarEventsTable).set(req.body).where(eq(calendarEventsTable.id, id));
    const [full] = await db.select(eventSelect)
      .from(calendarEventsTable)
      .leftJoin(projectsTable, eq(calendarEventsTable.projectId, projectsTable.id))
      .leftJoin(crewMembersTable, eq(calendarEventsTable.crewId, crewMembersTable.id))
      .leftJoin(customersTable, eq(calendarEventsTable.customerId, customersTable.id))
      .where(eq(calendarEventsTable.id, id));
    if (!full) return res.status(404).json({ error: "Event not found" });
    res.json(full);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
