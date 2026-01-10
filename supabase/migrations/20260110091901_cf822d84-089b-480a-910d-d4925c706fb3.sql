-- Enable realtime for payment_alerts table
ALTER TABLE public.payment_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_alerts;