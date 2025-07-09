-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Notification preferences
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  daily_reminders BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  -- Calendar preferences
  start_of_week TEXT DEFAULT 'sunday' CHECK (start_of_week IN ('sunday', 'monday')),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one preferences row per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create preferences for new users
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create preferences when a user is created
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_preferences();

-- Create preferences for existing users
INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;