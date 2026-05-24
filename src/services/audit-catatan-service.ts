import { GoogleGenAI } from "@google/genai";
import { ResponseError } from "../error/response-error.js";
import { logger } from "../utils/logger.js";
import { generateExcelFinanceAuditBufferService } from "../services/excel-export-service.js";

// Data dummy for testing without calling the AI API. This should be removed or replaced with proper mocks in unit tests.
import auditDummyDataJson from "../../finance-report-dummy.json" with { type: "json" };

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

const auditDummyData = auditDummyDataJson.data as AuditData;

export const postAuditCatatanService = async (
  financialRecordsFile: Express.Multer.File,
): Promise<{ excelBuffer: Buffer }> => {
  // Audit preparation using AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error(
      "There was an error in the postAuditCatatanService: GEMINI_API_KEY is not set in environment variables.",
    );
    throw new ResponseError(
      500,
      "AI service is not configured properly. Please contact the administrator.",
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const model = "gemma-4-26b-a4b-it";

  const imageBase64 = financialRecordsFile.buffer.toString("base64");
  const mimeType = financialRecordsFile.mimetype;

  const systemInstruction = `You are an expert financial auditor for MSMEs.
      Your task is to audit financial documents (such as receipts, invoices, or cash books) from the provided image.

      CRITICAL RULES:
      1. Validate if the uploaded image is actually a financial record or receipt. Set "is_financial_record" to true or false accordingly.
      2. Carefully cross-check and recalculate all numbers, prices, and totals shown in the document.
      3. Identify any calculation discrepancies, mismatched numbers, or recording errors, and explain them in detail within the "audit.notes" field.
    `;

  const jsonSchema = {
    type: "OBJECT",
    properties: {
      is_financial_record: {
        type: "BOOLEAN",
        description:
          "True if the image is a receipt, invoice, ledger, or any financial record. False otherwise.",
      },
      transactions: {
        type: "ARRAY",
        description:
          "List of extracted transaction items if is_financial_record is true. Empty array if false.",
        items: {
          type: "OBJECT",
          properties: {
            date: {
              type: "STRING",
              description:
                "Format: YYYY-MM-DD. Fallback to current year if only month/date is visible.",
            },
            description: {
              type: "STRING",
              description: "Item name, service description, or purpose.",
            },
            amount: {
              type: "NUMBER",
              description: "The unit price or line total amount.",
            },
            type: { type: "STRING", enum: ["income", "expense"] },
          },
          required: ["date", "description", "amount", "type"],
        },
      },
      audit: {
        type: "OBJECT",
        description: "Audit summary and calculation verification.",
        properties: {
          total_calculated: {
            type: "NUMBER",
            description:
              "The sum of all items calculated manually by you (the AI).",
          },
          detected_discrepancy: {
            type: "NUMBER",
            description:
              "The difference between the written total on the receipt and your manual calculation. 0 if perfectly balanced.",
          },
          notes: {
            type: "STRING",
            description:
              "Detailed explanation about calculation errors, missing data, or confirmation that the math is correct.",
          },
        },
        required: ["total_calculated", "detected_discrepancy", "notes"],
      },
    },
    required: ["is_financial_record", "transactions", "audit"],
  };

  // Start audit process with the AI model
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
      "Please analyze this image, verify if it is a financial document, and audit the transactions.",
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
    },
  });

  if (!response.text) {
    logger.error(
      "There was an error in the postAuditCatatanService: AI response is empty.",
    );
    throw new ResponseError(
      500,
      "AI response is empty. Failed to audit the financial record.",
    );
  }

  const auditResult = JSON.parse(response.text.trim());

  if (!auditResult.is_financial_record) {
    logger.warn(
      "There was an error in the postAuditCatatanService: The uploaded file does not appear to be a valid financial record.",
    );
    throw new ResponseError(
      400,
      "The uploaded file does not appear to be a valid financial record. Please upload a clear image of a receipt, invoice, or ledger.",
    );
  }

  // const parsedData = JSON.parse(JSON.stringify(auditDummyData));
  const excelBuffer = await generateExcelFinanceAuditBufferService(auditResult);

  return { excelBuffer };
};
