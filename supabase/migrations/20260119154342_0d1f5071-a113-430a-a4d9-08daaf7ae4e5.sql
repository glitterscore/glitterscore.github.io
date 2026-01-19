-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.use_invite_code(invite_code TEXT, user_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  code_record RECORD;
BEGIN
  SELECT * INTO code_record FROM public.invite_codes WHERE code = invite_code AND uses_left > 0;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  UPDATE public.invite_codes 
  SET uses_left = uses_left - 1, used_by = user_uuid, used_at = now() 
  WHERE code = invite_code;
  
  RETURN true;
END;
$$;