import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, customersTable, crewMembersTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

const router = Router();

function parseProject(row: any) {
  return {
    ...row,
    squareFootage: row.squareFootage ? parseFloat(row.squareFootage) : null,
    contractValue: row.contractValue ? parseFloat(row.contractValue) : null,
    materialCost: row.materialCost ? parseFloat(row.materialCost) : null,
    laborCost: row.laborCost ? parseFloat(row.laborCost) : null,
  };
}

router.get("/projects", async (req, res) => {
  try {
    const { status, customerId, search } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        customerId: projectsTable.customerId,
        customerName: customersTable.name,
        status: projectsTable.status,
        roofType: projectsTable.roofType,
        address: projectsTable.address,
        squareFootage: projectsTable.squareFootage,
        startDate: projectsTable.startDate,
        endDate: projectsTable.endDate,
        assignedCrewId: projectsTable.assignedCrewId,
        assignedCrewName: crewMembersTable.name,
        contractValue: projectsTable.contractValue,
        materialCost: projectsTable.materialCost,
        laborCost: projectsTable.laborCost,
        notes: projectsTable.notes,
        progressPercent: projectsTable.progressPercent,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
      })
      .from(projectsTable)
      .leftJoin(customersTable, eq(projectsTable.customerId, customersTable.id))
      .leftJoin(crewMembersTable, eq(projectsTable.assignedCrewId, crewMembersTable.id))
      .orderBy(projectsTable.createdAt);
    let filtered = rows;
    if (status) filtered = filtered.filter(r => r.status === status);
    if (customerId) filtered = filtered.filter(r => r.customerId === parseInt(customerId));
    if (search) filtered = filtered.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    res.json(filtered.map(parseProject));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const { squareFootage, contractValue, materialCost, laborCost, ...rest } = req.body;
    const [project] = await db.insert(projectsTable).values({
      ...rest,
      squareFootage: squareFootage?.toString(),
      contractValue: contractValue?.toString(),
      materialCost: materialCost?.toString(),
      laborCost: laborCost?.toString(),
    }).returning();
    const [full] = await db.select({
      id: projectsTable.id,
      name: projectsTable.name,
      customerId: projectsTable.customerId,
      customerName: customersTable.name,
      status: projectsTable.status,
      roofType: projectsTable.roofType,
      address: projectsTable.address,
      squareFootage: projectsTable.squareFootage,
      startDate: projectsTable.startDate,
      endDate: projectsTable.endDate,
      assignedCrewId: projectsTable.assignedCrewId,
      assignedCrewName: crewMembersTable.name,
      contractValue: projectsTable.contractValue,
      materialCost: projectsTable.materialCost,
      laborCost: projectsTable.laborCost,
      notes: projectsTable.notes,
      progressPercent: projectsTable.progressPercent,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
    }).from(projectsTable)
      .leftJoin(customersTable, eq(projectsTable.customerId, customersTable.id))
      .leftJoin(crewMembersTable, eq(projectsTable.assignedCrewId, crewMembersTable.id))
      .where(eq(projectsTable.id, project.id));
    res.status(201).json(parseProject(full));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [project] = await db.select({
      id: projectsTable.id,
      name: projectsTable.name,
      customerId: projectsTable.customerId,
      customerName: customersTable.name,
      status: projectsTable.status,
      roofType: projectsTable.roofType,
      address: projectsTable.address,
      squareFootage: projectsTable.squareFootage,
      startDate: projectsTable.startDate,
      endDate: projectsTable.endDate,
      assignedCrewId: projectsTable.assignedCrewId,
      assignedCrewName: crewMembersTable.name,
      contractValue: projectsTable.contractValue,
      materialCost: projectsTable.materialCost,
      laborCost: projectsTable.laborCost,
      notes: projectsTable.notes,
      progressPercent: projectsTable.progressPercent,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
    }).from(projectsTable)
      .leftJoin(customersTable, eq(projectsTable.customerId, customersTable.id))
      .leftJoin(crewMembersTable, eq(projectsTable.assignedCrewId, crewMembersTable.id))
      .where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(parseProject(project));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { squareFootage, contractValue, materialCost, laborCost, ...rest } = req.body;
    await db.update(projectsTable).set({
      ...rest,
      squareFootage: squareFootage?.toString(),
      contractValue: contractValue?.toString(),
      materialCost: materialCost?.toString(),
      laborCost: laborCost?.toString(),
    }).where(eq(projectsTable.id, id));
    const [project] = await db.select({
      id: projectsTable.id,
      name: projectsTable.name,
      customerId: projectsTable.customerId,
      customerName: customersTable.name,
      status: projectsTable.status,
      roofType: projectsTable.roofType,
      address: projectsTable.address,
      squareFootage: projectsTable.squareFootage,
      startDate: projectsTable.startDate,
      endDate: projectsTable.endDate,
      assignedCrewId: projectsTable.assignedCrewId,
      assignedCrewName: crewMembersTable.name,
      contractValue: projectsTable.contractValue,
      materialCost: projectsTable.materialCost,
      laborCost: projectsTable.laborCost,
      notes: projectsTable.notes,
      progressPercent: projectsTable.progressPercent,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
    }).from(projectsTable)
      .leftJoin(customersTable, eq(projectsTable.customerId, customersTable.id))
      .leftJoin(crewMembersTable, eq(projectsTable.assignedCrewId, crewMembersTable.id))
      .where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(parseProject(project));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
