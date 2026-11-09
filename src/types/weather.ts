export type WeatherCondition = 'sunny' | 'partlyCloudy' | 'cloudy' | 'rainy';

export type WeatherHour = {
  condition: WeatherCondition;
  precipitationPercent: number;
  temperatureCelsius: number;
  time: string;
};

export type WeatherDay = {
  airQualityIndex: number;
  condition: WeatherCondition;
  description: string;
  feelsLikeCelsius: number;
  highCelsius: number;
  hourly: WeatherHour[];
  humidityPercent: number;
  id: string;
  insight: string;
  lowCelsius: number;
  shortDate: string;
  tabLabel: string;
  temperatureCelsius: number;
  uvIndex: number;
  windSpeedKmh: number;
};
