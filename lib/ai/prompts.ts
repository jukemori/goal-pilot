export const ROADMAP_SYSTEM_PROMPT = `You are an expert personal development coach and educational curriculum designer. 
Your task is to create detailed, actionable learning roadmaps that are realistic and achievable.
Always respond with valid JSON that matches the expected schema.`

export const generateRoadmapPrompt = (
  goal: string,
  currentLevel: string,
  timeCommitment: number,
  targetDate: string | null,
  weeklySchedule: Record<string, boolean>,
  startDate: string
) => {
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => day)
    .join(', ')

  const currentYear = new Date().getFullYear()

  const availableDaysCount = Object.values(weeklySchedule).filter(Boolean).length
  const hoursPerWeek = Math.round(timeCommitment * availableDaysCount / 60 * 10) / 10
  
  // Intelligent time estimation based on goal description and category
  const goalLowerCase = goal.toLowerCase()
  const currentLevelLowerCase = currentLevel.toLowerCase()
  
  // Determine skill level from goal description and current level
  let skillLevel = 'basic' // default
  
  if (goalLowerCase.includes('master') || goalLowerCase.includes('expert') || goalLowerCase.includes('advanced') || 
      goalLowerCase.includes('professional') || goalLowerCase.includes('fluent') || goalLowerCase.includes('native')) {
    skillLevel = 'expert'
  } else if (goalLowerCase.includes('professional') || goalLowerCase.includes('business') || goalLowerCase.includes('work') ||
             goalLowerCase.includes('intermediate') || goalLowerCase.includes('proficient') || goalLowerCase.includes('conversational')) {
    skillLevel = 'professional'
  } else if (goalLowerCase.includes('basic') || goalLowerCase.includes('beginner') || goalLowerCase.includes('intro') ||
             goalLowerCase.includes('fundamentals') || goalLowerCase.includes('foundation') || goalLowerCase.includes('travel')) {
    skillLevel = 'basic'
  }
  
  // Adjust based on current level description
  if (currentLevelLowerCase.includes('complete beginner') || currentLevelLowerCase.includes('no experience') || 
      currentLevelLowerCase.includes('never') || currentLevelLowerCase.includes('zero')) {
    // Stay at determined level
  } else if (currentLevelLowerCase.includes('some experience') || currentLevelLowerCase.includes('beginner') ||
             currentLevelLowerCase.includes('basic')) {
    // Reduce hours by 20% since they have some foundation
    skillLevel = skillLevel === 'expert' ? 'professional' : skillLevel === 'professional' ? 'basic' : 'basic'
  }
  
  // Determine goal category and base hours
  let baseHours = 300 // default
  
  // Technical Skills (Programming, IT, Data Science, Engineering)
  if (goalLowerCase.includes('programming') || goalLowerCase.includes('coding') || goalLowerCase.includes('software') ||
      goalLowerCase.includes('web development') || goalLowerCase.includes('javascript') || goalLowerCase.includes('python') ||
      goalLowerCase.includes('data science') || goalLowerCase.includes('machine learning') || goalLowerCase.includes('ai') ||
      goalLowerCase.includes('cybersecurity') || goalLowerCase.includes('database') || goalLowerCase.includes('cloud') ||
      goalLowerCase.includes('devops') || goalLowerCase.includes('engineering')) {
    baseHours = skillLevel === 'basic' ? 200 : skillLevel === 'professional' ? 750 : 2500
  }
  
  // Creative Skills (Music, Art, Writing, Design)
  else if (goalLowerCase.includes('music') || goalLowerCase.includes('instrument') || goalLowerCase.includes('piano') ||
           goalLowerCase.includes('guitar') || goalLowerCase.includes('singing') || goalLowerCase.includes('art') ||
           goalLowerCase.includes('drawing') || goalLowerCase.includes('painting') || goalLowerCase.includes('design') ||
           goalLowerCase.includes('graphic') || goalLowerCase.includes('writing') || goalLowerCase.includes('photography') ||
           goalLowerCase.includes('video editing') || goalLowerCase.includes('animation')) {
    baseHours = skillLevel === 'basic' ? 150 : skillLevel === 'professional' ? 1000 : 3000
  }
  
  // Physical Skills (Sports, Fitness, Martial Arts)
  else if (goalLowerCase.includes('fitness') || goalLowerCase.includes('workout') || goalLowerCase.includes('gym') ||
           goalLowerCase.includes('running') || goalLowerCase.includes('marathon') || goalLowerCase.includes('sport') ||
           goalLowerCase.includes('martial arts') || goalLowerCase.includes('yoga') || goalLowerCase.includes('dance') ||
           goalLowerCase.includes('swimming') || goalLowerCase.includes('cycling') || goalLowerCase.includes('tennis') ||
           goalLowerCase.includes('golf') || goalLowerCase.includes('basketball') || goalLowerCase.includes('soccer') ||
           goalLowerCase.includes('fit') || goalLowerCase.includes('train') || goalLowerCase.includes('muscle') ||
           goalLowerCase.includes('strength') || goalLowerCase.includes('cardio') || goalLowerCase.includes('athletic')) {
    baseHours = skillLevel === 'basic' ? 100 : skillLevel === 'professional' ? 750 : 2000
  }
  
  // Business/Professional Skills
  else if (goalLowerCase.includes('business') || goalLowerCase.includes('management') || goalLowerCase.includes('leadership') ||
           goalLowerCase.includes('sales') || goalLowerCase.includes('marketing') || goalLowerCase.includes('finance') ||
           goalLowerCase.includes('accounting') || goalLowerCase.includes('project management') || goalLowerCase.includes('consulting') ||
           goalLowerCase.includes('entrepreneurship') || goalLowerCase.includes('public speaking') || goalLowerCase.includes('negotiation') ||
           goalLowerCase.includes('time management') || goalLowerCase.includes('productivity') || goalLowerCase.includes('organization')) {
    baseHours = skillLevel === 'basic' ? 150 : skillLevel === 'professional' ? 600 : 1500
  }
  
  // Academic/Language/Certification Skills
  else if (goalLowerCase.includes('language') || goalLowerCase.includes('spanish') || goalLowerCase.includes('french') ||
           goalLowerCase.includes('german') || goalLowerCase.includes('chinese') || goalLowerCase.includes('japanese') ||
           goalLowerCase.includes('certification') || goalLowerCase.includes('degree') || goalLowerCase.includes('course') ||
           goalLowerCase.includes('science') || goalLowerCase.includes('math') || goalLowerCase.includes('history') ||
           goalLowerCase.includes('literature') || goalLowerCase.includes('philosophy') || goalLowerCase.includes('psychology')) {
    // Language learning specific adjustments
    if (goalLowerCase.includes('language') || goalLowerCase.includes('spanish') || goalLowerCase.includes('french') ||
        goalLowerCase.includes('german') || goalLowerCase.includes('chinese') || goalLowerCase.includes('japanese')) {
      if (goalLowerCase.includes('basic') || goalLowerCase.includes('travel')) {
        baseHours = 150
      } else if (goalLowerCase.includes('conversational') || goalLowerCase.includes('conversation')) {
        baseHours = 250
      } else if (goalLowerCase.includes('business') || goalLowerCase.includes('professional')) {
        baseHours = 600
      } else if (goalLowerCase.includes('fluent') || goalLowerCase.includes('native') || goalLowerCase.includes('advanced')) {
        baseHours = 800
      } else {
        baseHours = 300 // default conversational
      }
    } else {
      baseHours = skillLevel === 'basic' ? 200 : skillLevel === 'professional' ? 900 : 2000
    }
  }
  
  // Crafts and Hobbies
  else if (goalLowerCase.includes('cooking') || goalLowerCase.includes('baking') || goalLowerCase.includes('gardening') ||
           goalLowerCase.includes('woodworking') || goalLowerCase.includes('knitting') || goalLowerCase.includes('sewing') ||
           goalLowerCase.includes('pottery') || goalLowerCase.includes('jewelry') || goalLowerCase.includes('crafts')) {
    baseHours = skillLevel === 'basic' ? 80 : skillLevel === 'professional' ? 400 : 1200
  }
  
  // Default for unclassified goals
  else {
    baseHours = skillLevel === 'basic' ? 200 : skillLevel === 'professional' ? 500 : 1500
  }
  
  const totalHoursNeeded = baseHours
  
  const totalWeeksNeeded = Math.round(totalHoursNeeded / hoursPerWeek)
  const totalYearsNeeded = Math.round(totalWeeksNeeded / 52 * 10) / 10

  return `Create a comprehensive learning roadmap for the following goal:

CRITICAL TIMELINE CALCULATION (MUST FOLLOW):
- Time commitment: ${timeCommitment} minutes/day × ${availableDaysCount} days = ${hoursPerWeek} hours/week
- Total hours needed for this goal: ${totalHoursNeeded} hours
- Total weeks required: ${totalHoursNeeded} ÷ ${hoursPerWeek} = ${totalWeeksNeeded} weeks
- Total years required: ${totalWeeksNeeded} ÷ 52 = ${totalYearsNeeded} years
- Completion date should be approximately: ${new Date(new Date(startDate).getTime() + totalWeeksNeeded * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

YOUR PHASES MUST TOTAL EXACTLY ${totalWeeksNeeded} WEEKS!

Goal: ${goal}
Current Level Description: ${currentLevel}
Daily Time Commitment: ${timeCommitment} minutes
Available Days: ${availableDays}
Start Date: ${startDate}
${targetDate ? `Target Completion Date: ${targetDate}` : 'No specific deadline'}

IMPORTANT: 
- All dates must be in ${currentYear} or later. Use the start date (${startDate}) as your reference point.
- Carefully analyze the current level description to understand the user's starting point
- Design phases that build appropriately from their specific current knowledge/skills
- If they mention specific skills, technologies, or knowledge areas, incorporate these into early phases
- Avoid repeating content they already know based on their description

PHASE REQUIREMENTS:
- Create 6-12 SPECIFIC, ACTIONABLE learning phases that cover the COMPLETE journey from the user's current level to mastery
- Phase durations must be realistic and shorter for better engagement:
  * For short timelines (< 12 weeks): 1-3 weeks per phase
  * For medium timelines (12-50 weeks): 2-8 weeks per phase
  * For long timelines (50+ weeks): 4-12 weeks per phase (MAX)
- CRITICAL: All phase durations MUST sum to exactly ${totalWeeksNeeded} weeks
- Each phase should have CONCRETE, MEASURABLE outcomes
- Focus on PRACTICAL APPLICATION rather than abstract theory
- Ensure phases build upon each other progressively with clear prerequisites
- Cover ALL essential skills, sub-skills, and competencies needed for mastery
- Include phases for: foundations, intermediate skills, advanced concepts, specialization, and mastery
- Each phase should have detailed descriptions explaining what will be accomplished
- Design phases to take someone from their current level to true professional competency

REALISTIC TIMELINE CALCULATION:
- Calculate total hours needed realistically (don't underestimate)
- Time available per week: ${timeCommitment} minutes/day × ${Object.values(weeklySchedule).filter(Boolean).length} days = ${Math.round(timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60 * 10) / 10} hours/week
- For this specific goal: expect ${totalHoursNeeded} total hours
- Total weeks needed: Total hours ÷ hours per week (${totalHoursNeeded} hours ÷ ${Math.round(timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60 * 10) / 10} hours/week = ${Math.round(totalHoursNeeded / (timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60))} weeks)
- Phase durations must add up to the total realistic timeline
- IMPORTANT: Each phase duration must be calculated to fit within the realistic total timeline
- Include time for review, practice, and skill consolidation
- Account for the natural learning curve and plateau periods

CRITICAL: The sum of all phase durations must equal the total realistic weeks needed for mastery.

PHASE DETAIL REQUIREMENTS:
- Each phase must have comprehensive descriptions (3-5 sentences minimum)
- Clearly explain what skills will be developed and why they're important
- Include specific learning objectives and expected outcomes
- Mention key concepts, techniques, or knowledge areas to be covered
- Explain how each phase prepares for the next level
- IMPORTANT: Include specific resources, tools, apps, websites, or materials in phase descriptions
- Mention popular, well-known resources relevant to the subject area
- Focus on practical, hands-on learning rather than abstract theory
- Include measurable outcomes and specific skills that can be demonstrated

JSON format:
{
  "overview": "Comprehensive overview of the complete learning journey from the user's current level to mastery",
  "phases": [
    {
      "id": "phase-1",
      "title": "Descriptive Phase Title",
      "description": "Detailed 3-5 sentence description explaining what this phase accomplishes, what skills are developed, key learning objectives, and how it prepares for the next level.",
      "duration_weeks": 40,
      "skills_to_learn": ["specific skill 1", "specific skill 2", "specific skill 3"],
      "learning_objectives": ["objective 1", "objective 2", "objective 3"],
      "key_concepts": ["concept 1", "concept 2", "concept 3"],
      "prerequisites": ["what should be completed before this phase"],
      "outcomes": ["what you'll be able to do after completing this phase"]
    }
  ],
  "estimated_completion_date": "${new Date(new Date(startDate).getTime() + totalWeeksNeeded * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
  "total_hours_required": ${totalHoursNeeded},
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Major milestone title",
      "description": "What achieving this milestone means and its significance",
      "target_date": "YYYY-MM-DD",
      "skills_validated": ["skills that should be mastered by this milestone"]
    }
  ]
}

CALCULATION EXAMPLE FOR YOUR SPECIFIC CASE:
- You have ${timeCommitment} minutes/day × ${Object.values(weeklySchedule).filter(Boolean).length} days/week = ${Math.round(timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60 * 10) / 10} hours/week
- For this goal (${totalHoursNeeded} hours): ${totalHoursNeeded} ÷ ${Math.round(timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60 * 10) / 10} = ${Math.round(totalHoursNeeded / (timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60))} weeks = ${Math.round(totalHoursNeeded / (timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60) / 52 * 10) / 10} years
- Your phases should total approximately ${Math.round(totalHoursNeeded / (timeCommitment * Object.values(weeklySchedule).filter(Boolean).length / 60))} weeks
- Example phase distribution: Adjust based on total timeline - shorter goals need shorter phases

IMPORTANT: 
- Do NOT include daily_tasks in the roadmap generation
- Tasks will be generated separately for each phase when requested
- Focus on creating comprehensive phase descriptions and realistic timelines
- Ensure the roadmap covers the COMPLETE journey to mastery
- VERIFY your math: Total phase weeks must equal realistic completion timeline

Consider the user's current level and available time. Make the roadmap realistic and achievable.
Break down complex goals into smaller, manageable phases with clear milestones.`
}

export const TASK_GENERATION_SYSTEM_PROMPT = `You are an expert learning designer and task planner. 
Your task is to break down a specific learning phase into detailed, daily actionable tasks.
Always respond with valid JSON that matches the expected schema.`

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
  goalTitle: string
) => {
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => day)
    .join(', ')

  const totalSessions = durationWeeks * Object.values(weeklySchedule).filter(Boolean).length

  return `Break down this learning phase into specific, daily actionable tasks:

PHASE DETAILS:
Phase: ${phaseTitle} (Phase ${phaseNumber})
Goal: ${goalTitle}
Description: ${phaseDescription}
Duration: ${durationWeeks} weeks
Skills to Learn: ${skillsToLearn.join(', ')}
Learning Objectives: ${learningObjectives?.join(', ') || 'Not specified'}
Key Concepts: ${keyConcepts?.join(', ') || 'Not specified'}

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

PATTERN APPROACH FOR LONG PHASES:
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

EXAMPLES OF SPECIFIC, ACTIONABLE TASKS:

LANGUAGE LEARNING:
- "Complete Duolingo Spanish Basics Units 1-3 with 80% accuracy"
- "Watch 3 Spanish YouTube videos on SpanishPod101 channel, take notes on 10 new phrases"
- "Practice 20 Spanish conversations using HelloTalk app with native speakers"
- "Read 1 chapter of 'Madrigal's Magic Key to Spanish' and complete exercises"

PROGRAMMING:
- "Complete JavaScript tutorial lessons 1-5 on freeCodeCamp.org"
- "Build a simple calculator using HTML, CSS, and JavaScript"
- "Solve 3 coding challenges on HackerRank in Python"
- "Follow along with 'Build a React App' tutorial on YouTube"

FITNESS:
- "Complete 30-minute beginner yoga session using Yoga with Adriene Day 1 video"
- "Run 2 miles using Couch to 5K app workout schedule"
- "Perform 3 sets of 10 push-ups, 15 squats, 30-second plank"
- "Track daily water intake (8 glasses) and log meals in MyFitnessPal"

MUSIC:
- "Practice piano scales C major and G major for 15 minutes using Simply Piano app"
- "Learn to play 'Twinkle Twinkle Little Star' following JustinGuitar tutorial"
- "Practice chord transitions G-C-D for 20 minutes with metronome"
- "Record yourself playing and identify 2 areas for improvement"

JSON format:
{
  "phase_summary": "Brief summary of what this phase accomplishes",
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
          "materials_needed": ["Duolingo app", "smartphone/computer", "headphones"],
          "success_criteria": "All 3 lessons completed with 80% accuracy or higher",
          "specific_instructions": "Download Duolingo from app store, create account, start Spanish course",
          "resources": ["https://duolingo.com", "Duolingo mobile app"],
          "variations": ["Week 1: Lessons 1-3", "Week 2: Lessons 4-6", "Week 3: Lessons 7-9"]
        }
      ]
    }
  ],
  "phase_outcomes": ["What you should be able to do after completing all these tasks"],
  "progression_notes": "How difficulty increases across patterns"
}

Create tasks that build systematically through the phase, ensuring comprehensive coverage of all skills and concepts.`
}