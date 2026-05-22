import { Request, Response } from 'express';
import { auditCatatan } from '../services/audit-catatan-service.js';

export const auditCatatanController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Tidak ada gambar yang diunggah' });
      return;
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const base64Image = fileBuffer.toString('base64');

    const auditResult = await auditCatatan(base64Image, mimeType);

    res.status(200).json({
      success: true,
      data: auditResult
    });
  } catch (error: any) {
    console.error("Audit Controller Error:", error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat memproses gambar',
      details: error.message
    });
  }
};
