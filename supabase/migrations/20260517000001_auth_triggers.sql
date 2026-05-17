-- Helper function to generate a URL-friendly slug
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Lowercase, replace non-alphanumerics with hyphens, strip leading/trailing hyphens, append random string
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g')) || '-' || substr(md5(random()::text), 1, 6);
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signups from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
BEGIN
  -- Extract the venue name from the user's metadata (passed during sign up)
  org_name := COALESCE(new.raw_user_meta_data->>'venueName', new.raw_user_meta_data->>'full_name', 'My Venue');

  -- Create a new organization for this user
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, public.generate_slug(org_name))
  RETURNING id INTO new_org_id;

  -- Create a profile for the user linked to their new organization
  INSERT INTO public.profiles (id, org_id, full_name, role)
  VALUES (
    new.id,
    new_org_id,
    new.raw_user_meta_data->>'full_name',
    'admin' -- Set first user as admin
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
