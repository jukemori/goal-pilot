export const ROADMAP_SYSTEM_PROMPT = `You are an expert personal development coach and educational curriculum designer. 
Your task is to create a high-level learning roadmap overview with milestones and phases.
Always respond with valid JSON that matches the expected schema.`;

export const STAGES_SYSTEM_PROMPT = `You are an expert personal development coach and educational curriculum designer. 
Your task is to create detailed, actionable learning stages based on the roadmap overview.
Always respond with valid JSON that matches the expected schema.`;

export const generateRoadmapPrompt = (
  goal: string,
  currentLevel: string,
  timeCommitment: number,
  targetDate: string | null,
  weeklySchedule: Record<string, boolean>,
  startDate: string,
) => {
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => day)
    .join(", ");

  const currentYear = new Date().getFullYear();

  const availableDaysCount =
    Object.values(weeklySchedule).filter(Boolean).length;
  const hoursPerWeek =
    Math.round(((timeCommitment * availableDaysCount) / 60) * 10) / 10;

  // Intelligent time estimation based on goal description and category
  const goalLowerCase = goal.toLowerCase();
  const currentLevelLowerCase = currentLevel.toLowerCase();

  // Determine skill level from goal description and current level
  let skillLevel = "basic"; // default

  if (
    goalLowerCase.includes("master") ||
    goalLowerCase.includes("expert") ||
    goalLowerCase.includes("advanced") ||
    goalLowerCase.includes("professional") ||
    goalLowerCase.includes("fluent") ||
    goalLowerCase.includes("native")
  ) {
    skillLevel = "expert";
  } else if (
    goalLowerCase.includes("professional") ||
    goalLowerCase.includes("business") ||
    goalLowerCase.includes("work") ||
    goalLowerCase.includes("intermediate") ||
    goalLowerCase.includes("proficient") ||
    goalLowerCase.includes("conversational")
  ) {
    skillLevel = "professional";
  } else if (
    goalLowerCase.includes("basic") ||
    goalLowerCase.includes("beginner") ||
    goalLowerCase.includes("intro") ||
    goalLowerCase.includes("fundamentals") ||
    goalLowerCase.includes("foundation") ||
    goalLowerCase.includes("travel")
  ) {
    skillLevel = "basic";
  }

  // Adjust based on current level description
  if (
    currentLevelLowerCase.includes("complete beginner") ||
    currentLevelLowerCase.includes("no experience") ||
    currentLevelLowerCase.includes("never") ||
    currentLevelLowerCase.includes("zero")
  ) {
    // Stay at determined level
  } else if (
    currentLevelLowerCase.includes("some experience") ||
    currentLevelLowerCase.includes("beginner") ||
    currentLevelLowerCase.includes("basic")
  ) {
    // Reduce hours by 20% since they have some foundation
    skillLevel =
      skillLevel === "expert"
        ? "professional"
        : skillLevel === "professional"
          ? "basic"
          : "basic";
  }

  // Determine goal category and base hours
  let baseHours = 300; // default

  // Technical Skills (Programming, IT, Data Science, Engineering)
  if (
    goalLowerCase.includes("programming") ||
    goalLowerCase.includes("coding") ||
    goalLowerCase.includes("software") ||
    goalLowerCase.includes("web development") ||
    goalLowerCase.includes("javascript") ||
    goalLowerCase.includes("python") ||
    goalLowerCase.includes("data science") ||
    goalLowerCase.includes("machine learning") ||
    goalLowerCase.includes("ai") ||
    goalLowerCase.includes("cybersecurity") ||
    goalLowerCase.includes("database") ||
    goalLowerCase.includes("cloud") ||
    goalLowerCase.includes("devops") ||
    goalLowerCase.includes("engineering")
  ) {
    baseHours =
      skillLevel === "basic" ? 200 : skillLevel === "professional" ? 750 : 2500;
  }

  // Creative Skills (Music, Art, Writing, Design)
  else if (
    goalLowerCase.includes("music") ||
    goalLowerCase.includes("instrument") ||
    goalLowerCase.includes("piano") ||
    goalLowerCase.includes("guitar") ||
    goalLowerCase.includes("singing") ||
    goalLowerCase.includes("art") ||
    goalLowerCase.includes("drawing") ||
    goalLowerCase.includes("painting") ||
    goalLowerCase.includes("design") ||
    goalLowerCase.includes("graphic") ||
    goalLowerCase.includes("writing") ||
    goalLowerCase.includes("photography") ||
    goalLowerCase.includes("video editing") ||
    goalLowerCase.includes("animation")
  ) {
    baseHours =
      skillLevel === "basic"
        ? 150
        : skillLevel === "professional"
          ? 1000
          : 3000;
  }

  // Physical Skills (Sports, Fitness, Martial Arts)
  else if (
    goalLowerCase.includes("fitness") ||
    goalLowerCase.includes("workout") ||
    goalLowerCase.includes("gym") ||
    goalLowerCase.includes("running") ||
    goalLowerCase.includes("marathon") ||
    goalLowerCase.includes("sport") ||
    goalLowerCase.includes("martial arts") ||
    goalLowerCase.includes("yoga") ||
    goalLowerCase.includes("dance") ||
    goalLowerCase.includes("swimming") ||
    goalLowerCase.includes("cycling") ||
    goalLowerCase.includes("tennis") ||
    goalLowerCase.includes("golf") ||
    goalLowerCase.includes("basketball") ||
    goalLowerCase.includes("soccer") ||
    goalLowerCase.includes("fit") ||
    goalLowerCase.includes("train") ||
    goalLowerCase.includes("muscle") ||
    goalLowerCase.includes("strength") ||
    goalLowerCase.includes("cardio") ||
    goalLowerCase.includes("athletic")
  ) {
    baseHours =
      skillLevel === "basic" ? 100 : skillLevel === "professional" ? 750 : 2000;
  }

  // Business/Professional Skills
  else if (
    goalLowerCase.includes("business") ||
    goalLowerCase.includes("management") ||
    goalLowerCase.includes("leadership") ||
    goalLowerCase.includes("sales") ||
    goalLowerCase.includes("marketing") ||
    goalLowerCase.includes("finance") ||
    goalLowerCase.includes("accounting") ||
    goalLowerCase.includes("project management") ||
    goalLowerCase.includes("consulting") ||
    goalLowerCase.includes("entrepreneurship") ||
    goalLowerCase.includes("public speaking") ||
    goalLowerCase.includes("negotiation") ||
    goalLowerCase.includes("time management") ||
    goalLowerCase.includes("productivity") ||
    goalLowerCase.includes("organization")
  ) {
    baseHours =
      skillLevel === "basic" ? 150 : skillLevel === "professional" ? 600 : 1500;
  }

  // Academic/Language/Certification Skills
  else if (
    goalLowerCase.includes("language") ||
    goalLowerCase.includes("spanish") ||
    goalLowerCase.includes("french") ||
    goalLowerCase.includes("german") ||
    goalLowerCase.includes("chinese") ||
    goalLowerCase.includes("japanese") ||
    goalLowerCase.includes("certification") ||
    goalLowerCase.includes("degree") ||
    goalLowerCase.includes("course") ||
    goalLowerCase.includes("science") ||
    goalLowerCase.includes("math") ||
    goalLowerCase.includes("history") ||
    goalLowerCase.includes("literature") ||
    goalLowerCase.includes("philosophy") ||
    goalLowerCase.includes("psychology")
  ) {
    // Language learning specific adjustments (based on FSI categories and practical experience)
    if (
      goalLowerCase.includes("language") ||
      goalLowerCase.includes("spanish") ||
      goalLowerCase.includes("french") ||
      goalLowerCase.includes("german") ||
      goalLowerCase.includes("chinese") ||
      goalLowerCase.includes("japanese")
    ) {
      if (goalLowerCase.includes("basic") || goalLowerCase.includes("travel")) {
        baseHours = 120; // 3-6 months for basic travel Spanish
      } else if (
        goalLowerCase.includes("conversational") ||
        goalLowerCase.includes("conversation")
      ) {
        baseHours = 200; // 6-12 months for conversational level
      } else if (
        goalLowerCase.includes("business") ||
        goalLowerCase.includes("professional")
      ) {
        baseHours = 450; // 1.5-2 years for business proficiency
      } else if (
        goalLowerCase.includes("fluent") ||
        goalLowerCase.includes("native") ||
        goalLowerCase.includes("advanced")
      ) {
        baseHours = 700; // 2+ years for fluency
      } else {
        baseHours = 180; // default: basic conversational (6-9 months)
      }
    } else {
      baseHours =
        skillLevel === "basic"
          ? 200
          : skillLevel === "professional"
            ? 900
            : 2000;
    }
  }

  // Crafts and Hobbies
  else if (
    goalLowerCase.includes("cooking") ||
    goalLowerCase.includes("baking") ||
    goalLowerCase.includes("gardening") ||
    goalLowerCase.includes("woodworking") ||
    goalLowerCase.includes("knitting") ||
    goalLowerCase.includes("sewing") ||
    goalLowerCase.includes("pottery") ||
    goalLowerCase.includes("jewelry") ||
    goalLowerCase.includes("crafts")
  ) {
    baseHours =
      skillLevel === "basic" ? 80 : skillLevel === "professional" ? 400 : 1200;
  }

  // Default for unclassified goals
  else {
    baseHours =
      skillLevel === "basic" ? 200 : skillLevel === "professional" ? 500 : 1500;
  }

  const totalHoursNeeded = baseHours;

  const totalWeeksNeeded = Math.round(totalHoursNeeded / hoursPerWeek);
  const totalYearsNeeded = Math.round((totalWeeksNeeded / 52) * 10) / 10;

  // Calculate expected number of stages based on timeline
  const estimatedStages =
    totalWeeksNeeded < 12
      ? Math.ceil(totalWeeksNeeded / 2) // Short timeline: 1-3 weeks per stage
      : totalWeeksNeeded < 50
        ? Math.ceil(totalWeeksNeeded / 6) // Medium timeline: 2-8 weeks per stage
        : Math.ceil(totalWeeksNeeded / 8); // Long timeline: 4-12 weeks per stage

  // Ensure we stay within 6-12 stages range
  const finalStageCount = Math.max(6, Math.min(12, estimatedStages));

  return `Create a comprehensive learning roadmap for the following goal:

CRITICAL TIMELINE CALCULATION (MUST FOLLOW):
- Time commitment: ${timeCommitment} minutes/day × ${availableDaysCount} days = ${hoursPerWeek} hours/week
- Total hours needed for this goal: ${totalHoursNeeded} hours
- Total weeks required: ${totalHoursNeeded} ÷ ${hoursPerWeek} = ${totalWeeksNeeded} weeks
- Total years required: ${totalWeeksNeeded} ÷ 52 = ${totalYearsNeeded} years
- Completion date should be approximately: ${new Date(new Date(startDate).getTime() + totalWeeksNeeded * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}

🚨 CRITICAL REQUIREMENT: YOUR PHASES MUST TOTAL EXACTLY ${totalWeeksNeeded} WEEKS! 🚨

If you create only 3 phases of 4-5 weeks each (13 total), but the calculation shows ${totalWeeksNeeded} weeks needed, you MUST create more phases. For example:
- If ${totalWeeksNeeded} weeks are needed, create approximately ${Math.ceil(totalWeeksNeeded / 8)} phases of 6-8 weeks each
- DO NOT create only 3-4 phases for a multi-year goal
- VERIFY: Sum of all your phase duration_weeks MUST equal ${totalWeeksNeeded}

Goal: ${goal}
Current Level Description: ${currentLevel}
Daily Time Commitment: ${timeCommitment} minutes
Available Days: ${availableDays}
Start Date: ${startDate}
${targetDate ? `Target Completion Date: ${targetDate}` : "No specific deadline"}

IMPORTANT: 
- All dates must be in ${currentYear} or later. Use the start date (${startDate}) as your reference point.
- Carefully analyze the current level description to understand the user's starting point
- Design phases that build appropriately from their specific current knowledge/skills
- If they mention specific skills, technologies, or knowledge areas, incorporate these into early phases
- Avoid repeating content they already know based on their description

STAGE REQUIREMENTS:
- Create exactly ${finalStageCount} SPECIFIC, ACTIONABLE stages that cover the COMPLETE journey from the user's current level to mastery
- Stage durations must be realistic and shorter for better engagement:
  * For short timelines (< 12 weeks): 1-3 weeks per stage
  * For medium timelines (12-50 weeks): 2-8 weeks per stage
  * For long timelines (50+ weeks): 4-12 weeks per stage (MAX)
- CRITICAL: All stage durations MUST sum to exactly ${totalWeeksNeeded} weeks
- Each stage should have CONCRETE, MEASURABLE outcomes
- Focus on PRACTICAL APPLICATION rather than abstract theory
- Ensure stages build upon each other progressively with clear prerequisites
- Cover ALL essential skills, sub-skills, and competencies needed for mastery
- Include stages for: foundations, intermediate skills, advanced concepts, specialization, and mastery
- Each stage should have detailed descriptions explaining what will be accomplished
- Design stages to take someone from their current level to true professional competency

CRITICAL: MAKE STAGES EXTREMELY SPECIFIC AND DETAILED:
Instead of abstract titles like "Spanish Grammar Foundations", use specific topics:
- "Basic Spanish Greetings & Present Tense Conjugation (-ar verbs)"
- "Expressing Likes/Dislikes (me gusta) & Describing People/Places"
- "Past Tense (Preterite) & Time Expressions (ayer, la semana pasada)"

EXAMPLES OF SPECIFIC STAGE CONTENT BY DOMAIN:

LANGUAGE LEARNING - Each stage should specify exact grammar topics and vocabulary:
STAGE TITLES: "Present Tense -ar Verbs & Basic Introductions", "Expressing Preferences (me gusta/no me gusta) & Adjectives", "Past Tense Preterite & Time Expressions"
SKILLS: ["Conjugate regular -ar verbs (hablar, estudiar, caminar)", "Use 'me gusta/no me gusta' with nouns and infinitives", "Form basic yes/no questions with ¿Te gusta...?"]
OBJECTIVES: ["Master present tense conjugation of 20 common -ar verbs", "Express personal preferences about food, activities, and people", "Ask and answer questions about likes and dislikes"]
KEY CONCEPTS: ["Subject pronouns (yo, tú, él/ella)", "Verb endings: -o, -as, -a, -amos, -áis, -an", "Agreement with 'gusta' vs 'gustan'"]

PROGRAMMING - Each stage should specify exact technologies, concepts, and projects:
STAGE TITLES: "HTML Structure & CSS Box Model", "JavaScript Variables, Functions & DOM Manipulation", "React Components & State Management"
SKILLS: ["Create semantic HTML with proper tags (header, nav, main, footer)", "Style layouts using Flexbox and CSS Grid", "Write JavaScript functions that manipulate DOM elements"]
OBJECTIVES: ["Build 3 responsive web pages with semantic HTML", "Create interactive forms with JavaScript validation", "Deploy a functional React app with 5+ components"]
KEY CONCEPTS: ["HTML5 semantic elements", "CSS selectors and specificity", "Event listeners and callbacks"]

FITNESS - Each stage should specify exact exercises, rep ranges, and progressions:
STAGE TITLES: "Bodyweight Basics & Core Strength", "Push/Pull Movements & Lower Body Foundation", "Cardio Endurance & Movement Patterns"
SKILLS: ["Perform 10 consecutive push-ups with proper form", "Hold a plank for 60 seconds", "Complete 20 bodyweight squats"]
OBJECTIVES: ["Establish daily movement routine of 30+ minutes", "Master fundamental movement patterns safely", "Build base cardiovascular fitness"]
KEY CONCEPTS: ["Proper push-up progression (wall → knee → full)", "Core engagement and breathing", "Progressive overload principles"]

MUSIC - Each stage should specify exact chords, scales, and songs:
STAGE TITLES: "Basic Open Chords & Strumming Patterns", "Chord Transitions & First Songs", "Barre Chords & Intermediate Techniques"
SKILLS: ["Play G, C, D, Em chords cleanly", "Transition between chords smoothly", "Strum in 4/4 time with down-up patterns"]
OBJECTIVES: ["Play 5 beginner songs using basic chords", "Maintain steady rhythm while changing chords", "Perform simple chord progressions"]
KEY CONCEPTS: ["Finger placement and pressure", "Chord shapes and muscle memory", "Timing and rhythm fundamentals"]

BUSINESS/PROFESSIONAL - Each stage should specify exact skills and deliverables:
STAGE TITLES: "Market Research & Customer Validation", "Business Model Canvas & Value Propositions", "Financial Planning & Revenue Projections"
SKILLS: ["Conduct 20 customer interviews", "Create detailed buyer personas", "Build financial models in Excel"]
OBJECTIVES: ["Validate business idea with market research", "Define clear value proposition", "Create 12-month financial projections"]
KEY CONCEPTS: ["Customer discovery methodology", "Lean startup principles", "Basic accounting and cash flow"]

REALISTIC TIMELINE CALCULATION:
- Calculate total hours needed realistically (don't underestimate)
- Time available per week: ${timeCommitment} minutes/day × ${Object.values(weeklySchedule).filter(Boolean).length} days = ${Math.round(((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60) * 10) / 10} hours/week
- For this specific goal: expect ${totalHoursNeeded} total hours
- Total weeks needed: Total hours ÷ hours per week (${totalHoursNeeded} hours ÷ ${Math.round(((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60) * 10) / 10} hours/week = ${Math.round(totalHoursNeeded / ((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60))} weeks)
- Stage durations must add up to the total realistic timeline
- IMPORTANT: Each stage duration must be calculated to fit within the realistic total timeline
- Include time for review, practice, and skill consolidation
- Account for the natural learning curve and plateau periods

CRITICAL: The sum of all stage durations must equal the total realistic weeks needed for mastery.

STAGE DETAIL REQUIREMENTS:
- Each stage must have comprehensive descriptions (3-5 sentences minimum)
- CRITICAL: Stage titles must be EXTREMELY SPECIFIC and detailed, not abstract
- Example: Instead of "Spanish Grammar Basics" → "Present Tense -ar Verbs & Expressing Likes/Dislikes (me gusta)"
- Example: Instead of "Web Development Fundamentals" → "HTML5 Semantic Elements & CSS Flexbox Layouts"
- Include specific objectives with exact topics, concepts, and techniques
- Skills must be granular and measurable (e.g., "Conjugate 15 regular -ar verbs in present tense")
- Key concepts should list specific grammar rules, formulas, techniques, or methods
- Objectives must specify exact outcomes and measurable skills
- Explain how each stage prepares for the next level with concrete prerequisites
- CRITICAL: Include a "resources" array with 3-6 specific tools, apps, websites, books, or materials
- Resources should be concrete and actionable (e.g., "Duolingo Units 1-5", "YouTube: Python Tutorial Playlist by Corey Schafer")
- Mention popular, well-known resources relevant to the subject area
- Focus on practical, hands-on learning rather than abstract theory
- Include measurable outcomes and specific skills that can be demonstrated

SPECIFICITY REQUIREMENTS FOR ALL DOMAINS:
LANGUAGE LEARNING: Specify exact grammar topics, verb tenses, vocabulary themes
- "Present tense conjugation: -ar, -er, -ir verbs"
- "Expressing likes/dislikes (me gusta, no me gusta)"
- "Describing people & places (bonito, grande, simpático)"
- "Using connectors: y, pero, porque, entonces"

PROGRAMMING: Specify exact technologies, frameworks, and project types
- "HTML5 semantic elements: header, nav, main, section, footer"
- "CSS Flexbox: justify-content, align-items, flex-direction"
- "JavaScript ES6: arrow functions, destructuring, template literals"
- "React Hooks: useState, useEffect, custom hooks"

FITNESS: Specify exact exercises, rep ranges, and progressions
- "Bodyweight squats: 3 sets of 15 with proper knee tracking"
- "Push-up progression: wall → incline → knee → full push-ups"
- "Cardiovascular base: 20-minute walks progressing to 30-minute jogs"

MUSIC: Specify exact chords, scales, techniques, and songs
- "Open chords: G, C, D, Em with clean finger positioning"
- "Strumming patterns: down-down-up-up-down-up in 4/4 time"
- "Chord transitions: G to C to D progressions under 2 seconds"
- "First songs: 'Wonderwall', 'Horse with No Name', '3 Little Birds'"

RESOURCES EXAMPLES BY DOMAIN:
LANGUAGE LEARNING:
- "Duolingo Spanish Course - Complete Basics 1 & 2 units"
- "SpanishPod101.com - Beginner lesson series (Episodes 1-10)" 
- "HelloTalk app - Practice with native speakers (15 min daily)"
- "YouTube: SpanishDict channel - Pronunciation tutorials"

PROGRAMMING:
- "freeCodeCamp.org - JavaScript Basics course"
- "Codecademy Python Track - Complete Modules 1-3"
- "YouTube: The Net Ninja - React Tutorial Playlist"
- "GitHub - Build and commit 2 practice projects"

FITNESS:
- "Nike Training Club app - Beginner workouts (3x/week)"
- "YouTube: Yoga with Adriene - 30 Days of Yoga"
- "MyFitnessPal app - Track nutrition and calories"
- "Couch to 5K app - Complete Week 1-4 program"

MUSIC:
- "Simply Piano app - Learn basic chords and scales"
- "YouTube: JustinGuitar - Beginner course lessons 1-10"
- "Yousician app - Daily 20-minute practice sessions"
- "Ultimate Guitar website - Learn 5 beginner songs"

ROADMAP PHASES REQUIREMENTS:
In addition to detailed stages, create 4-5 high-level roadmap phases that give users a clear action plan:
- Each roadmap phase should tell users EXACTLY what they need to do
- Include specific activities, not abstract concepts
- Provide concrete success metrics so users know when they've completed each phase
- List actual tools/resources needed for that phase

JSON format:
{
  "overview": "Comprehensive overview of the complete journey from the user's current level to achieving their goal",
  "roadmap_phases": [
    {
      "id": "roadmap-1",
      "name": "Foundation Phase" (use action-oriented names like "Build Core Strength", "Master Basic Grammar", "Setup Development Environment"),
      "description": "Clear description of what happens in this phase and why it's important",
      "duration_percentage": 20 (percentage of total journey time),
      "key_activities": [
        "Specific daily/weekly activities the user will do",
        "Concrete actions like 'Practice 30 push-ups daily', 'Complete Spanish verb drills for 20 minutes', 'Build 3 small web projects'"
      ],
      "specific_goals": [
        "Measurable outcomes for this phase",
        "Examples: 'Run 5K without stopping', 'Hold conversations about daily topics', 'Deploy first web application'"
      ],
      "success_metrics": [
        "How to know you've completed this phase",
        "Examples: 'Can do 50 consecutive push-ups', 'Score 80% on grammar tests', 'Complete all beginner projects'"
      ],
      "tools_needed": [
        "Specific apps, equipment, or resources",
        "Examples: 'Fitness tracking app', 'Duolingo Premium', 'VS Code + GitHub account'"
      ]
    }
  ],
  "phases": [
    {
      "id": "stage-1",
      "title": "Present Tense -ar Verbs & Basic Introductions (Hola, me llamo...)",
      "description": "Master the fundamentals of Spanish communication by learning present tense conjugation of regular -ar verbs and essential greeting phrases. You'll practice introducing yourself, asking basic questions, and forming simple sentences using the most common verb pattern in Spanish. This stage establishes the foundation for all future grammar learning and provides immediate practical communication skills.",
      "duration_weeks": 3,
      "skills_to_learn": [
        "Conjugate regular -ar verbs in present tense (hablar, estudiar, caminar)",
        "Use greeting phrases: Hola, me llamo, ¿Cómo te llamas?, Mucho gusto",
        "Form basic yes/no questions with ¿Hablas español? pattern",
        "Apply subject pronouns correctly (yo, tú, él/ella, nosotros)"
      ],
      "learning_objectives": [
        "Conjugate 15 common -ar verbs accurately in present tense",
        "Introduce yourself and ask others' names confidently",
        "Form 20 different simple sentences using -ar verbs",
        "Understand and respond to basic greeting conversations"
      ],
      "key_concepts": [
        "Present tense -ar verb endings: -o, -as, -a, -amos, -áis, -an",
        "Subject pronoun usage and when to omit them",
        "Question formation with rising intonation",
        "Basic sentence structure: Subject + Verb + Object"
      ],
      "prerequisites": ["None - beginner level"],
      "outcomes": [
        "Conduct basic introductions in Spanish",
        "Use 15+ -ar verbs correctly in conversation",
        "Ask and answer simple questions about daily activities"
      ],
      "resources": [
        "Duolingo Spanish Course - Complete Basics 1 & 2 units (Present tense verbs)",
        "SpanishPod101 - Beginner lesson series Episodes 1-5 (Introductions)",
        "Conjuguemos.com - Practice -ar verb conjugations daily",
        "YouTube: SpanishDict channel - Present tense pronunciation guide"
      ]
    }
  ],
  "estimated_completion_date": "${new Date(new Date(startDate).getTime() + totalWeeksNeeded * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}",
  "total_hours_required": ${totalHoursNeeded},
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Foundation Complete",
      "description": "Basic skills established and ready for intermediate concepts",
      "target_date": "${new Date(new Date(startDate).getTime() + Math.floor(totalWeeksNeeded * 0.33) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}",
      "stage_number": ${Math.ceil(finalStageCount * 0.33)},
      "skills_validated": ["Core fundamentals mastered", "Ready for next level"],
      "icon": "foundation",
      "color": "blue"
    },
    {
      "id": "milestone-2", 
      "title": "Intermediate Mastery",
      "description": "Confident application of intermediate skills",
      "target_date": "${new Date(new Date(startDate).getTime() + Math.floor(totalWeeksNeeded * 0.67) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}",
      "stage_number": ${Math.ceil(finalStageCount * 0.67)},
      "skills_validated": ["Intermediate concepts applied", "Complex problems solved"],
      "icon": "target",
      "color": "green"
    },
    {
      "id": "milestone-3",
      "title": "Goal Achievement", 
      "description": "Full mastery achieved and goal completed successfully",
      "target_date": "${new Date(new Date(startDate).getTime() + totalWeeksNeeded * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}",
      "stage_number": ${finalStageCount},
      "skills_validated": ["Expert level reached", "Goal fully accomplished"],
      "icon": "trophy",
      "color": "gold"
    }
  ]
}

CALCULATION EXAMPLE FOR YOUR SPECIFIC CASE:
- You have ${timeCommitment} minutes/day × ${Object.values(weeklySchedule).filter(Boolean).length} days/week = ${Math.round(((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60) * 10) / 10} hours/week
- For this goal (${totalHoursNeeded} hours): ${totalHoursNeeded} ÷ ${Math.round(((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60) * 10) / 10} = ${Math.round(totalHoursNeeded / ((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60))} weeks = ${Math.round((totalHoursNeeded / ((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60) / 52) * 10) / 10} years
- Your stages should total approximately ${Math.round(totalHoursNeeded / ((timeCommitment * Object.values(weeklySchedule).filter(Boolean).length) / 60))} weeks
- Example stage distribution: Adjust based on total timeline - shorter goals need shorter stages

IMPORTANT: 
- Do NOT include daily_tasks in the roadmap generation
- Tasks will be generated separately for each stage when requested
- Focus on creating comprehensive stage descriptions and realistic timelines
- Ensure the roadmap covers the COMPLETE journey to mastery
- VERIFY your math: Total stage weeks must equal realistic completion timeline

Consider the user's current level and available time. Make the roadmap realistic and achievable.
Break down complex goals into smaller, manageable phases with clear milestones.

🚨 FINAL VALIDATION CHECKLIST 🚨
Before submitting your response, verify:
1. ✅ Sum of all stage duration_weeks = ${totalWeeksNeeded} weeks (NOT 10-15 weeks for a multi-year goal)
2. ✅ Number of stages matches calculated amount (exactly ${finalStageCount} stages for ${totalWeeksNeeded} weeks)
3. ✅ Each stage builds progressively toward mastery
4. ✅ Completion date matches calculated timeline (~${Math.round(totalYearsNeeded * 10) / 10} years from start)`;
};

// Generate only the overview and roadmap (no detailed stages)
export const generateRoadmapOverviewPrompt = (
  goal: string,
  currentLevel: string,
  timeCommitment: number,
  targetDate: string | null,
  weeklySchedule: Record<string, boolean>,
  startDate: string,
) => {
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => day)
    .join(", ");

  const availableDaysCount =
    Object.values(weeklySchedule).filter(Boolean).length;
  const hoursPerWeek =
    Math.round(((timeCommitment * availableDaysCount) / 60) * 10) / 10;

  // Calculate total hours needed based on goal
  const goalLowerCase = goal.toLowerCase();
  let baseHours = 200; // default

  // Language learning specific
  if (goalLowerCase.includes("spanish") || goalLowerCase.includes("language")) {
    if (goalLowerCase.includes("conversational")) {
      baseHours = 200; // 6-12 months for conversational level
    } else if (goalLowerCase.includes("fluent")) {
      baseHours = 700; // 2+ years for fluency
    } else {
      baseHours = 180; // default: basic conversational
    }
  }

  const totalWeeksNeeded = Math.round(baseHours / hoursPerWeek);
  const finalStageCount = Math.max(
    6,
    Math.min(12, Math.ceil(totalWeeksNeeded / 6)),
  );

  return `Create a high-level learning roadmap overview for this goal:

Goal: ${goal}
Current Level: ${currentLevel}
Time Commitment: ${timeCommitment} minutes/day (${hoursPerWeek} hours/week)
Available Days: ${availableDays}
Start Date: ${startDate}
${targetDate ? `Target Date: ${targetDate}` : ""}

Calculate realistic timeline:
- Total hours needed: ~${baseHours} hours
- Total weeks: ${totalWeeksNeeded} weeks
- Number of stages planned: ${finalStageCount}

Create a JSON response with:
1. Overview: High-level journey description
2. Roadmap phases (4-5): Major learning phases with clear action items
3. Milestones (3): Key achievement points
4. Timeline calculations

JSON format:
{
  "overview": "High-level description of the complete learning journey",
  "total_hours_required": ${baseHours},
  "total_weeks_required": ${totalWeeksNeeded},
  "stage_count": ${finalStageCount},
  "estimated_completion_date": "YYYY-MM-DD",
  "roadmap_phases": [
    {
      "id": "roadmap-1",
      "name": "Foundation Phase",
      "description": "What happens in this phase",
      "duration_percentage": 25,
      "key_activities": ["Daily practice activities"],
      "specific_goals": ["Measurable outcomes"],
      "success_metrics": ["How to measure completion"]
    }
  ],
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Foundation Complete",
      "description": "First major achievement",
      "target_date": "YYYY-MM-DD",
      "stage_number": 3,
      "icon": "foundation",
      "color": "blue"
    }
  ]
}`;
};

// Generate detailed stages based on roadmap overview
export const generateStagesPrompt = (
  goal: string,
  currentLevel: string,
  roadmapOverview: Record<string, unknown>,
  _timeCommitment: number,
  _weeklySchedule: Record<string, boolean>,
) => {
  const totalWeeks = Number(roadmapOverview.total_weeks_required) || 12;
  const stageCount = Number(roadmapOverview.stage_count) || 6;
  const avgWeeksPerStage = Math.round(totalWeeks / stageCount);

  return `Create ${stageCount} detailed learning stages for this goal:

Goal: ${goal}
Current Level: ${currentLevel}
Total Timeline: ${totalWeeks} weeks
Number of Stages: ${stageCount}

Based on this roadmap overview:
${JSON.stringify(roadmapOverview, null, 2)}

REQUIREMENTS:
- Create exactly ${stageCount} specific, actionable stages
- Each stage should be ${avgWeeksPerStage} weeks on average (adjust as needed)
- Total duration must equal ${totalWeeks} weeks
- Make stages VERY specific with exact topics, not abstract
- Include detailed skills, objectives, and resources

JSON format:
{
  "phases": [
    {
      "id": "stage-1",
      "title": "Specific Stage Title (e.g., 'Present Tense -ar Verbs & Basic Greetings')",
      "description": "3-5 sentences explaining what will be accomplished",
      "duration_weeks": ${avgWeeksPerStage},
      "skills_to_learn": ["Specific, measurable skills"],
      "learning_objectives": ["Clear objectives"],
      "key_concepts": ["Core concepts to master"],
      "prerequisites": ["What's needed before starting"],
      "outcomes": ["What user can do after completion"],
      "resources": ["Specific tools, apps, websites, books"]
    }
  ]
}`;
};

export const TASK_GENERATION_SYSTEM_PROMPT = `You are an expert learning designer and task planner. 
Your task is to break down a specific learning phase into EXTREMELY SPECIFIC, CONCRETE, daily actionable tasks.

CRITICAL: Tasks must be ACTIONABLE and SPECIFIC, not abstract. Instead of "Practice vocabulary", use "Complete Duolingo lessons 1-3 on family vocabulary (madre, padre, hermano, hermana)".

Always respond with valid JSON that matches the expected schema.`;

export const generateTasksForPhasePrompt = (
  phaseTitle: string,
  phaseDescription: string,
  skillsToLearn: string[],
  learningObjectives: string[],
  keyConcepts: string[],
  durationWeeks: number,
  timeCommitment: number,
  weeklySchedule: Record<string, boolean>,
  phaseNumber: number,
  goalTitle: string,
) => {
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => day)
    .join(", ");

  const totalSessions =
    durationWeeks * Object.values(weeklySchedule).filter(Boolean).length;

  return `Break down this stage into specific, daily actionable tasks:

STAGE DETAILS:
Stage: ${phaseTitle} (Stage ${phaseNumber})
Goal: ${goalTitle}
Description: ${phaseDescription}
Duration: ${durationWeeks} weeks
Skills to Develop: ${skillsToLearn.join(", ")}
Objectives: ${learningObjectives?.join(", ") || "Not specified"}
Key Concepts: ${keyConcepts?.join(", ") || "Not specified"}

SCHEDULING DETAILS:
Daily Time Commitment: ${timeCommitment} minutes
Available Days: ${availableDays}
Total Sessions Needed: ${totalSessions}

TASK GENERATION REQUIREMENTS:
- Create SPECIFIC, ACTIONABLE tasks that clearly tell users exactly what to do
- Generate exactly ${Object.values(weeklySchedule).filter(Boolean).length} task templates per week (one for each available day)
- Each task should be achievable in ${timeCommitment} minutes
- Tasks should progress logically through difficulty levels
- IMPORTANT: Include SPECIFIC resources, tools, apps, websites, or materials
- Make tasks MEASURABLE with clear success criteria
- Include both theoretical learning and practical application
- Design tasks that build upon each other week by week
- Tasks should be CONCRETE, not abstract (e.g., "Complete Lesson 1-3 on Duolingo" not "Study vocabulary")
- Include specific websites, apps, books, or tools when relevant
- Mention specific quantities, timeframes, or metrics when possible

🚨 CRITICAL: TASKS MUST BE EXTREMELY SPECIFIC TO THE STAGE CONTENT 🚨
If the stage is about "Present Tense -ar Verbs & Basic Introductions", tasks should be:
- "Practice conjugating 10 -ar verbs (hablar, estudiar, trabajar) using Conjuguemos.com for 15 minutes, aiming for 90% accuracy"
- "Complete Duolingo lessons on present tense -ar verbs (Basics 1, Units 1-3) and practice pronunciation"
- "Record yourself introducing yourself using: 'Hola, me llamo... Yo estudio español' and replay 3 times"
- "Practice greeting conversations with HelloTalk app for 15 minutes with native speakers"
- "Write 10 sentences using different -ar verbs: 'Yo hablo español', 'Tú estudias mucho', etc."
- "Watch YouTube SpanishDict video on -ar verb pronunciation and repeat each example 5 times"

🚫 NEVER USE ABSTRACT TASKS like:
- "Study Spanish grammar" → TOO VAGUE
- "Practice vocabulary" → TOO VAGUE  
- "Review concepts" → TOO VAGUE
- "Apply knowledge" → TOO VAGUE

✅ ALWAYS USE SPECIFIC TASKS like:
- "Complete Duolingo Unit 5: Family vocabulary (15 new words)"
- "Practice conjugating 'hablar' in all present tense forms using flashcards"
- "Watch Conjuguemos.com tutorial on -ar verbs and complete 20 practice questions"

PATTERN APPROACH FOR LONG STAGES:
- Week 1-4: Foundation pattern (basic level)
- Week 5-8: Development pattern (intermediate level)  
- Week 9-12: Application pattern (advanced level)
- Week 13+: Mastery pattern (expert level)
- Each pattern repeats with increasing complexity

TASK TYPES TO INCLUDE:
- Study: Learning new concepts, reading, watching tutorials
- Practice: Hands-on exercises, drills, repetition of skills
- Exercise: Practical applications, mini-projects, real-world scenarios
- Review: Consolidating previous learning, testing knowledge
- Project: Larger practical applications spanning multiple days
- Assessment: Self-evaluation, quizzes, skill checks

EXAMPLES OF SPECIFIC, ACTIONABLE TASKS THAT MATCH STAGE CONTENT:

LANGUAGE LEARNING (for "Present Tense -ar Verbs & Basic Introductions" stage):
- "Conjugate 10 -ar verbs (hablar, estudiar, trabajar, caminar, cocinar) using Conjuguemos.com with 90% accuracy"
- "Complete Duolingo Present Tense lessons: Basics 1 Units 1-3, focus on -ar verb endings"
- "Practice introductions: Record yourself saying 'Hola, me llamo [name]. Yo estudio español. ¿Cómo te llamas?'"
- "Write 15 sentences using different -ar verbs: 'Yo hablo español', 'Tú estudias mucho', 'Ella camina rápido'"

PROGRAMMING (for "HTML5 Semantic Elements & CSS Flexbox" stage):
- "Create a webpage using semantic HTML: header, nav, main, section, footer tags"
- "Build a 3-column layout using CSS Flexbox with justify-content and align-items"
- "Complete freeCodeCamp Responsive Web Design: CSS Flexbox lessons 1-8"
- "Code a navigation bar with flex properties: display: flex, space-between, center alignment"

FITNESS (for "Bodyweight Basics & Core Strength" stage):
- "Perform push-up progression: 3 sets of wall push-ups, focus on proper elbow position"
- "Hold plank position for 30 seconds, 3 times, maintaining straight line from head to heels"
- "Complete 3 sets of 10 bodyweight squats with proper knee tracking over toes"
- "Follow Yoga with Adriene 'Core Strength' 20-minute video, focus on breathing technique"

MUSIC (for "Basic Open Chords & Strumming Patterns" stage):
- "Practice G, C, D chord shapes for 15 minutes: clean finger placement, no buzzing strings"
- "Master chord transition G-C-G using JustinGuitar One Minute Changes exercise"
- "Learn down-down-up-up-down-up strumming pattern in 4/4 time using metronome at 60 BPM"
- "Play simple chord progression G-C-D-G for 'Wonderwall' intro using Simply Guitar app"

JSON format:
{
  "stage_summary": "Brief summary of what this stage accomplishes",
  "task_patterns": [
    {
      "pattern_name": "Foundation Pattern (Weeks 1-4)",
      "weeks_duration": 4,
      "weekly_tasks": [
        {
          "day_of_week": 1,
          "title": "Complete Duolingo Spanish Lessons 1-3",
          "description": "Open Duolingo app, complete lessons 1-3 in the Spanish basics course. Focus on pronunciation and repeat each word 3 times.",
          "estimated_minutes": ${timeCommitment},
          "type": "study|practice|exercise|review|project|assessment",
          "skills_practiced": ["basic vocabulary", "pronunciation"],
          "materials_needed": ["Duolingo app", "smartphone/computer", "headphones for pronunciation"],
          "success_criteria": "All 3 lessons completed with 80% accuracy or higher, pronunciation score above 75%",
          "specific_instructions": "Download Duolingo from app store, create account, select Spanish course, complete lessons with pronunciation enabled",
          "resources": ["https://duolingo.com", "Duolingo mobile app", "SpanishDict.com for reference"],
          "variations": ["Week 1: Lessons 1-3 (greetings)", "Week 2: Lessons 4-6 (family)", "Week 3: Lessons 7-9 (colors)", "Week 4: Lessons 10-12 (numbers)"]
        }
      ]
    }
  ],
  "stage_outcomes": ["What you should be able to do after completing all these tasks"],
  "progression_notes": "How difficulty increases across patterns"
}

Create tasks that build systematically through the stage, ensuring comprehensive coverage of all skills and concepts.`;
};
