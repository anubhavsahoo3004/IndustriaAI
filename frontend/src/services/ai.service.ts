import { request } from './api';
import { AiAssistantResponse, DocumentValidationResult } from '../types';

export const AiService = {
  askAssistant: async (
    query: string,
    businessId?: number,
    applicationId?: number,
    conversationHistory: Array<{ role: string; text: string }> = []
  ): Promise<AiAssistantResponse> => {
    return request<AiAssistantResponse>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({
        query,
        business_id: businessId,
        application_id: applicationId,
        conversation_history: conversationHistory,
      }),
    });
  },

  analyzeDocument: async (documentId: number, businessId?: number): Promise<DocumentValidationResult> => {
    return request<DocumentValidationResult>('/ai/analyze-document', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId, business_id: businessId }),
    });
  },
};
