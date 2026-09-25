import { request } from './api';
import { DocumentItem, DocumentValidationResult } from '../types';

export const DocumentService = {
  listByBusiness: async (businessId: number): Promise<DocumentItem[]> => {
    return request<DocumentItem[]>(`/documents?business_id=${businessId}`);
  },

  upload: async (businessId: number, documentType: string, file: File, applicationId?: number): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('business_id', businessId.toString());
    formData.append('document_type', documentType);
    formData.append('file', file);
    if (applicationId) {
      formData.append('application_id', applicationId.toString());
    }

    return request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  validate: async (documentId: number): Promise<DocumentValidationResult> => {
    return request<DocumentValidationResult>(`/documents/${documentId}/validate`, {
      method: 'POST',
    });
  },

  attach: async (documentId: number, applicationId: number, isMandatory = true): Promise<{ status: string }> => {
    return request<{ status: string }>('/documents/attach', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId, application_id: applicationId, is_mandatory: isMandatory }),
    });
  },
};
