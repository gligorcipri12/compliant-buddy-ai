-- Create compliance_categories table (GDPR, TVA, Contracte, Fiscal)
CREATE TABLE public.compliance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Shield',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance_items table (individual checklist items)
CREATE TABLE public.compliance_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.compliance_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('done', 'warning', 'pending')),
  action_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deadlines table
CREATE TABLE public.deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  deadline_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'fiscal',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.compliance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

-- RLS policies for compliance_categories
CREATE POLICY "Users can view their own categories" ON public.compliance_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.compliance_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.compliance_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.compliance_categories FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for compliance_items
CREATE POLICY "Users can view their own items" ON public.compliance_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own items" ON public.compliance_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON public.compliance_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON public.compliance_items FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for deadlines
CREATE POLICY "Users can view their own deadlines" ON public.deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deadlines" ON public.deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deadlines" ON public.deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deadlines" ON public.deadlines FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_compliance_categories_updated_at
  BEFORE UPDATE ON public.compliance_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_items_updated_at
  BEFORE UPDATE ON public.compliance_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
  BEFORE UPDATE ON public.deadlines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();