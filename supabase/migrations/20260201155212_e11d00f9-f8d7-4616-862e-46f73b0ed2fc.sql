-- Add additional company profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_address text,
ADD COLUMN IF NOT EXISTS company_representative text,
ADD COLUMN IF NOT EXISTS company_phone text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create index for faster onboarding checks
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(user_id, onboarding_completed);