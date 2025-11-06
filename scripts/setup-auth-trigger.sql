-- Function to handle new user creation
-- This trigger automatically creates a user profile when someone signs up
-- SECURITY DEFINER allows it to bypass RLS policies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, role, token_balance, current_streak, longest_streak, total_responses, total_curations)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'FREE',
    0,
    0,
    0,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure users table has proper RLS policy for the trigger
-- Note: The trigger runs with SECURITY DEFINER so it bypasses RLS
-- But we still need policies for normal operations

-- Drop and recreate the INSERT policy (if it doesn't exist, this won't error)
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;

CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
