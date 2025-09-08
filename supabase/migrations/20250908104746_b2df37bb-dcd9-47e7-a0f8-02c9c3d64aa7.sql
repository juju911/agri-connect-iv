-- Ajouter le statut 'expired' à l'enum des statuts de subscription
DO $$ 
BEGIN
    -- Vérifier si la colonne status existe et si l'enum subscription_status existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        -- Vérifier si le statut 'expired' n'existe pas déjà
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumlabel = 'expired'
            AND enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = (
                    SELECT udt_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'subscriptions' 
                    AND column_name = 'status' 
                    AND table_schema = 'public'
                )
            )
        ) THEN
            -- Ajouter le statut 'expired' à l'enum existant
            ALTER TYPE (
                SELECT udt_name 
                FROM information_schema.columns 
                WHERE table_name = 'subscriptions' 
                AND column_name = 'status' 
                AND table_schema = 'public'
            ) ADD VALUE 'expired';
        END IF;
    ELSE
        -- Si la colonne n'utilise pas d'enum, on peut simplement laisser comme text
        -- car le statut 'expired' sera géré par l'application
        RAISE NOTICE 'La colonne status est de type text, pas besoin de modifier l''enum';
    END IF;
END $$;