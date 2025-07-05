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

  return `Create a comprehensive learning roadmap for the following goal:

Goal: ${goal}
Current Level: ${currentLevel}
Daily Time Commitment: ${timeCommitment} minutes
Available Days: ${availableDays}
Start Date: ${startDate}
${targetDate ? `Target Completion Date: ${targetDate}` : 'No specific deadline'}

IMPORTANT: All dates must be in ${currentYear} or later. Use the start date (${startDate}) as your reference point.

Please generate a structured roadmap with a COMPLETE daily task schedule from start to completion. Each phase should contain enough specific, actionable tasks to fill the entire duration.

For ${timeCommitment} minutes per day on ${availableDays}, create daily tasks that are realistic and achievable.

IMPORTANT: Generate AT LEAST 30-60 daily tasks per phase to ensure continuous progress. Each task should be specific and actionable.

JSON format:
{
  "overview": "Brief overview of the learning journey",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase title",
      "description": "What this phase covers",
      "duration_weeks": 4,
      "skills_to_learn": ["skill1", "skill2"],
      "daily_tasks": [
        {
          "day": 1,
          "title": "Specific daily task",
          "description": "Detailed task description",
          "estimated_minutes": ${timeCommitment},
          "type": "practice|study|exercise|review"
        }
      ]
    }
  ],
  "estimated_completion_date": "YYYY-MM-DD",
  "total_hours_required": 120,
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Milestone title",
      "description": "What achieving this milestone means",
      "target_date": "YYYY-MM-DD"
    }
  ]
}

Consider the user's current level and available time. Make the roadmap realistic and achievable.
Break down complex goals into smaller, manageable phases with clear milestones.`
}