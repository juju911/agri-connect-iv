-- Ajouter les rôles métier à l'enum app_role
ALTER TYPE public.app_role ADD VALUE 'agriculteur';
ALTER TYPE public.app_role ADD VALUE 'acheteur';

-- Supprimer l'ancienne fonction handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer la fonction handle_new_user avec la bonne logique des rôles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Récupérer l'email et le rôle de l'utilisateur depuis raw_user_meta_data
  user_email := NEW.email;
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'acheteur'); -- Default to 'acheteur' if no role specified
  
  -- Si c'est l'email admin spécifique ou le premier utilisateur, le faire admin
  IF user_email = 'kktjunior911@gmail.com' OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Créer le profil admin
    INSERT INTO public.profiles (user_id, name, role, phone, location)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', 'Administrateur'), 
      'admin',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'location'
    );
  ELSE
    -- Utiliser le rôle spécifié dans les metadata (agriculteur ou acheteur)
    -- Maintenant on peut utiliser le vrai rôle grâce à l'enum étendu
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role::app_role);
    
    -- Créer le profil avec le bon rôle métier
    INSERT INTO public.profiles (user_id, name, role, phone, location)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'), 
      user_role,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'location'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Créer le profil et rôle correct pour l'utilisateur actuel
INSERT INTO public.profiles (user_id, name, role, phone, location)
VALUES (
  'a78a0f18-9837-4070-afd0-5d985160d290', 
  'Koui gisele', 
  'agriculteur',
  '+22507472254490',
  'YAOU'
) ON CONFLICT (user_id) DO NOTHING;

-- Créer le rôle utilisateur correct
INSERT INTO public.user_roles (user_id, role)
VALUES ('a78a0f18-9837-4070-afd0-5d985160d290', 'agriculteur')
ON CONFLICT (user_id, role) DO NOTHING;