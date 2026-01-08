-- Create payment_alerts table for admin notifications
CREATE TABLE public.payment_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'failed_payment', 'chargeback', 'refund'
  reference TEXT NOT NULL,
  amount NUMERIC,
  user_id UUID,
  order_id UUID,
  details JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins/staff can view alerts
CREATE POLICY "Admins can view payment alerts" 
ON public.payment_alerts 
FOR SELECT 
USING (public.is_admin_or_staff(auth.uid()));

-- Only admins/staff can update alerts
CREATE POLICY "Admins can update payment alerts" 
ON public.payment_alerts 
FOR UPDATE 
USING (public.is_admin_or_staff(auth.uid()));

-- Service role can insert alerts (from edge functions)
CREATE POLICY "Service role can insert alerts"
ON public.payment_alerts
FOR INSERT
WITH CHECK (true);