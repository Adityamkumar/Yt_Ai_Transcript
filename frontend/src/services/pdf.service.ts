import axiosInstance, { getApiBaseUrl } from "@/lib/axios";
import { ApiResponse, IConversation, PdfAskPayload } from "@/types";

export const pdfService = {
  uploadPdf: async (file: File): Promise<IConversation> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<ApiResponse<IConversation>>("/api/v1/pdf/upload", formData, {
      timeout: 120000,
    });
    return response.data.data;
  },

  getPdfStatus: async (documentId: string) => {
    const response = await axiosInstance.get<
      ApiResponse<{
        status: "processing" | "ready" | "failed";
        ragStatus: "processing" | "ready" | "failed";
        totalChunks: number;
        retryCount: number;
        maxRetries: number;
        cooldownUntil?: string;
      }>
    >(`/api/v1/pdf/status/${documentId}`);
    return response.data.data;
  },

  retryIngestion: async (documentId: string) => {
    const response = await axiosInstance.post<
      ApiResponse<{
        ragStatus: "processing" | "ready" | "failed";
        retryCount: number;
        maxRetries: number;
        cooldownUntil?: string;
      }>
    >(`/api/v1/pdf/retry/${documentId}`);
    return response.data.data;
  },

  askQuestion: async (payload: PdfAskPayload) => {
    const response = await axiosInstance.post("/api/v1/pdf/ask", payload);
    return response.data;
  },

  streamQuestion: async (
    payload: PdfAskPayload,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ) => {
    const url = `${getApiBaseUrl()}/api/v1/pdf/ask`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/plain",
      },
      credentials: "include",
      body: JSON.stringify({ ...payload, stream: true }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Streaming failed" }));
      throw new Error(error.message || "Streaming failed");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        onToken(chunk);
      }
    } catch (err: any) {
      reader.cancel();
      if (err?.name !== 'AbortError') throw err;
    }
  },
};

