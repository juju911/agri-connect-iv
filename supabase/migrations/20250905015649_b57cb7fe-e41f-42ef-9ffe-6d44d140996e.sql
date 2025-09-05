-- Configuration pour faire de kktjunior911@gmail.com un administrateur automatiquement
-- Modifier la fonction handle_new_user pour vérifier l'email admin

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur depuis raw_user_meta_data
  user_email := NEW.email;
  
  -- Si c'est l'email admin spécifique ou le premier utilisateur, le faire admin
  IF user_email = 'kktjunior911@gmail.com' OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Créer le profil admin
    INSERT INTO public.profiles (user_id, name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Administrateur'), 'admin');
  ELSE
    -- Attribuer le rôle user par défaut
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Créer le profil utilisateur
    INSERT INTO public.profiles (user_id, name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'), 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;