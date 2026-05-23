import { Request, Response } from "express";
import { postAuditCatatanService } from "../services/audit-catatan-service.js";
import { logger } from "../utils/logger.js";
import { ResponseError } from "../error/response-error.js";

export const postAuditCatatanController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const financialRecordsFile = req.file!;

    logger.info(
      `Processing audit request for file: ${financialRecordsFile.originalname} (${financialRecordsFile.mimetype})`,
    );

    const result = await postAuditCatatanService(financialRecordsFile);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error(
      "There was an error in the postAuditCatatanController:",
      error,
    );

    if (error instanceof ResponseError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};
