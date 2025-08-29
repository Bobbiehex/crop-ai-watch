-- Create table for drone recordings
CREATE TABLE public.drone_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT NOT NULL,
  location TEXT NOT NULL,
  recording_url TEXT,
  recording_data BYTEA, -- Store video data as binary
  duration INTEGER DEFAULT 0, -- Duration in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.drone_recordings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own recordings" 
ON public.drone_recordings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recordings" 
ON public.drone_recordings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings" 
ON public.drone_recordings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings" 
ON public.drone_recordings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_drone_recordings_updated_at
BEFORE UPDATE ON public.drone_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();