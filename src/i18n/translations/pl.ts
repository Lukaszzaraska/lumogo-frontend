export const pl = {
  errors: {
    network: "Can't reach the server. Check your connection and try again.",
    generic: 'Something went wrong. Please try again.',
    EMAIL_TAKEN: 'An account with this email already exists.',
    INVALID_CREDENTIALS: 'Incorrect email or password.',
    VALIDATION_ERROR: 'Please check your details and try again.',
    USER_NOT_FOUND: 'This account no longer exists. Please sign in again.',
  },
  profile: {
    title: 'Profile',
    signOut: 'Sign out',
  },
  planner: {
    finding: 'Looking for the best time…',
    noWindow: 'No good time left for this day. Try another day.',
    retry: 'Try again',
  },
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
