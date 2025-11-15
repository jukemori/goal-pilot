// Template cache for common goal types to speed up generation
export const GOAL_TEMPLATES = {
  // Language learning templates
  'learn spanish': {
    overview:
      'Master Spanish through immersive practice and structured learning',
    approach:
      'Combine vocabulary, grammar, conversation, and cultural understanding',
    phases: [
      {
        title: 'Spanish Foundations',
        weeks: 2,
        focus: 'Basic phrases, pronunciation, alphabet',
      },
      {
        title: 'Essential Grammar',
        weeks: 2,
        focus: 'Present tense, articles, basic structures',
      },
      {
        title: 'Everyday Conversations',
        weeks: 2,
        focus: 'Common situations, listening skills',
      },
      {
        title: 'Intermediate Structures',
        weeks: 2,
        focus: 'Past tenses, subjunctive introduction',
      },
      {
        title: 'Fluency Building',
        weeks: 2,
        focus: 'Complex sentences, idiomatic expressions',
      },
      {
        title: 'Advanced Practice',
        weeks: 2,
        focus: 'Native-like fluency, regional variations',
      },
    ],
  },

  // Programming templates
  'learn python': {
    overview:
      'Become proficient in Python programming from basics to advanced concepts',
    approach:
      'Hands-on coding with projects, from fundamentals to real-world applications',
    phases: [
      {
        title: 'Python Basics',
        weeks: 2,
        focus: 'Variables, data types, control flow',
      },
      {
        title: 'Functions & Modules',
        weeks: 2,
        focus: 'Functions, imports, built-in libraries',
      },
      {
        title: 'Data Structures',
        weeks: 2,
        focus: 'Lists, dictionaries, sets, algorithms',
      },
      {
        title: 'Object-Oriented Python',
        weeks: 2,
        focus: 'Classes, inheritance, design patterns',
      },
      {
        title: 'Web Development',
        weeks: 2,
        focus: 'Flask/Django basics, APIs',
      },
      {
        title: 'Advanced Topics',
        weeks: 2,
        focus: 'Async, testing, deployment',
      },
    ],
  },

  // Fitness templates
  'get fit': {
    overview:
      'Transform your fitness through progressive training and healthy habits',
    approach:
      'Balanced approach with strength, cardio, flexibility, and nutrition',
    phases: [
      {
        title: 'Foundation Building',
        weeks: 2,
        focus: 'Basic movements, form, habit formation',
      },
      {
        title: 'Strength Basics',
        weeks: 2,
        focus: 'Bodyweight exercises, light weights',
      },
      {
        title: 'Cardio Integration',
        weeks: 2,
        focus: 'Endurance building, HIIT introduction',
      },
      {
        title: 'Progressive Overload',
        weeks: 2,
        focus: 'Increasing intensity, compound movements',
      },
      {
        title: 'Advanced Training',
        weeks: 2,
        focus: 'Split routines, specialized techniques',
      },
      {
        title: 'Lifestyle Integration',
        weeks: 2,
        focus: 'Maintenance, long-term habits',
      },
    ],
  },

  // Music templates
  'learn guitar': {
    overview:
      'Master guitar playing from complete beginner to confident performer',
    approach:
      'Progressive skill building through chords, techniques, and songs',
    phases: [
      {
        title: 'Guitar Fundamentals',
        weeks: 2,
        focus: 'Holding, tuning, basic chords',
      },
      {
        title: 'Chord Mastery',
        weeks: 2,
        focus: 'Open chords, transitions, strumming',
      },
      {
        title: 'Rhythm & Timing',
        weeks: 2,
        focus: 'Strumming patterns, tempo, rhythm',
      },
      {
        title: 'Lead Techniques',
        weeks: 2,
        focus: 'Scales, single notes, basic solos',
      },
      {
        title: 'Song Repertoire',
        weeks: 2,
        focus: 'Complete songs, performance skills',
      },
      {
        title: 'Advanced Styles',
        weeks: 2,
        focus: 'Fingerpicking, barre chords, genres',
      },
    ],
  },

  // Business skills
  'public speaking': {
    overview:
      'Develop confident public speaking skills for any audience or occasion',
    approach:
      'Practice-based learning with techniques for preparation, delivery, and engagement',
    phases: [
      {
        title: 'Speaking Foundations',
        weeks: 2,
        focus: 'Overcoming fear, basic structure',
      },
      {
        title: 'Voice & Presence',
        weeks: 2,
        focus: 'Vocal techniques, body language',
      },
      {
        title: 'Content Creation',
        weeks: 2,
        focus: 'Speech writing, storytelling',
      },
      {
        title: 'Audience Engagement',
        weeks: 2,
        focus: 'Interaction, Q&A, reading the room',
      },
      {
        title: 'Advanced Delivery',
        weeks: 2,
        focus: 'Persuasion, improvisation, humor',
      },
      {
        title: 'Professional Speaking',
        weeks: 2,
        focus: 'Presentations, pitches, keynotes',
      },
    ],
  },
}

// Function to find best matching template
export function findMatchingTemplate(
  goalTitle: string,
): (typeof GOAL_TEMPLATES)[keyof typeof GOAL_TEMPLATES] | null {
  const normalizedGoal = goalTitle.toLowerCase().trim()

  // Direct match
  for (const [key, template] of Object.entries(GOAL_TEMPLATES)) {
    if (normalizedGoal.includes(key)) {
      return template
    }
  }

  // Fuzzy matching for common variations
  const goalWords = normalizedGoal.split(' ')

  // Language learning
  if (
    goalWords.some((w) =>
      [
        'spanish',
        'french',
        'german',
        'italian',
        'chinese',
        'japanese',
      ].includes(w),
    )
  ) {
    return GOAL_TEMPLATES['learn spanish'] // Use Spanish as template for all languages
  }

  // Programming
  if (
    goalWords.some((w) =>
      ['programming', 'coding', 'javascript', 'react', 'web'].includes(w),
    )
  ) {
    return GOAL_TEMPLATES['learn python'] // Use Python as template for programming
  }

  // Fitness
  if (
    goalWords.some((w) =>
      ['fitness', 'exercise', 'workout', 'gym', 'healthy', 'weight'].includes(
        w,
      ),
    )
  ) {
    return GOAL_TEMPLATES['get fit']
  }

  // Music
  if (
    goalWords.some((w) =>
      ['piano', 'violin', 'drums', 'singing', 'music'].includes(w),
    )
  ) {
    return GOAL_TEMPLATES['learn guitar'] // Use guitar as template for music
  }

  // Speaking/Communication
  if (
    goalWords.some((w) =>
      ['speaking', 'presentation', 'communication', 'confidence'].includes(w),
    )
  ) {
    return GOAL_TEMPLATES['public speaking']
  }

  return null
}
