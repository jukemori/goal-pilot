export interface GoalTemplate {
  id: string;
  category:
    | "programming"
    | "language"
    | "fitness"
    | "business"
    | "creative"
    | "academic";
  title: string;
  description: string;
  suggested_current_levels: string[];
  default_time_commitment: number; // minutes
  estimated_duration_weeks: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string; // lucide icon name
  tags: string[];
  sample_milestones: string[];
  default_weekly_schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  suggested_target_date_weeks?: number; // weeks from start date
  customization_notes: string; // Helpful text for users
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Programming Templates
  {
    id: "web-dev-beginner",
    category: "programming",
    title: "Learn Web Development (Beginner)",
    description:
      "Master HTML, CSS, and JavaScript fundamentals to build modern, responsive websites from scratch",
    suggested_current_levels: [
      "Complete beginner with no coding experience - I want to learn web development from the ground up",
      "Some basic HTML/CSS knowledge from tutorials or school - ready to build on fundamentals",
      "Familiar with computers and basic web browsing - new to programming but eager to learn",
    ],
    default_time_commitment: 60,
    estimated_duration_weeks: 16,
    difficulty: "beginner",
    icon: "Code",
    tags: ["HTML", "CSS", "JavaScript", "Frontend"],
    sample_milestones: [
      "HTML fundamentals and semantic markup structure",
      "CSS styling, layouts, and responsive design principles",
      "JavaScript basics, variables, functions, and DOM manipulation",
      "Build and deploy first interactive portfolio website",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    suggested_target_date_weeks: 16,
    customization_notes:
      'Feel free to adjust the time commitment based on your schedule. This template works well for 4-5 days per week. You can modify the title to be more specific (e.g., "Build My First Portfolio Website") and adjust the current level description to match your exact experience.',
  },
  {
    id: "python-programming",
    category: "programming",
    title: "Master Python Programming Fundamentals",
    description:
      "Learn Python from basics to building real-world applications including data analysis and automation scripts",
    suggested_current_levels: [
      "No programming experience - complete beginner wanting to start with Python as my first language",
      "Some experience with other programming languages (Java, C++, etc.) - ready to learn Python syntax and concepts",
      "Basic understanding of programming concepts - have done some coding exercises or online tutorials",
    ],
    default_time_commitment: 45,
    estimated_duration_weeks: 12,
    difficulty: "beginner",
    icon: "Code2",
    tags: ["Python", "Programming", "Backend", "Data"],
    sample_milestones: [
      "Python syntax, variables, data types, and basic input/output",
      "Control structures (if/else, loops) and function definitions",
      "Data structures (lists, dictionaries, sets) and file handling",
      "Object-oriented programming concepts and building complete applications",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: true,
      sunday: false,
    },
    suggested_target_date_weeks: 12,
    customization_notes:
      'This template is designed for 4 days per week with focused practice sessions. You can adjust the title to be more specific to your goals (e.g., "Learn Python for Data Analysis" or "Python for Web Development"). The schedule can be modified to fit your availability - many students prefer consistent daily practice or intensive weekend sessions.',
  },
  {
    id: "react-development",
    category: "programming",
    title: "Build Modern Web Apps with React",
    description:
      "Master React.js to create dynamic, interactive web applications with modern JavaScript and component-based architecture",
    suggested_current_levels: [
      "Know HTML, CSS, and basic JavaScript - have built simple websites and understand DOM manipulation",
      "Some experience with JavaScript frameworks (Vue, Angular) or libraries - ready to dive deeper into React",
      "Comfortable with ES6+ features (arrow functions, destructuring, modules) - understand modern JavaScript",
    ],
    default_time_commitment: 90,
    estimated_duration_weeks: 10,
    difficulty: "intermediate",
    icon: "Zap",
    tags: ["React", "JavaScript", "Frontend", "Components"],
    sample_milestones: [
      "React fundamentals, JSX syntax, and component creation",
      "State management, hooks (useState, useEffect), and event handling",
      "Component composition, props patterns, and data flow",
      "Build and deploy a complete React application with routing",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
    suggested_target_date_weeks: 10,
    customization_notes:
      'This intensive template assumes you already know JavaScript basics. You can adjust the time commitment (90min sessions work well for React practice) and modify the title based on your project goals (e.g., "Build an E-commerce App with React"). Consider your JavaScript comfort level when setting your current level.',
  },

  // Language Templates
  {
    id: "spanish-conversation",
    category: "language",
    title: "Master Conversational Spanish",
    description:
      "Develop practical Spanish speaking skills for travel, work, and everyday conversations with native speakers",
    suggested_current_levels: [
      "Complete beginner - never studied Spanish before, want to start from pronunciation and basic phrases",
      "Know some basic words and phrases from apps or travel - can say hello, numbers, basic courtesy words",
      "Studied Spanish in school but rusty - remember some grammar rules but need speaking practice and confidence",
    ],
    default_time_commitment: 30,
    estimated_duration_weeks: 20,
    difficulty: "beginner",
    icon: "MessageCircle",
    tags: ["Spanish", "Speaking", "Conversation", "Travel"],
    sample_milestones: [
      "Master pronunciation, greetings, and self-introduction in Spanish",
      "Essential vocabulary for daily activities (food, directions, shopping, time)",
      "Present tense conversations about family, work, and hobbies",
      "Hold confident 10-minute conversations about familiar topics",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: true,
    },
    suggested_target_date_weeks: 20,
    customization_notes:
      'Daily practice is key for language learning! This template includes 6 days/week for consistency. You can customize the title for specific goals (e.g., "Spanish for Travel to Mexico" or "Business Spanish Conversations"). Adjust your current level to help AI create the right difficulty roadmap for you.',
  },
  {
    id: "japanese-business",
    category: "language",
    title: "Professional Business Japanese",
    description:
      "Master Japanese for professional contexts including formal communication, meetings, and business etiquette",
    suggested_current_levels: [
      "Basic Japanese conversation skills - can hold simple conversations, know basic grammar patterns",
      "Know hiragana and katakana fluently - can read basic texts and write simple sentences",
      "Intermediate level with some kanji knowledge - understand N4/N3 level grammar and vocabulary",
    ],
    default_time_commitment: 60,
    estimated_duration_weeks: 24,
    difficulty: "intermediate",
    icon: "Briefcase",
    tags: ["Japanese", "Business", "Professional", "Keigo"],
    sample_milestones: [
      "Master business greetings, introductions, and professional etiquette (keigo basics)",
      "Write and understand formal emails, reports, and business documents",
      "Participate in meetings: expressing opinions, asking questions, making presentations",
      "Conduct complete business meetings and negotiations in Japanese",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
    suggested_target_date_weeks: 24,
    customization_notes:
      'Business Japanese requires consistent daily practice. This template assumes you have basic Japanese skills already. You can specify your industry in the title (e.g., "Business Japanese for Tech Industry") and adjust your current level to reflect your actual Japanese ability for better AI roadmap generation.',
  },

  // Fitness Templates
  {
    id: "beginner-fitness",
    category: "fitness",
    title: "Transform into a Fit & Healthy Person",
    description:
      "Build a sustainable fitness routine combining cardio, strength training, and healthy lifestyle habits",
    suggested_current_levels: [
      "Sedentary lifestyle with minimal exercise - mostly sitting at desk, taking elevators, limited physical activity",
      "Occasionally active but not consistent - workout sometimes but no regular routine, maybe walk or bike occasionally",
      "Want to start exercising regularly - motivated to change but unsure how to build sustainable habits",
    ],
    default_time_commitment: 45,
    estimated_duration_weeks: 12,
    difficulty: "beginner",
    icon: "Activity",
    tags: ["Fitness", "Health", "Cardio", "Strength"],
    sample_milestones: [
      "Establish consistent 3x per week workout routine and basic movement habits",
      "Learn proper form for fundamental exercises (squats, push-ups, planks)",
      "Build cardiovascular endurance and complete 30-minute cardio sessions",
      "Complete comprehensive fitness assessment and see measurable improvements",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: false,
      sunday: false,
    },
    suggested_target_date_weeks: 12,
    customization_notes:
      'This template starts with 3 days per week to build sustainable habits. You can adjust based on your schedule and add more days as you progress. Feel free to customize the title to match your specific fitness goals (e.g., "Get Strong and Lose 20 Pounds" or "Build Athletic Foundation").',
  },
  {
    id: "marathon-training",
    category: "fitness",
    title: "Complete My First Marathon (26.2 Miles)",
    description:
      "Systematic 20-week training program to safely build endurance and cross the marathon finish line",
    suggested_current_levels: [
      "Can run 3-5 miles comfortably at conversational pace - have been running regularly for at least 6 months",
      "Regular runner but never done long distances - comfortable with 5-10 mile runs, want to challenge myself",
      "Completed 5K/10K races before - have race experience and looking for the ultimate running challenge",
    ],
    default_time_commitment: 60,
    estimated_duration_weeks: 20,
    difficulty: "advanced",
    icon: "Trophy",
    tags: ["Running", "Endurance", "Marathon", "Training"],
    sample_milestones: [
      "Build weekly mileage base and establish consistent running schedule",
      "Complete first 10+ mile long run and half-marathon distance",
      "Master race day nutrition, hydration, and pacing strategies",
      "Successfully finish 26.2 mile marathon race",
    ],
    default_weekly_schedule: {
      monday: false,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: false,
      saturday: true,
      sunday: true,
    },
    suggested_target_date_weeks: 20,
    customization_notes:
      'Marathon training requires 5 days per week including long runs on weekends. You can specify a target race in your title (e.g., "Train for Boston Marathon 2024"). Be honest about your current running ability - the AI will create a safe progression plan based on your level.',
  },

  // Business Templates
  {
    id: "digital-marketing",
    category: "business",
    title: "Master Digital Marketing Strategy",
    description:
      "Learn comprehensive digital marketing including SEO, social media, paid ads, and analytics to grow businesses online",
    suggested_current_levels: [
      "Basic understanding of social media - use Facebook, Instagram personally but want to learn business marketing",
      "Some experience with online marketing - have tried posting for business or running basic ads",
      "Want to learn professional marketing skills - need systematic approach to digital marketing strategy",
    ],
    default_time_commitment: 75,
    estimated_duration_weeks: 14,
    difficulty: "intermediate",
    icon: "TrendingUp",
    tags: ["Marketing", "SEO", "Social Media", "Analytics"],
    sample_milestones: [
      "Master social media marketing strategies and content planning across platforms",
      "Learn SEO fundamentals, keyword research, and content marketing tactics",
      "Understand paid advertising on Google Ads, Facebook, and LinkedIn platforms",
      "Create and execute comprehensive digital marketing campaign with measurable results",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
    suggested_target_date_weeks: 14,
    customization_notes:
      'This template includes practical application - you\'ll create real campaigns. You can customize the title for your industry (e.g., "Digital Marketing for E-commerce" or "B2B Digital Marketing Mastery"). The schedule allows for both learning and implementation time.',
  },
  {
    id: "public-speaking",
    category: "business",
    title: "Become a Confident Public Speaker",
    description:
      "Overcome speaking anxiety and develop charismatic presentation skills for professional and personal success",
    suggested_current_levels: [
      "Nervous about speaking in public - get anxious even in small meetings, avoid speaking up",
      "Some presentation experience but lack confidence - can present when required but feel stressed and awkward",
      "Want to improve communication skills - comfortable in small groups but want to become more engaging and persuasive",
    ],
    default_time_commitment: 30,
    estimated_duration_weeks: 8,
    difficulty: "beginner",
    icon: "Mic",
    tags: ["Speaking", "Communication", "Confidence", "Presentation"],
    sample_milestones: [
      "Overcome speaking anxiety through breathing techniques and confidence-building exercises",
      "Master storytelling techniques and engaging opening/closing strategies",
      "Develop dynamic presentation skills with body language and vocal variety",
      "Deliver confident, persuasive 15-minute presentation to live audience",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: true,
      sunday: false,
    },
    suggested_target_date_weeks: 8,
    customization_notes:
      'Public speaking improves with practice! This template includes 4 days per week for regular practice. You can customize the title for specific goals (e.g., "Confident Wedding Speech" or "Professional Presentation Skills"). Be honest about your current comfort level for the best training plan.',
  },

  // Creative Templates
  {
    id: "digital-photography",
    category: "creative",
    title: "Master Digital Photography",
    description:
      "Learn photography fundamentals, camera techniques, and photo editing to create stunning images",
    suggested_current_levels: [
      "Take photos with phone but want to improve - love taking pictures but want better technical skills",
      "Own a camera but only use auto mode - have DSLR or mirrorless camera but intimidated by manual settings",
      "Basic understanding of composition - know rule of thirds but want to learn advanced techniques",
    ],
    default_time_commitment: 60,
    estimated_duration_weeks: 10,
    difficulty: "beginner",
    icon: "Camera",
    tags: ["Photography", "Art", "Composition", "Editing"],
    sample_milestones: [
      "Master camera settings, manual mode, and understanding exposure triangle",
      "Learn advanced composition techniques, lighting principles, and artistic vision",
      "Develop photo editing skills in Lightroom/Photoshop for professional results",
      "Create impressive portfolio of 50+ high-quality photos across different genres",
    ],
    default_weekly_schedule: {
      monday: false,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: true,
      sunday: true,
    },
    suggested_target_date_weeks: 10,
    customization_notes:
      'Photography benefits from regular practice and experimenting with different subjects. This template includes weekend shooting time. You can customize for specific photography interests (e.g., "Portrait Photography Mastery" or "Travel Photography Skills").',
  },
  {
    id: "music-production",
    category: "creative",
    title: "Create and Produce Original Music",
    description:
      "Learn music production from recording to mastering using digital audio workstations and modern techniques",
    suggested_current_levels: [
      "Love music but never produced - passionate listener who wants to create, no production experience",
      "Some experience with music software - have tried GarageBand or FL Studio but need systematic learning",
      "Play an instrument and want to record - musician who wants to produce professional-sounding tracks",
    ],
    default_time_commitment: 90,
    estimated_duration_weeks: 16,
    difficulty: "intermediate",
    icon: "Music",
    tags: ["Music", "Production", "DAW", "Audio"],
    sample_milestones: [
      "Master DAW basics, recording techniques, and MIDI programming",
      "Understand mixing fundamentals: EQ, compression, effects, and spatial audio",
      "Create first complete, professionally mixed track from start to finish",
      "Produce and release polished 3-song EP with mastering and distribution",
    ],
    default_weekly_schedule: {
      monday: false,
      tuesday: true,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: true,
      sunday: true,
    },
    suggested_target_date_weeks: 16,
    customization_notes:
      'Music production requires longer focused sessions, so this template uses 90-minute blocks. You can customize based on your musical style (e.g., "Electronic Music Production" or "Singer-Songwriter Recording"). The schedule includes weekend time for creative flow.',
  },

  // Academic Templates
  {
    id: "data-science",
    category: "academic",
    title: "Become a Data Scientist",
    description:
      "Master data analysis, statistics, machine learning, and Python to solve real-world problems with data",
    suggested_current_levels: [
      "Basic math and statistics knowledge - comfortable with algebra, some exposure to statistics concepts",
      "Some programming experience helpful - know basics of any programming language or have done coding tutorials",
      "Curious about data and analytics - interested in finding insights from data but no formal training",
    ],
    default_time_commitment: 90,
    estimated_duration_weeks: 18,
    difficulty: "intermediate",
    icon: "BarChart3",
    tags: ["Data Science", "Python", "Statistics", "ML"],
    sample_milestones: [
      "Master data manipulation and analysis with Python (pandas, numpy) and R",
      "Learn statistical analysis, hypothesis testing, and data visualization techniques",
      "Understand machine learning algorithms and implement predictive models",
      "Complete comprehensive real-world data science project from data collection to insights",
    ],
    default_weekly_schedule: {
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
    suggested_target_date_weeks: 18,
    customization_notes:
      'Data science requires consistent practice with both theory and hands-on projects. This template uses 90-minute sessions for deep work. You can customize for specific domains (e.g., "Data Science for Healthcare" or "Financial Data Analysis"). Your math/programming background will help AI create the right learning path.',
  },
];

export const TEMPLATE_CATEGORIES = {
  programming: {
    label: "Programming",
    icon: "Code",
    description: "Learn coding and software development",
  },
  language: {
    label: "Languages",
    icon: "MessageCircle",
    description: "Master new languages and communication",
  },
  fitness: {
    label: "Fitness",
    icon: "Activity",
    description: "Build strength and healthy habits",
  },
  business: {
    label: "Business",
    icon: "Briefcase",
    description: "Develop professional and entrepreneurial skills",
  },
  creative: {
    label: "Creative",
    icon: "Palette",
    description: "Explore arts, design, and creative expression",
  },
  academic: {
    label: "Academic",
    icon: "GraduationCap",
    description: "Study academic subjects and research skills",
  },
} as const;

export const DIFFICULTY_LEVELS = {
  beginner: {
    label: "Beginner",
    description: "Perfect for those just starting out",
    color: "green",
  },
  intermediate: {
    label: "Intermediate",
    description: "For those with some foundational knowledge",
    color: "yellow",
  },
  advanced: {
    label: "Advanced",
    description: "Challenging goals for experienced learners",
    color: "red",
  },
} as const;
