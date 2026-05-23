import { RequestHandler } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

export const postAuditCatatanMulter = (fieldName: string): RequestHandler => {
  const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 10 } });
  return upload.single(fieldName);
};
