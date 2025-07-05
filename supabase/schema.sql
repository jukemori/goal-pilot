-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  start_date DATE NOT NULL,
  target_date DATE,
  daily_time_commitment INTEGER, -- minutes
  weekly_schedule JSONB, -- {monday: true, tuesday: false, ...}
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  ai_generated_plan JSONB, -- Structured roadmap data
  milestones JSONB, -- Array of milestone objects
  ai_model TEXT DEFAULT 'gpt-3.5-turbo',
  prompt_version TEXT DEFAULT 'v1',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  rescheduled_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_roadmaps_goal_id ON roadmaps(goal_id);
CREATE INDEX idx_tasks_roadmap_id ON tasks(roadmap_id);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for goals table
CREATE POLICY "Users can view their own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for roadmaps table
CREATE POLICY "Users can view their own roadmaps" ON roadmaps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = roadmaps.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create roadmaps for their goals" ON roadmaps
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = roadmaps.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own roadmaps" ON roadmaps
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = roadmaps.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own roadmaps" ON roadmaps
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = roadmaps.goal_id AND goals.user_id = auth.uid()
  ));

-- RLS Policies for tasks table
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = tasks.roadmap_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create tasks for their roadmaps" ON tasks
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = tasks.roadmap_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = tasks.roadmap_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM roadmaps 
    JOIN goals ON goals.id = roadmaps.goal_id 
    WHERE roadmaps.id = tasks.roadmap_id AND goals.user_id = auth.uid()
  ));

-- Create functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();