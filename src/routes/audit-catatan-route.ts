import { Router } from 'express';
import multer from 'multer';
import { auditCatatanController } from '../controllers/audit-catatan-controller.js';

const router: Router = Router();

// Konfigurasi multer untuk menyimpannya di memory buffer (karena kita akan merubah ke base64)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /api/v1/audit-catatan:
 *   post:
 *     summary: Audit catatan keuangan dari gambar
 *     description: Mengunggah gambar nota atau buku kas untuk diaudit oleh AI dan mengembalikan data terstruktur beserta hasil audit.
 *     tags:
 *       - Audit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File gambar catatan keuangan (nota, buku kas, dll)
 *     responses:
 *       200:
 *         description: Berhasil mengaudit gambar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaksi:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tanggal:
 *                             type: string
 *                           deskripsi:
 *                             type: string
 *                           jumlah:
 *                             type: number
 *                           tipe:
 *                             type: string
 *                     audit:
 *                       type: object
 *                       properties:
 *                         total_kalkulasi:
 *                           type: number
 *                         selisih_terdeteksi:
 *                           type: number
 *                         catatan:
 *                           type: string
 *       400:
 *         description: Permintaan tidak valid (misal tidak ada file)
 *       500:
 *         description: Kesalahan pada server
 */
router.post('/', upload.single('image'), auditCatatanController);

export default router;
