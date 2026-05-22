import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const auditCatatan = async (imageBase64: string, mimeType: string): Promise<any> => {
  const model = 'gemini-2.0-flash';
  
  const systemInstruction = `Kamu adalah asisten ahli keuangan untuk UMKM. Tugasmu adalah mengaudit catatan keuangan (seperti nota atau buku kas) dari gambar yang diberikan.
Kembalikan respon hanya dalam bentuk JSON object murni, tanpa markdown code blocks (\`\`\`json) atau teks pengantar lainnya.

Format JSON yang diharapkan:
{
  "transaksi": [
    {
      "tanggal": "YYYY-MM-DD",
      "deskripsi": "Deskripsi transaksi",
      "jumlah": 100000,
      "tipe": "pemasukan/pengeluaran"
    }
  ],
  "audit": {
    "total_kalkulasi": 100000,
    "selisih_terdeteksi": 0,
    "catatan": "Catatan hasil audit jika ada selisih salah hitung atau tidak"
  }
}`;

  try {
    const response = await genai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            },
            {
              text: 'Tolong audit catatan keuangan dari gambar ini.'
            }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    let jsonStr = response.text;
    // Bersihkan code block markdown jika ada
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.substring(7);
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      }
    } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith("```")) {
          jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
    }

    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
