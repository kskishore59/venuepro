-- Function to check if email or phone is already registered in auth.users
CREATE OR REPLACE FUNCTION public.check_user_exists(check_email TEXT, check_phone TEXT)
RETURNS TABLE(email_exists BOOLEAN, phone_exists BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 FROM auth.users 
      WHERE email = check_email
    ) AS email_exists,
    EXISTS(
      SELECT 1 FROM auth.users 
      WHERE phone = check_phone 
         OR raw_user_meta_data->>'phone' = check_phone
    ) AS phone_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
