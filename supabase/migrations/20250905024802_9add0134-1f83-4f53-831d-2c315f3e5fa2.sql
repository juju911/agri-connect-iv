-- Fix the handle_new_user trigger to properly handle user roles from signup metadata
-- The trigger was assigning 'user' role which is not allowed in profiles table constraint

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    -- Mais assigner 'user' dans user_roles pour la compatibilité
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Créer le profil avec le bon rôle métier (agriculteur/acheteur)
    INSERT INTO public.profiles (user_id, name, role, phone, location)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'), 
      user_role, -- Utiliser le rôle depuis les metadata
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'location'
    );
  END IF;
  
  RETURN NEW;
END;
$$;