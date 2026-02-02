-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table (junction table for teams and users)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, email, status)
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  deadline_reminder_days INTEGER NOT NULL DEFAULT 3,
  weekly_summary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance_history table for tracking changes
CREATE TABLE public.compliance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.compliance_items(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add team_id to profiles for associating users with teams
ALTER TABLE public.profiles ADD COLUMN current_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_history ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has role in team
CREATE OR REPLACE FUNCTION public.has_team_role(_user_id UUID, _team_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND team_id = _team_id
      AND role = _role
  )
$$;

-- Function to check if user is team member (any role)
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND team_id = _team_id
  )
$$;

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
USING (public.is_team_member(auth.uid(), id) OR owner_id = auth.uid());

CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
ON public.teams FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams"
ON public.teams FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Team members can view team membership"
ON public.team_members FOR SELECT
USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team owners/admins can add members"
ON public.team_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()
  ) OR public.has_team_role(auth.uid(), team_id, 'admin')
);

CREATE POLICY "Team owners can update members"
ON public.team_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Team owners can remove members"
ON public.team_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

-- RLS Policies for team_invitations
CREATE POLICY "Team members can view invitations"
ON public.team_invitations FOR SELECT
USING (public.is_team_member(auth.uid(), team_id) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Team owners/admins can create invitations"
ON public.team_invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()
  ) OR public.has_team_role(auth.uid(), team_id, 'admin')
);

CREATE POLICY "Invited users can update invitation status"
ON public.team_invitations FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Team owners can delete invitations"
ON public.team_invitations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid()
  )
);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their notification preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their notification preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notification preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for compliance_history
CREATE POLICY "Users can view their compliance history"
ON public.compliance_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their compliance history"
ON public.compliance_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_compliance_history_user_id ON public.compliance_history(user_id);
CREATE INDEX idx_compliance_history_created_at ON public.compliance_history(created_at DESC);