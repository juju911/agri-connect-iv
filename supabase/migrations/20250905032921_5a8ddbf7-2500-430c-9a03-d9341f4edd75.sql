-- Créer le profil manquant pour l'utilisateur connecté
INSERT INTO public.profiles (user_id, name, role, phone, location)
VALUES (
  'a78a0f18-9837-4070-afd0-5d985160d290', 
  'Koui gisele', 
  'agriculteur',
  '+22507472254490',
  'YAOU'
);

-- Créer le rôle utilisateur si la table user_roles existe
INSERT INTO public.user_roles (user_id, role)
VALUES ('a78a0f18-9837-4070-afd0-5d985160d290', 'user')
ON CONFLICT (user_id, role) DO NOTHING;