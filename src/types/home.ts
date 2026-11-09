export type HomeHeaderData = {
  currentStreakDays: number;
  user: {
    firstName: string;
    avatarUrl: string | null;
    initials: string | null;
  };
  location: {
    city: string;
    region: string;
  };
};

export type HomeRecommendationTextPart = {
  text: string;
  emphasized?: boolean;
};

export type HomeRecommendationData = {
  assistantName: string;
  messageParts: HomeRecommendationTextPart[];
};

export type HomeConditionsStatus = 'poor' | 'moderate' | 'good';

export type HomeConditionsData = {
  score: number;
  maxScore: number;
  temperatureCelsius: number;
  windSpeedKmh: number;
  humidityPercent: number;
  airQualityIndex: number;
};

export type HomeSavedPlanData = {
  activityEmoji: string;
  activityLabel: string;
  dateLabel: string;
  endTime: string;
  startTime: string;
};
