import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import customersRouter from "./customers";
import projectsRouter from "./projects";
import estimatesRouter from "./estimates";
import invoicesRouter from "./invoices";
import crewRouter from "./crew";
import tasksRouter from "./tasks";
import eventsRouter from "./events";
import materialsRouter from "./materials";
import activityRouter from "./activity";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(customersRouter);
router.use(projectsRouter);
router.use(estimatesRouter);
router.use(invoicesRouter);
router.use(crewRouter);
router.use(tasksRouter);
router.use(eventsRouter);
router.use(materialsRouter);
router.use(activityRouter);
router.use(dashboardRouter);

export default router;
