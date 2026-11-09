const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://lumogo.onrender.com').replace(/\/$/, '');

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
  async getFaq(): Promise<FaqItem[]> {
    const response = await fetch(`${API_URL}/api/content/faq`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}).`);
    }

    return response.json();
  },

  async getPrivacy(): Promise<PrivacyData> {
    const response = await fetch(`${API_URL}/api/content/privacy`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}).`);
    }

    return response.json();
  },
};
