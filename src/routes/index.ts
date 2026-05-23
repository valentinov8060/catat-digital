import { Router } from "express";
import auditCatatanRoute from "./audit-catatan-route.js";

const router: Router = Router();

router.use("/api/v1/audit-catatan", auditCatatanRoute);

export default router;
