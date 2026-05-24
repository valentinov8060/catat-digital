import { Router } from "express";
import auditCatatanRoute from "./audit-catatan-route.js";
import viewRoute from "./view-route.js";

const router: Router = Router();

router.use("/api/v1/audit-catatan", auditCatatanRoute);
router.use(viewRoute);

export default router;
