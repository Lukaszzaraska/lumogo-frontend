export const pl = {
  home: {
    header: {
      greeting: 'Hi, {{firstName}}!',
      avatarAccessibilityLabel: 'Open profile',
    },
    conditions: {
      title: 'Current conditions:',
      pointsSuffix: 'out of {{maxScore}}',
      status: {
        good: 'Good',
        moderate: 'Fair',
        poor: 'Poor',
      },
      metrics: {
        temperature: 'Temperature:',
        wind: 'Wind:',
        humidity: 'Humidity:',
        airQuality: 'Air quality:',
      },
    },
    planner: {
      title: 'When should you head out?',
      description: 'Let Lumo find the best weather window for your plans.',
      button: 'Find the best time!',
      buttonAccessibilityLabel: 'Find the best time to head out',
    },
    savedPlan: {
      title: 'Your next adventure',
      status: 'Upcoming',
      temperature: 'Pleasant',
      wind: 'Light wind',
      windValue: '3 km/h',
      airQuality: 'Good',
      airQualityValue: 'air quality',
    },
  },
  chat: {
    header: {
      title: 'Weather window planner',
      subtitle: 'Find the best time to head outside.',
    },
    steps: {
      activity: {
        question: 'Hi {{firstName}}, what do you want to do today?',
        options: {
          walking: 'Walking',
          running: 'Running',
          gardening: 'Gardening',
          cycling: 'Cycling',
          dogWalk: 'Dog walk',
          outdoorPlans: 'Outdoor plans',
        },
      },
    },
  },
  add: {
    title: 'Dodaj',
  },
} as const;
