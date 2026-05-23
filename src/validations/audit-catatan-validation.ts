import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const validatePostAuditCatatanRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Validate that a file was uploaded
  if (!req.file) {
    logger.warn(
      "There was a request to audit catatan without an uploaded file.",
    );
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  // Validate file type
  const mimeType = req.file.mimetype;

  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";

  if (!isImage && !isPdf) {
    logger.warn(`User tried to upload an invalid file type: ${mimeType}`);
    res.status(400).json({
      error:
        "Invalid file type. Only images (PNG, JPG, WEBP) and PDF files are allowed.",
    });
    return;
  }

  next();
};
