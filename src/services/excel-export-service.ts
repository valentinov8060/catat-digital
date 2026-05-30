import ExcelJS from "exceljs";
import { logger } from "../utils/logger.js";

interface AuditData {
  is_table: boolean;
  headers: string[];
  rows: Record<string, any>[];
  audit_analysis: string;
}

export const generateExcelAuditBufferService = async (
  data: AuditData,
): Promise<Buffer> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Extracted Table");

    /**
     * 1. HEADER (DINAMIS)
     */
    const headerRow = worksheet.addRow(data.headers);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "5B3F86" },
      };
      cell.alignment = { wrapText: true };
    });

    /**
     * 2. ROWS (DINAMIS)
     */
    data.rows.forEach((rowObj) => {
      // normalize empty cells and maintain the order of headers
      const rowValues = data.headers.map((header) => {
        const val = rowObj[header];

        // normalize empty
        if (val === "" || val === undefined) return null;

        return val;
      });

      const row = worksheet.addRow(rowValues);

      // formatting number cells and wrap text for all cells
      row.eachCell((cell) => {
        if (typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }

        cell.alignment = { wrapText: true };
      });
    });

    /**
     * 3. AUTO WIDTH
     */
    worksheet.columns.forEach((column) => {
      let maxLen = 10;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString().length : 0;
        if (val > maxLen) maxLen = val;
      });
      column.width = maxLen + 2;
    });

    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    return buffer;
  } catch (error) {
    logger.error("Error in generateExcelAuditBufferService:", error);
    throw error;
  }
};
