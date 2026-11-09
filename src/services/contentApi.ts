import { apiRequest } from '../api/client';

export type FaqItem = {
  question: string;
  answer: string;
};

export type PrivacySection = {
  title: string;
  content: string;
};

export type PrivacyData = {
  lastUpdated: string;
  sections: PrivacySection[];
};

export const contentApi = {
  getFaq(): Promise<FaqItem[]> {
    return apiRequest<FaqItem[]>('/api/content/faq', { auth: false });
  },

  getPrivacy(): Promise<PrivacyData> {
    return apiRequest<PrivacyData>('/api/content/privacy', { auth: false });
  },
};
