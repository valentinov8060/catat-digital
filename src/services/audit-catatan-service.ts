import { GoogleGenAI } from "@google/genai";
import { ResponseError } from "../error/response-error.js";
import { logger } from "../utils/logger.js";
import { generateExcelAuditBufferService } from "../services/excel-export-service.js";

// Data dummy for testing without calling the AI API. This should be removed or replaced with proper mocks in unit tests.
import tableDataDummy from "../../table-data-dummy.json" with { type: "json" };

interface AuditData {
  is_table: boolean;
  headers: string[];
  rows: any[];
  audit_analysis: string;
}

const dataDummy = tableDataDummy as AuditData;

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

  const systemInstruction = `
    You are an expert data extraction engine and financial auditor.
    
    CORE TASKS:
    1. Detect if a table exists in the image. If no table is found, return {"is_table": false, "headers": [], "rows": [], "audit_analysis": null}.
    2. Dynamically extract the table headers exactly as they appear.
    3. Map each row into an object. You MUST use the extracted headers as the keys for every object in the 'rows' array.
      Example: If headers are ["Date", "Amount"], a row MUST be {"Date": "2026-05-30", "Amount": "5000"}.
    4. DO NOT return empty objects {} in the 'rows' array. Fill them with the actual data from the image cells. If a cell is empty, use null.

    FINANCIAL AUDIT LOGIC:
    - Carefully review all numeric columns (e.g., Debit, Credit, Balance, Total, Amount).
    - Perform mathematical recalculations where applicable (e.g., Previous Balance + Income/Debit - Expense/Credit = Expected Balance).
    - Cross-check row-by-row data to detect discrepancies, calculation errors, typos, or missing entries.
    - Provide a detailed summary of your findings in the 'audit_analysis' field. If the data is mathematically sound and consistent, state "Data is consistent and verified".
  `;

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
      {
        text: `
          Analyze this image, extract the table, and perform a financial audit. 
          You MUST strictly return your response in this JSON format:
          {
            "is_table": boolean,
            "headers": string[],
            "rows": object[],
            "audit_analysis": string
          }
          Ensure all rows are fully populated with keys matching the headers. Do not omit any data.
        `,
      },
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
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
  console.log(response.text.trim());

  if (!auditResult.is_table) {
    logger.warn(
      "There was an error in the postAuditCatatanService: The uploaded file does not appear to be a valid data table.",
    );
    throw new ResponseError(
      400,
      "The uploaded file does not appear to be a valid data table. Please upload a clear image of a receipt, invoice, or ledger.",
    );
  }

  // const parsedData = JSON.parse(JSON.stringify(dataDummy)) as AuditData;
  // const excelBuffer = await generateExcelAuditBufferService(parsedData);
  const excelBuffer = await generateExcelAuditBufferService(auditResult);

  return { excelBuffer };
};
