-- 1. Créer une fonction qui insère un message de bienvenue
   create or replace function public.handle_new_user()
     returns trigger
     language plpgsql
     security definer set search_path = public
     as $$
     begin
       insert into public.messages (content, user_id)
   values ('🎉 Bienvenue à ' || new.raw_user_meta_data->>'username' ||
      ' !', new.id);
     return new;
   end;
   $$;
   -- 2. Créer un déclencheur qui appelle cette fonction après chaque nouvelle inscription
   create or replace trigger on_auth_user_created
    after insert on auth.users
     for each row execute procedure public.handle_new_user();

-- 3. Les utilisateurs connectés peuvent voir tous les messages
    DROP POLICY IF EXISTS "Authenticated users can view messages." ON public.messages;
    create policy "Authenticated users can view messages."
    on public.messages for select
    to authenticated
    using ( true );

-- 4. Les utilisateurs connectés peuvent envoyer des messages
    DROP POLICY IF EXISTS "Authenticated users can insert messages." ON public.messages;
    create policy "Authenticated users can insert messages."
    on public.messages for insert
   to authenticated
   with check ( auth.uid() = user_id );

-- 5. Tout le monde peut voir les profils (pour afficher les pseudos)
   DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
   create policy "Profiles are viewable by everyone."
   on public.profiles for select
   using ( true );

-- 6. Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 7. Supprimer l'ancienne politique d'insertion de profil
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;

-- 8. Créer la nouvelle politique d'insertion de profil
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 9. Activer RLS pour les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;