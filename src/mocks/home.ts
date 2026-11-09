import type { HomeConditionsData, HomeHeaderData, HomeRecommendationData } from '../types/home';

export const homeHeaderMock: HomeHeaderData = {
  currentStreakDays: 4,
  user: {
    firstName: 'Kasia',
    avatarUrl: null,
    initials: null,
  },
  location: {
    city: 'Kraków',
    region: 'Małopolska',
  },
};

export const homeRecommendationMock: HomeRecommendationData = {
  assistantName: 'Lumo',
  messageParts: [
    {
      text: "This afternoon, you’ve got perfect conditions for a walk with Tosia. The air quality is great, and the temperature is pleasant — don’t miss out!",
    },
  ],
};

export const homeConditionsMock: HomeConditionsData = {
  score: 73,
  maxScore: 100,
  temperatureCelsius: 19,
  windSpeedKmh: 12,
  humidityPercent: 61,
  airQualityIndex: 28,
};
