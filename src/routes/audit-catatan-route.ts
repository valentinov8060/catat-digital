import { Router } from "express";
import { uploadSingleFile } from "../middleware/multer-middleware.js";
import { validatePostAuditCatatanRequest } from "../validations/audit-catatan-validation.js";
import { postAuditCatatanController } from "../controllers/audit-catatan-controller.js";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/audit-catatan:
 *   post:
 *     summary: Audit financial records from images or files to google sheets
 *     description: Endpoint for auditing financial records from images or files (like receipts, cash books, etc.) using Gemini 2.0 Flash and recording results in Google Sheets.
 *     tags:
 *       - Audit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               financialRecordFile:
 *                 type: string
 *                 format: binary
 *                 description: The image or file containing the financial record to be audited.
 *     responses:
 *       200:
 *         description: Successfully audited the financial record image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_financial_record:
 *                       type: boolean
 *                       example: true
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2022-09-01"
 *                           description:
 *                             type: string
 *                             example: "Cs. Mb. Ageng 7.2kg"
 *                           amount:
 *                             type: number
 *                             example: 28800
 *                           type:
 *                             type: string
 *                             enum: [income, expense]
 *                             example: "income"
 *                     audit:
 *                       type: object
 *                       properties:
 *                         total_calculated:
 *                           type: number
 *                           example: 1090600
 *                         detected_discrepancy:
 *                           type: number
 *                           example: 0
 *                         notes:
 *                           type: string
 *                           example: "The total income (1,090,600) and total expenses (401,900) match the totals written on the document. No calculation errors detected."
 *       400:
 *         description: Invalid file upload (no file, wrong type, etc.)
 *       500:
 *         description: Internal server error during audit processing
 */
router.post(
  "/",
  uploadSingleFile("financialRecordFile"),
  validatePostAuditCatatanRequest,
  postAuditCatatanController,
);

export default router;
