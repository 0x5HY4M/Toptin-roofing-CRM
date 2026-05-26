import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/tasks", async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query as Record<string, string>;
    const rows = await db.select({
      id: tasksTable.id,
      title: tasksTable.title,
      description: tasksTable.description,
      status: tasksTable.status,
      priority: tasksTable.priority,
      projectId: tasksTable.projectId,
      projectName: projectsTable.name,
      assignedTo: tasksTable.assignedTo,
      dueDate: tasksTable.dueDate,
      completedAt: tasksTable.completedAt,
      createdAt: tasksTable.createdAt,
      updatedAt: tasksTable.updatedAt,
    }).from(tasksTable)
      .leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
      .orderBy(tasksTable.createdAt);
    let filtered = rows;
    if (projectId) filtered = filtered.filter(r => r.projectId === parseInt(projectId));
    if (assignedTo) filtered = filtered.filter(r => r.assignedTo === assignedTo);
    if (status) filtered = filtered.filter(r => r.status === status);
    res.json(filtered);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const [task] = await db.insert(tasksTable).values(req.body).returning();
    const [full] = await db.select({
      id: tasksTable.id,
      title: tasksTable.title,
      description: tasksTable.description,
      status: tasksTable.status,
      priority: tasksTable.priority,
      projectId: tasksTable.projectId,
      projectName: projectsTable.name,
      assignedTo: tasksTable.assignedTo,
      dueDate: tasksTable.dueDate,
      completedAt: tasksTable.completedAt,
      createdAt: tasksTable.createdAt,
      updatedAt: tasksTable.updatedAt,
    }).from(tasksTable)
      .leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
      .where(eq(tasksTable.id, task.id));
    res.status(201).json(full);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(tasksTable).set(req.body).where(eq(tasksTable.id, id));
    const [full] = await db.select({
      id: tasksTable.id,
      title: tasksTable.title,
      description: tasksTable.description,
      status: tasksTable.status,
      priority: tasksTable.priority,
      projectId: tasksTable.projectId,
      projectName: projectsTable.name,
      assignedTo: tasksTable.assignedTo,
      dueDate: tasksTable.dueDate,
      completedAt: tasksTable.completedAt,
      createdAt: tasksTable.createdAt,
      updatedAt: tasksTable.updatedAt,
    }).from(tasksTable)
      .leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
      .where(eq(tasksTable.id, id));
    if (!full) return res.status(404).json({ error: "Task not found" });
    res.json(full);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
