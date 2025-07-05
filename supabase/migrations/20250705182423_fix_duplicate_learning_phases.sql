-- Migration to fix duplicate learning phases and prevent future duplicates

-- First, remove duplicate learning phases keeping only the first occurrence
DELETE FROM learning_phases 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM learning_phases 
  GROUP BY roadmap_id, phase_id
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE learning_phases 
ADD CONSTRAINT unique_roadmap_phase 
UNIQUE (roadmap_id, phase_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_phases_roadmap_phase 
ON learning_phases (roadmap_id, phase_id);