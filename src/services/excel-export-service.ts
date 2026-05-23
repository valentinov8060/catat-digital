import Workbook from "exceljs";
import { logger } from "../utils/logger.js";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

interface AuditData {
  is_financial_record: boolean;
  transactions: Transaction[];
  audit: {
    total_calculated: number;
    detected_discrepancy: number;
    notes: string;
  };
}

export const generateExcelFinanceAuditBufferService = async (
  data: AuditData,
): Promise<Buffer> => {
  try {
    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet("Financial Audit");

    // Make header row
    const headerRow = worksheet.getRow(1);
    headerRow.values = ["Tanggal", "Deskripsi", "Jumlah", "Jenis"];
    for (let i = 1; i <= 4; i++) {
      const cell = headerRow.getCell(i);
      cell.font = { bold: true, color: { argb: "ffffff" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "5b3f86" },
      };
    }

    // Input data from AI
    data.transactions.forEach((tx) => {
      const row = worksheet.addRow([
        tx.date,
        tx.description,
        tx.amount,
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      ]);

      // Give different background color for income vs expense
      const typeCell = row.getCell(4);
      if (tx.type === "income") {
        typeCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "E2EFDA" },
        };
      } else {
        typeCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FCE4D6" },
        };
      }

      // Format amount as currency
      row.getCell(3).numFmt = "#,##0";
    });

    // Total balance
    const totalBalanceHeaderCell = worksheet.getCell("F3");
    totalBalanceHeaderCell.value = "Total Saldo";
    totalBalanceHeaderCell.font = { bold: true, color: { argb: "ffffff" } };
    totalBalanceHeaderCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "5b3f86" },
    };

    const totalBalanceCell = worksheet.getCell("F4");
    totalBalanceCell.value = {
      formula: 'SUMIF(D:D, "Pemasukan", C:C) - SUMIF(D:D, "Pengeluaran", C:C)',
    };
    totalBalanceCell.numFmt = "#,##0";
    totalBalanceCell.font = { bold: true };

    // Optimize column widths based on content
    worksheet.columns.forEach((column) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const valLen = cell.value ? cell.value.toString().length : 0;
        if (valLen > maxLen) maxLen = valLen;
      });
      column.width = maxLen + 3;
    });

    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    return buffer;
  } catch (error) {
    logger.error("There was an error in the generateExcelBuffer:", error);
    throw error;
  }
};
