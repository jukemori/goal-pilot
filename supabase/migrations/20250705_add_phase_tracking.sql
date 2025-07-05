-- Add phase tracking to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS phase_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS phase_number INTEGER;

-- Create index for phase queries
CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_number ON tasks(phase_number);

-- Add learning_phases table to store phase details separately
CREATE TABLE IF NOT EXISTS learning_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL, -- e.g., "phase-1"
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  skills_to_learn TEXT[],
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_phases_roadmap_id ON learning_phases(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_learning_phases_status ON learning_phases(status);

-- Enable RLS
ALTER TABLE learning_phases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_phases table
CREATE POLICY "Users can view their own learning phases" ON learning_phases
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = learning_phases.roadmap_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create learning phases for their roadmaps" ON learning_phases
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = learning_phases.roadmap_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own learning phases" ON learning_phases
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = learning_phases.roadmap_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own learning phases" ON learning_phases
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = learning_phases.roadmap_id AND goals.user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE TRIGGER update_learning_phases_updated_at BEFORE UPDATE ON learning_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to extract and populate learning phases from existing roadmaps
CREATE OR REPLACE FUNCTION populate_learning_phases()
RETURNS void AS $$
DECLARE
  r RECORD;
  phase JSONB;
  phase_index INTEGER;
  phase_start_date DATE;
  phase_end_date DATE;
  week_offset INTEGER := 0;
BEGIN
  FOR r IN SELECT id, goal_id, ai_generated_plan FROM roadmaps WHERE ai_generated_plan IS NOT NULL
  LOOP
    -- Get the start date from the associated goal
    SELECT start_date INTO phase_start_date FROM goals WHERE id = r.goal_id;
    
    IF r.ai_generated_plan ? 'phases' THEN
      phase_index := 1;
      week_offset := 0;
      
      FOR phase IN SELECT * FROM jsonb_array_elements(r.ai_generated_plan->'phases')
      LOOP
        -- Calculate phase dates
        phase_start_date := (SELECT start_date FROM goals WHERE id = r.goal_id) + (week_offset * INTERVAL '1 week');
        phase_end_date := phase_start_date + ((phase->>'duration_weeks')::INTEGER * INTERVAL '1 week') - INTERVAL '1 day';
        
        -- Insert learning phase
        INSERT INTO learning_phases (
          roadmap_id,
          phase_id,
          phase_number,
          title,
          description,
          duration_weeks,
          skills_to_learn,
          start_date,
          end_date,
          status
        ) VALUES (
          r.id,
          phase->>'id',
          phase_index,
          phase->>'title',
          phase->>'description',
          (phase->>'duration_weeks')::INTEGER,
          ARRAY(SELECT jsonb_array_elements_text(phase->'skills_to_learn')),
          phase_start_date,
          phase_end_date,
          CASE 
            WHEN phase_start_date <= CURRENT_DATE AND CURRENT_DATE <= phase_end_date THEN 'active'
            WHEN phase_end_date < CURRENT_DATE THEN 'completed'
            ELSE 'pending'
          END
        ) ON CONFLICT DO NOTHING;
        
        -- Update week offset for next phase
        week_offset := week_offset + COALESCE((phase->>'duration_weeks')::INTEGER, 4);
        phase_index := phase_index + 1;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Populate learning phases from existing roadmaps
SELECT populate_learning_phases();

-- Drop the function after use
DROP FUNCTION populate_learning_phases();