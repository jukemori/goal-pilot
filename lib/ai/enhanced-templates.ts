// Enhanced templates with detailed phase information and personalization
interface EnhancedPhase {
  title: string
  weeks: number
  description: string
  skills_to_learn: string[]
  learning_objectives: string[]
  key_concepts: string[]
  daily_activities: string[]
  resources: string[]
  milestones: string[]
}

interface EnhancedTemplate {
  overview: string
  approach: string
  total_estimated_hours: number
  difficulty_factors: string[]
  prerequisites: string[]
  phases: EnhancedPhase[]
  success_metrics: string[]
  common_challenges: string[]
}

export const ENHANCED_TEMPLATES: Record<string, EnhancedTemplate> = {
  'learn spanish': {
    overview: 'Master Spanish through immersive practice, structured grammar learning, and cultural immersion to achieve conversational fluency',
    approach: 'Progressive methodology combining vocabulary acquisition, grammar mastery, listening comprehension, speaking practice, and cultural understanding',
    total_estimated_hours: 200,
    difficulty_factors: ['Grammar complexity', 'Pronunciation variations', 'Verb conjugations', 'Regional differences'],
    prerequisites: ['Basic language learning concepts', 'Dedicated practice time', 'Access to Spanish media'],
    phases: [
      {
        title: 'Spanish Foundations',
        weeks: 2,
        description: 'Establish fundamental Spanish language skills including pronunciation, basic vocabulary, and essential phrases for daily communication',
        skills_to_learn: ['Spanish alphabet and pronunciation', 'Basic greetings and introductions', 'Numbers 1-100', 'Essential everyday vocabulary'],
        learning_objectives: ['Pronounce Spanish sounds correctly', 'Introduce yourself in Spanish', 'Count and use numbers in context', 'Recognize common Spanish words'],
        key_concepts: ['Spanish phonetics', 'Gender of nouns', 'Basic sentence structure', 'Formal vs informal address'],
        daily_activities: ['Pronunciation practice with audio', 'Vocabulary flashcards (50 new words/week)', 'Listen to basic Spanish conversations', 'Practice greetings and introductions'],
        resources: ['Spanish pronunciation guide', 'Basic vocabulary app', 'Beginner audio lessons', 'Spanish alphabet chart'],
        milestones: ['Master Spanish pronunciation', 'Learn 100 essential words', 'Have basic 2-minute conversation']
      },
      {
        title: 'Essential Grammar',
        weeks: 2,
        description: 'Master fundamental Spanish grammar including present tense verbs, articles, and basic sentence construction',
        skills_to_learn: ['Present tense conjugation', 'Definite and indefinite articles', 'Adjective agreement', 'Question formation'],
        learning_objectives: ['Conjugate regular verbs in present tense', 'Use articles correctly with nouns', 'Form basic questions and statements', 'Describe people and objects'],
        key_concepts: ['Verb conjugation patterns', 'Noun-adjective agreement', 'Ser vs estar usage', 'Question words (interrogatives)'],
        daily_activities: ['Conjugation practice exercises', 'Sentence construction drills', 'Grammar rule memorization', 'Simple conversation practice'],
        resources: ['Spanish grammar workbook', 'Conjugation practice app', 'Grammar explanation videos', 'Sentence building exercises'],
        milestones: ['Conjugate 20 common verbs', 'Form 10 different question types', 'Describe yourself and family']
      },
      {
        title: 'Everyday Conversations',
        weeks: 2,
        description: 'Develop practical conversation skills for common daily situations including shopping, dining, and social interactions',
        skills_to_learn: ['Restaurant ordering', 'Shopping vocabulary', 'Asking for directions', 'Making appointments'],
        learning_objectives: ['Order food in Spanish restaurants', 'Shop for basic items', 'Navigate using Spanish directions', 'Schedule meetings and appointments'],
        key_concepts: ['Polite expressions and courtesy', 'Cultural context in conversations', 'Indirect object pronouns', 'Present progressive tense'],
        daily_activities: ['Role-play restaurant scenarios', 'Practice shopping dialogues', 'Listen to native conversations', 'Record speaking practice'],
        resources: ['Conversation practice videos', 'Cultural etiquette guide', 'Restaurant menu vocabulary', 'Direction-giving exercises'],
        milestones: ['Complete 5-minute restaurant interaction', 'Ask and give directions', 'Make phone calls in Spanish']
      },
      {
        title: 'Intermediate Structures',
        weeks: 2,
        description: 'Advance to complex grammar including past tenses, subjunctive mood introduction, and sophisticated sentence structures',
        skills_to_learn: ['Preterite and imperfect tenses', 'Subjunctive mood basics', 'Complex sentence formation', 'Idiomatic expressions'],
        learning_objectives: ['Narrate past events accurately', 'Express opinions and emotions', 'Use conditional statements', 'Understand cultural idioms'],
        key_concepts: ['Preterite vs imperfect usage', 'Subjunctive triggers', 'Complex subordinate clauses', 'Register and formality levels'],
        daily_activities: ['Past tense storytelling', 'Opinion expression practice', 'Idiom memorization', 'Complex text reading'],
        resources: ['Intermediate grammar guide', 'Spanish news articles', 'Opinion expression worksheets', 'Idiom dictionary'],
        milestones: ['Tell complete stories in past tense', 'Express complex opinions', 'Understand intermediate texts']
      },
      {
        title: 'Fluency Building',
        weeks: 2,
        description: 'Achieve conversational fluency through advanced grammar, extensive vocabulary, and natural expression patterns',
        skills_to_learn: ['Advanced subjunctive uses', 'Complex verb tenses', 'Sophisticated vocabulary', 'Natural speech patterns'],
        learning_objectives: ['Engage in hour-long conversations', 'Understand rapid native speech', 'Express abstract concepts', 'Use humor and wordplay'],
        key_concepts: ['Advanced subjunctive applications', 'Conditional perfect tenses', 'Stylistic language variations', 'Discourse markers'],
        daily_activities: ['Extended conversation practice', 'Advanced listening exercises', 'Academic text reading', 'Debate and discussion'],
        resources: ['Advanced conversation groups', 'Spanish podcasts and news', 'Literature excerpts', 'Debate topic lists'],
        milestones: ['Sustain 30-minute conversations', 'Understand TV shows without subtitles', 'Read intermediate literature']
      },
      {
        title: 'Advanced Practice',
        weeks: 2,
        description: 'Refine language skills to near-native level with focus on regional variations, professional communication, and cultural nuances',
        skills_to_learn: ['Regional dialect differences', 'Professional terminology', 'Academic writing', 'Cultural subtleties'],
        learning_objectives: ['Communicate professionally in Spanish', 'Understand multiple Spanish dialects', 'Write formal documents', 'Appreciate cultural humor and references'],
        key_concepts: ['Dialectal variations across regions', 'Professional communication styles', 'Academic and formal registers', 'Cultural references and humor'],
        daily_activities: ['Professional presentation practice', 'Dialect comparison exercises', 'Formal writing assignments', 'Cultural immersion activities'],
        resources: ['Regional accent training', 'Business Spanish course', 'Academic writing guide', 'Cultural documentary series'],
        milestones: ['Give professional presentations', 'Write formal business letters', 'Understand multiple dialects']
      }
    ],
    success_metrics: ['Pass DELE B2 level exam', 'Sustain 1-hour conversations', 'Read Spanish novels', 'Write formal emails'],
    common_challenges: ['Verb conjugation complexity', 'Speaking confidence', 'Listening to rapid speech', 'Cultural context understanding']
  },

  'learn python': {
    overview: 'Master Python programming from complete beginner to building real-world applications with professional development practices',
    approach: 'Project-based learning with hands-on coding, theoretical understanding, and practical application development',
    total_estimated_hours: 180,
    difficulty_factors: ['Abstract programming concepts', 'Problem-solving logic', 'Debugging skills', 'Object-oriented thinking'],
    prerequisites: ['Basic computer literacy', 'Logical thinking skills', 'Access to computer and internet'],
    phases: [
      {
        title: 'Python Fundamentals',
        weeks: 2,
        description: 'Establish core Python programming skills including syntax, data types, variables, and basic program flow control',
        skills_to_learn: ['Python syntax and indentation', 'Variables and data types', 'Input/output operations', 'Basic operators'],
        learning_objectives: ['Write simple Python programs', 'Use variables effectively', 'Handle user input and output', 'Understand Python syntax rules'],
        key_concepts: ['Python interpreter', 'Dynamic typing', 'Indentation significance', 'Print and input functions'],
        daily_activities: ['Write 5 small programs daily', 'Practice syntax exercises', 'Debug simple errors', 'Code reading exercises'],
        resources: ['Python official tutorial', 'Interactive coding platform', 'Syntax reference guide', 'Beginner project ideas'],
        milestones: ['Create calculator program', 'Build simple guessing game', 'Handle user input validation']
      },
      {
        title: 'Control Flow & Functions',
        weeks: 2,
        description: 'Master program control structures including loops, conditionals, and function creation for code organization',
        skills_to_learn: ['If/else statements', 'For and while loops', 'Function definition and calling', 'Parameter passing'],
        learning_objectives: ['Create complex program logic', 'Write reusable functions', 'Handle different data scenarios', 'Organize code effectively'],
        key_concepts: ['Boolean logic', 'Loop iteration', 'Function scope', 'Return values and parameters'],
        daily_activities: ['Algorithm implementation', 'Function writing practice', 'Logic puzzle solving', 'Code refactoring exercises'],
        resources: ['Algorithm visualization tools', 'Function design patterns', 'Logic puzzle collections', 'Code review examples'],
        milestones: ['Build text-based adventure game', 'Create utility function library', 'Solve 20 coding challenges']
      },
      {
        title: 'Data Structures',
        weeks: 2,
        description: 'Learn to work with Python\'s built-in data structures and implement basic algorithms for data manipulation',
        skills_to_learn: ['Lists and list comprehensions', 'Dictionaries and sets', 'String manipulation', 'File handling'],
        learning_objectives: ['Manipulate complex data sets', 'Choose appropriate data structures', 'Process text files', 'Implement search algorithms'],
        key_concepts: ['Mutable vs immutable types', 'Dictionary key-value pairs', 'List comprehension syntax', 'File I/O operations'],
        daily_activities: ['Data processing exercises', 'Algorithm implementation', 'File manipulation tasks', 'Data structure challenges'],
        resources: ['Data structure visualization', 'Algorithm practice platform', 'File processing tutorials', 'Real dataset examples'],
        milestones: ['Build contact management system', 'Create data analysis tool', 'Process CSV files']
      },
      {
        title: 'Object-Oriented Programming',
        weeks: 2,
        description: 'Master object-oriented programming concepts including classes, inheritance, and design patterns',
        skills_to_learn: ['Class definition and instantiation', 'Inheritance and polymorphism', 'Encapsulation principles', 'Design patterns'],
        learning_objectives: ['Design class hierarchies', 'Implement inheritance structures', 'Apply OOP principles', 'Create maintainable code'],
        key_concepts: ['Class vs instance attributes', 'Method overriding', 'Abstract classes', 'Composition vs inheritance'],
        daily_activities: ['Class design exercises', 'Inheritance practice', 'Design pattern implementation', 'Code architecture review'],
        resources: ['OOP design guide', 'Design pattern examples', 'UML diagram tools', 'Object modeling exercises'],
        milestones: ['Build inventory management system', 'Create game with multiple classes', 'Implement design patterns']
      },
      {
        title: 'Web Development Basics',
        weeks: 2,
        description: 'Introduction to web development using Python frameworks and API integration',
        skills_to_learn: ['Flask framework basics', 'HTTP request handling', 'Template rendering', 'API consumption'],
        learning_objectives: ['Build simple web applications', 'Handle web requests', 'Create dynamic content', 'Integrate external APIs'],
        key_concepts: ['HTTP protocol basics', 'MVC architecture', 'Template engines', 'RESTful API principles'],
        daily_activities: ['Web app development', 'API integration practice', 'Frontend-backend connection', 'Database integration'],
        resources: ['Flask documentation', 'Web development tutorials', 'API documentation examples', 'Database integration guides'],
        milestones: ['Create personal portfolio website', 'Build REST API', 'Integrate third-party services']
      },
      {
        title: 'Advanced Topics',
        weeks: 2,
        description: 'Explore advanced Python concepts including testing, debugging, and deployment practices',
        skills_to_learn: ['Unit testing with pytest', 'Debugging techniques', 'Package management', 'Deployment strategies'],
        learning_objectives: ['Write comprehensive tests', 'Debug complex issues', 'Manage project dependencies', 'Deploy applications'],
        key_concepts: ['Test-driven development', 'Virtual environments', 'Package distribution', 'Production deployment'],
        daily_activities: ['Test writing practice', 'Debugging exercises', 'Package creation', 'Deployment tutorials'],
        resources: ['Testing framework docs', 'Debugging tool guides', 'Package management tutorials', 'Deployment platforms'],
        milestones: ['Create tested Python package', 'Deploy web application', 'Contribute to open source']
      }
    ],
    success_metrics: ['Build complete web application', 'Write well-tested code', 'Deploy to production', 'Contribute to projects'],
    common_challenges: ['Understanding OOP concepts', 'Debugging logical errors', 'Managing project complexity', 'Learning framework specifics']
  }
}

export function findEnhancedTemplate(goalTitle: string): EnhancedTemplate | null {
  const normalizedGoal = goalTitle.toLowerCase().trim()
  
  // Direct match
  for (const [key, template] of Object.entries(ENHANCED_TEMPLATES)) {
    if (normalizedGoal.includes(key)) {
      return template
    }
  }
  
  // Fuzzy matching for common variations
  const goalWords = normalizedGoal.split(' ')
  
  // Language learning
  if (goalWords.some(w => ['spanish', 'french', 'german', 'italian', 'chinese', 'japanese'].includes(w))) {
    return ENHANCED_TEMPLATES['learn spanish']
  }
  
  // Programming
  if (goalWords.some(w => ['programming', 'coding', 'javascript', 'react', 'web', 'python'].includes(w))) {
    return ENHANCED_TEMPLATES['learn python']
  }
  
  return null
}

// Function to personalize template based on user context
export function personalizeTemplate(
  template: EnhancedTemplate,
  userContext: {
    currentLevel: string
    timeCommitment: number
    targetDate?: string
    specificInterests?: string[]
  }
): EnhancedTemplate {
  const personalizedTemplate = { ...template }
  
  // Adjust overview based on current level
  if (userContext.currentLevel.toLowerCase().includes('beginner')) {
    personalizedTemplate.overview = personalizedTemplate.overview.replace(
      'Master',
      'Learn the fundamentals of'
    )
  } else if (userContext.currentLevel.toLowerCase().includes('intermediate')) {
    personalizedTemplate.overview = personalizedTemplate.overview.replace(
      'from complete beginner',
      'building on your existing knowledge'
    )
  }
  
  // Adjust time estimates based on daily commitment
  const timeMultiplier = userContext.timeCommitment < 30 ? 1.5 : userContext.timeCommitment > 60 ? 0.8 : 1
  personalizedTemplate.total_estimated_hours = Math.round(template.total_estimated_hours * timeMultiplier)
  
  // Adjust phase durations if needed
  if (timeMultiplier !== 1) {
    personalizedTemplate.phases = template.phases.map(phase => ({
      ...phase,
      weeks: Math.max(1, Math.round(phase.weeks * timeMultiplier))
    }))
  }
  
  return personalizedTemplate
}