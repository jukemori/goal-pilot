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
  
  // Intelligent time estimation based on goal description
  const goalLowerCase = goal.toLowerCase()
  let totalHoursNeeded = 300 // Default for basic conversational
  
  if (goalLowerCase.includes('business') || goalLowerCase.includes('professional') || goalLowerCase.includes('work')) {
    totalHoursNeeded = 600 // Professional level
  } else if (goalLowerCase.includes('fluent') || goalLowerCase.includes('native') || goalLowerCase.includes('advanced')) {
    totalHoursNeeded = 800 // Advanced/fluent level
  } else if (goalLowerCase.includes('conversational') || goalLowerCase.includes('conversation') || goalLowerCase.includes('speak')) {
    totalHoursNeeded = 250 // Conversational level
  } else if (goalLowerCase.includes('basic') || goalLowerCase.includes('beginner') || goalLowerCase.includes('travel')) {
    totalHoursNeeded = 150 // Basic travel level
  }
  
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
- Create 8-15 comprehensive learning phases that cover the COMPLETE journey from the user's current level to mastery
- Phase durations must be realistic for ${totalWeeksNeeded} total weeks:
  * For short timelines (< 50 weeks): 4-12 weeks per phase
  * For medium timelines (50-100 weeks): 8-20 weeks per phase
  * For long timelines (100+ weeks): 15-40 weeks per phase
- CRITICAL: All phase durations MUST sum to exactly ${totalWeeksNeeded} weeks
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
- Create a weekly pattern of tasks that will be repeated across ${durationWeeks} weeks
- Generate exactly ${Object.values(weeklySchedule).filter(Boolean).length} task templates per week (one for each available day)
- Each task should be achievable in ${timeCommitment} minutes
- Tasks should progress logically through difficulty levels
- FOCUS ON PATTERNS: Create task templates that can be repeated with variations
- Include a variety of task types: study, practice, exercise, review, project, assessment
- Tasks should directly support the learning objectives and skill development
- Include both theoretical learning and practical application
- Design tasks that build upon each other week by week
- Make each task specific enough that someone knows exactly what to do

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

EXAMPLES FOR LONG PHASES (20+ weeks):
- Vocabulary practice: Repeat with different word sets each week
- Grammar drills: Same concept with increasing complexity
- Conversation practice: Same topics with deeper exploration
- Writing exercises: Similar formats with new themes
- Week 1-4: Introduction and basic practice
- Week 5-8: Intermediate practice with variations
- Week 9-12: Advanced applications
- Week 13-16: Mastery and refinement
- Continue patterns for longer phases

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
          "title": "Specific, actionable task title",
          "description": "Detailed description with variables like {week_number}, {difficulty_level}",
          "estimated_minutes": ${timeCommitment},
          "type": "study|practice|exercise|review|project|assessment",
          "skills_practiced": ["specific skill 1", "specific skill 2"],
          "materials_needed": ["resource 1", "resource 2"],
          "success_criteria": "How to know the task was completed successfully",
          "variations": ["How this task changes each week in this pattern"]
        }
      ]
    }
  ],
  "phase_outcomes": ["What you should be able to do after completing all these tasks"],
  "progression_notes": "How difficulty increases across patterns"
}

Create tasks that build systematically through the phase, ensuring comprehensive coverage of all skills and concepts.`
}