import type { WeatherCondition, WeatherDay } from '../types/weather';

const forecasts: Array<{
  condition: WeatherCondition;
  description: string;
  highCelsius: number;
  hourlyTemperatures: number[];
  insight: string;
  lowCelsius: number;
  precipitation: number[];
  temperatureCelsius: number;
}> = [
  { condition: 'sunny', description: 'Sunny and pleasant', highCelsius: 20, hourlyTemperatures: [16, 18, 20, 19, 17], insight: 'A bright, comfortable day. The afternoon is ideal for a longer walk.', lowCelsius: 11, precipitation: [0, 0, 0, 5, 5], temperatureCelsius: 19 },
  { condition: 'partlyCloudy', description: 'Partly cloudy', highCelsius: 18, hourlyTemperatures: [14, 16, 18, 17, 15], insight: 'Clouds will build later, but conditions stay dry and comfortable.', lowCelsius: 10, precipitation: [5, 5, 10, 10, 15], temperatureCelsius: 17 },
  { condition: 'rainy', description: 'Light showers', highCelsius: 15, hourlyTemperatures: [12, 14, 15, 14, 13], insight: 'A few showers are likely. The driest window should be around midday.', lowCelsius: 9, precipitation: [35, 25, 20, 40, 55], temperatureCelsius: 14 },
];

const hourlyTimes = ['09:00', '12:00', '15:00', '18:00', '21:00'];

export const weatherForecastMock: WeatherDay[] = forecasts.map((forecast, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index);

  return {
    airQualityIndex: 28 + index * 7,
    condition: forecast.condition,
    description: forecast.description,
    feelsLikeCelsius: forecast.temperatureCelsius - 1,
    highCelsius: forecast.highCelsius,
    hourly: hourlyTimes.map((time, hourIndex) => ({ condition: hourIndex > 2 && index === 2 ? 'rainy' : forecast.condition, precipitationPercent: forecast.precipitation[hourIndex], temperatureCelsius: forecast.hourlyTemperatures[hourIndex], time })),
    humidityPercent: 58 + index * 7,
    id: date.toISOString().slice(0, 10),
    insight: forecast.insight,
    lowCelsius: forecast.lowCelsius,
    shortDate: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    tabLabel: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-GB', { weekday: 'short' }),
    temperatureCelsius: forecast.temperatureCelsius,
    uvIndex: Math.max(1, 4 - index),
    windSpeedKmh: 10 + index * 3,
  };
});
