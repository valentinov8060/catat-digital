import { RequestHandler } from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadSingleFile = (fieldName: string): RequestHandler => {
  return upload.single(fieldName);
};
