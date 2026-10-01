-- ==============================================================================
-- COUTURIER - PWA DE GESTION D'ATELIER DE COUTURE (BENIN / AFRIQUE DE L'OUEST)
-- Schema Postgres complet Supabase avec Multi-Atelier, RLS, Triggers & Vues
-- ==============================================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. ATELIERS (Workshops)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'FCFA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. PROFILS UTILISATEURS (Profiles liés à auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'tailor', 'assistant')),
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. CLIENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('m', 'f')),
    birth_date DATE,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    photo_url TEXT,
    profession TEXT,
    notes TEXT,
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_workshop ON clients(workshop_id);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(workshop_id) WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------------
-- 4. TYPES DE MESURES (Measurement Types)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('m', 'f', 'both')),
    category TEXT NOT NULL, -- 'haut', 'bas', 'robe', 'boubou', 'autre'
    unit TEXT NOT NULL DEFAULT 'cm',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_measurement_types_workshop ON measurement_types(workshop_id);

-- ------------------------------------------------------------------------------
-- 5. PROFILS DE MENSURATIONS (Measurement Profiles - Immuables si commandés)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurement_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    kind TEXT NOT NULL DEFAULT 'standard' CHECK (kind IN ('standard', 'custom')),
    parent_id UUID REFERENCES measurement_profiles(id) ON DELETE SET NULL,
    taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_measurement_profiles_client ON measurement_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_measurement_profiles_workshop ON measurement_profiles(workshop_id);

-- ------------------------------------------------------------------------------
-- 6. VALEURS DE MESURES (Measurements)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES measurement_profiles(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES measurement_types(id) ON DELETE CASCADE,
    value NUMERIC(6,2) NOT NULL,
    UNIQUE(profile_id, type_id)
);

CREATE INDEX IF NOT EXISTS idx_measurements_profile ON measurements(profile_id);

-- ------------------------------------------------------------------------------
-- 7. TYPES DE VETEMENTS (Garment Types)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS garment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_garment_types_workshop ON garment_types(workshop_id);

-- ------------------------------------------------------------------------------
-- 8. COMMANDES (Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    garment_type_id UUID NOT NULL REFERENCES garment_types(id),
    model TEXT,
    description TEXT,
    color TEXT,
    fabric TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN (
        'nouvelle', 'en_attente', 'tissu_recu', 'en_confection',
        'essayage', 'retouche', 'terminee', 'prete_a_livrer', 'livree', 'annulee'
    )),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    measurement_profile_id UUID NOT NULL REFERENCES measurement_profiles(id),
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workshop_id, number)
);

CREATE INDEX IF NOT EXISTS idx_orders_workshop ON orders(workshop_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(workshop_id) WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------------
-- 9. HISTORIQUE DES STATUTS DE COMMANDE (Order Status History)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);

-- ------------------------------------------------------------------------------
-- 10. PAIEMENTS (Payments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    method TEXT NOT NULL CHECK (method IN ('especes', 'mtn_momo', 'moov_money', 'virement', 'carte', 'autre')),
    reference TEXT,
    comment TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_workshop ON payments(workshop_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- ------------------------------------------------------------------------------
-- 11. RENDEZ-VOUS (Appointments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    duration_min INTEGER NOT NULL DEFAULT 30,
    type TEXT NOT NULL CHECK (type IN ('mesures', 'essayage', 'retouche', 'livraison', 'recuperation', 'consultation', 'autre')),
    status TEXT NOT NULL DEFAULT 'programme' CHECK (status IN ('programme', 'confirme', 'honore', 'annule', 'absent')),
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_workshop ON appointments(workshop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);

-- ------------------------------------------------------------------------------
-- 12. PHOTOS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('modele', 'tissu', 'croquis', 'inspiration', 'confection', 'final')),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(order_id);
CREATE INDEX IF NOT EXISTS idx_photos_client ON photos(client_id);

-- ------------------------------------------------------------------------------
-- 13. NOTES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_client ON notes(client_id);

-- ------------------------------------------------------------------------------
-- 14. LOGS D'ACTIVITE (Activity Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_workshop ON activity_logs(workshop_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity, entity_id);

-- ------------------------------------------------------------------------------
-- 15. MODELES DE MESSAGES WHATSAPP (Message Templates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    key TEXT NOT NULL CHECK (key IN ('rdv', 'pret', 'paiement')),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workshop_id, key)
);

-- ------------------------------------------------------------------------------
-- 16. VUE SQL : ORDERS_SUMMARY (Calculé : total payé, reste, %, en retard)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
    o.id,
    o.workshop_id,
    o.number,
    o.client_id,
    o.garment_type_id,
    o.model,
    o.description,
    o.color,
    o.fabric,
    o.quantity,
    o.price,
    o.due_date,
    o.status,
    o.assigned_to,
    o.measurement_profile_id,
    o.notes,
    o.deleted_at,
    o.created_at,
    o.updated_at,
    c.first_name AS client_first_name,
    c.last_name AS client_last_name,
    c.phone AS client_phone,
    c.whatsapp AS client_whatsapp,
    gt.name AS garment_type_name,
    COALESCE(SUM(p.amount) FILTER (WHERE p.deleted_at IS NULL), 0)::integer AS total_paid,
    (o.price - COALESCE(SUM(p.amount) FILTER (WHERE p.deleted_at IS NULL), 0))::integer AS remaining,
    CASE 
        WHEN o.price > 0 THEN 
            LEAST(100, GREATEST(0, ROUND((COALESCE(SUM(p.amount) FILTER (WHERE p.deleted_at IS NULL), 0)::numeric / o.price::numeric) * 100)))::integer
        ELSE 100 
    END AS percent_paid,
    (o.due_date < CURRENT_DATE AND o.status NOT IN ('livree', 'annulee')) AS is_overdue
FROM orders o
JOIN clients c ON c.id = o.client_id
LEFT JOIN garment_types gt ON gt.id = o.garment_type_id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.deleted_at IS NULL
GROUP BY o.id, c.first_name, c.last_name, c.phone, c.whatsapp, gt.name;

-- ------------------------------------------------------------------------------
-- 17. TRIGGERS : IMMUTABILITÉ DES MENSURATIONS (Règle Fondamentale 2)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_measurement_profile_immutable()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM orders WHERE measurement_profile_id = OLD.id) THEN
        RAISE EXCEPTION 'Ce profil de mensurations est lié à une commande existante et est strictement immuable.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_measurement_profile_immutable ON measurement_profiles;
CREATE TRIGGER trg_measurement_profile_immutable
BEFORE UPDATE OR DELETE ON measurement_profiles
FOR EACH ROW EXECUTE FUNCTION check_measurement_profile_immutable();

CREATE OR REPLACE FUNCTION check_measurements_immutable()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM orders WHERE measurement_profile_id = OLD.profile_id) THEN
        RAISE EXCEPTION 'Ces mesures sont liées à un profil utilisé dans une commande et sont strictement immuables.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_measurements_immutable ON measurements;
CREATE TRIGGER trg_measurements_immutable
BEFORE UPDATE OR DELETE ON measurements
FOR EACH ROW EXECUTE FUNCTION check_measurements_immutable();

-- ------------------------------------------------------------------------------
-- 18. TRIGGER : NUMERO DE COMMANDE SEQUENTIEL PAR ATELIER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    IF NEW.number IS NULL OR NEW.number = 0 THEN
        SELECT COALESCE(MAX(number), 0) + 1 INTO next_num
        FROM orders
        WHERE workshop_id = NEW.workshop_id;
        NEW.number := next_num;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON orders;
CREATE TRIGGER trg_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- ------------------------------------------------------------------------------
-- 19. TRIGGER : HISTORIQUE AUTOMATIQUE DES STATUTS DE COMMANDE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_at)
        VALUES (NEW.id, NULL, NEW.status, NEW.assigned_to, now());
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.assigned_to, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_status_change ON orders;
CREATE TRIGGER trg_order_status_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ------------------------------------------------------------------------------
-- 20. TRIGGER : MISE A JOUR LAST_ACTIVITY_AT DU CLIENT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_client_last_activity()
RETURNS TRIGGER AS $$
DECLARE
    target_client_id UUID;
BEGIN
    IF TG_TABLE_NAME = 'orders' OR TG_TABLE_NAME = 'appointments' OR TG_TABLE_NAME = 'measurement_profiles' OR TG_TABLE_NAME = 'notes' THEN
        target_client_id := NEW.client_id;
    ELSIF TG_TABLE_NAME = 'payments' THEN
        SELECT client_id INTO target_client_id FROM orders WHERE id = NEW.order_id;
    END IF;

    IF target_client_id IS NOT NULL THEN
        UPDATE clients SET last_activity_at = now() WHERE id = target_client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_client_activity_orders ON orders;
CREATE TRIGGER trg_client_activity_orders AFTER INSERT OR UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_client_last_activity();

DROP TRIGGER IF EXISTS trg_client_activity_appts ON appointments;
CREATE TRIGGER trg_client_activity_appts AFTER INSERT OR UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_client_last_activity();

DROP TRIGGER IF EXISTS trg_client_activity_profiles ON measurement_profiles;
CREATE TRIGGER trg_client_activity_profiles AFTER INSERT OR UPDATE ON measurement_profiles FOR EACH ROW EXECUTE FUNCTION update_client_last_activity();

DROP TRIGGER IF EXISTS trg_client_activity_payments ON payments;
CREATE TRIGGER trg_client_activity_payments AFTER INSERT ON payments FOR EACH ROW EXECUTE FUNCTION update_client_last_activity();

-- ------------------------------------------------------------------------------
-- 21. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Helper function pour récupérer le workshop_id de l'utilisateur courant
CREATE OR REPLACE FUNCTION current_workshop_id()
RETURNS UUID AS $$
    SELECT workshop_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Politiques RLS pour chaque table métier basée sur current_workshop_id()
DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('clients', 'measurement_types', 'measurement_profiles', 'garment_types', 'orders', 'payments', 'appointments', 'photos', 'notes', 'activity_logs', 'message_templates')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS workshop_isolation_policy ON %I', tbl);
        EXECUTE format('CREATE POLICY workshop_isolation_policy ON %I FOR ALL USING (workshop_id = current_workshop_id()) WITH CHECK (workshop_id = current_workshop_id())', tbl);
    END LOOP;
END $$;

-- Policy pour profiles
DROP POLICY IF EXISTS profiles_policy ON profiles;
CREATE POLICY profiles_policy ON profiles FOR ALL USING (workshop_id = current_workshop_id());

-- Policy pour measurements (liée via measurement_profiles)
DROP POLICY IF EXISTS measurements_policy ON measurements;
CREATE POLICY measurements_policy ON measurements FOR ALL USING (
    profile_id IN (SELECT id FROM measurement_profiles WHERE workshop_id = current_workshop_id())
);

-- Policy pour order_status_history (liée via orders)
DROP POLICY IF EXISTS order_status_history_policy ON order_status_history;
CREATE POLICY order_status_history_policy ON order_status_history FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE workshop_id = current_workshop_id())
);

-- Policy pour workshops
DROP POLICY IF EXISTS workshops_policy ON workshops;
CREATE POLICY workshops_policy ON workshops FOR ALL USING (id = current_workshop_id());

-- ------------------------------------------------------------------------------
-- 22. SEED INITIAL DES TYPES DE MESURES, VETEMENTS & MODELES DE MESSAGES
-- Fonction utilitaire pour initialiser un nouvel atelier
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_workshop_defaults(target_workshop_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Types de vêtements classiques en Afrique de l'Ouest
    INSERT INTO garment_types (workshop_id, name) VALUES
    (target_workshop_id, 'Chemise Homme'),
    (target_workshop_id, 'Pantalon'),
    (target_workshop_id, 'Costume / Veste'),
    (target_workshop_id, 'Grand Boubou'),
    (target_workshop_id, 'Tunique'),
    (target_workshop_id, 'Ensemble Pagne 3 pièces'),
    (target_workshop_id, 'Robe de soirée'),
    (target_workshop_id, 'Robe droite / évasée'),
    (target_workshop_id, 'Jupe'),
    (target_workshop_id, 'Kaba / Buba'),
    (target_workshop_id, 'Gilet')
    ON CONFLICT DO NOTHING;

    -- Modèles de messages WhatsApp
    INSERT INTO message_templates (workshop_id, key, body) VALUES
    (target_workshop_id, 'rdv', 'Bonjour {prenom}, votre rendez-vous à l''atelier {atelier} est prévu le {date}. À très bientôt !'),
    (target_workshop_id, 'pret', 'Bonjour {prenom}, votre commande #{numero} est prête pour essayage/retrait à l''atelier {atelier} !'),
    (target_workshop_id, 'paiement', 'Bonjour {prenom}, nous avons bien reçu votre paiement. Reste à payer pour la commande #{numero} : {reste} FCFA. Merci de votre confiance !')
    ON CONFLICT (workshop_id, key) DO NOTHING;

    -- Types de mesures Homme
    INSERT INTO measurement_types (workshop_id, name, gender, category, unit, display_order) VALUES
    (target_workshop_id, 'Tour de cou', 'm', 'haut', 'cm', 1),
    (target_workshop_id, 'Carrure dos', 'm', 'haut', 'cm', 2),
    (target_workshop_id, 'Tour de poitrine', 'm', 'haut', 'cm', 3),
    (target_workshop_id, 'Tour de taille', 'm', 'haut', 'cm', 4),
    (target_workshop_id, 'Longueur dos / veste', 'm', 'haut', 'cm', 5),
    (target_workshop_id, 'Longueur manche courte', 'm', 'haut', 'cm', 6),
    (target_workshop_id, 'Longueur manche longue', 'm', 'haut', 'cm', 7),
    (target_workshop_id, 'Tour de bras (biceps)', 'm', 'haut', 'cm', 8),
    (target_workshop_id, 'Tour de poignet', 'm', 'haut', 'cm', 9),
    (target_workshop_id, 'Tour de ceinture', 'm', 'bas', 'cm', 10),
    (target_workshop_id, 'Tour de bassin', 'm', 'bas', 'cm', 11),
    (target_workshop_id, 'Longueur pantalon', 'm', 'bas', 'cm', 12),
    (target_workshop_id, 'Longueur entrejambe', 'm', 'bas', 'cm', 13),
    (target_workshop_id, 'Tour de cuisse', 'm', 'bas', 'cm', 14),
    (target_workshop_id, 'Tour de genou', 'm', 'bas', 'cm', 15),
    (target_workshop_id, 'Tour de bas / cheville', 'm', 'bas', 'cm', 16),
    (target_workshop_id, 'Longueur boubou', 'm', 'boubou', 'cm', 17)
    ON CONFLICT DO NOTHING;

    -- Types de mesures Femme
    INSERT INTO measurement_types (workshop_id, name, gender, category, unit, display_order) VALUES
    (target_workshop_id, 'Carrure dos', 'f', 'haut', 'cm', 1),
    (target_workshop_id, 'Carrure devant', 'f', 'haut', 'cm', 2),
    (target_workshop_id, 'Tour de poitrine', 'f', 'haut', 'cm', 3),
    (target_workshop_id, 'Tour de sous-poitrine', 'f', 'haut', 'cm', 4),
    (target_workshop_id, 'Écart de poitrine', 'f', 'haut', 'cm', 5),
    (target_workshop_id, 'Hauteur de poitrine', 'f', 'haut', 'cm', 6),
    (target_workshop_id, 'Tour de taille', 'f', 'haut', 'cm', 7),
    (target_workshop_id, 'Longueur épaule-taille', 'f', 'haut', 'cm', 8),
    (target_workshop_id, 'Tour de bassin / hanches', 'f', 'bas', 'cm', 9),
    (target_workshop_id, 'Hauteur hanches', 'f', 'bas', 'cm', 10),
    (target_workshop_id, 'Longueur robe', 'f', 'robe', 'cm', 11),
    (target_workshop_id, 'Longueur jupe courte', 'f', 'bas', 'cm', 12),
    (target_workshop_id, 'Longueur jupe longue', 'f', 'bas', 'cm', 13),
    (target_workshop_id, 'Longueur taille-sol', 'f', 'bas', 'cm', 14),
    (target_workshop_id, 'Longueur manche courte', 'f', 'haut', 'cm', 15),
    (target_workshop_id, 'Longueur manche 3/4', 'f', 'haut', 'cm', 16),
    (target_workshop_id, 'Longueur manche longue', 'f', 'haut', 'cm', 17),
    (target_workshop_id, 'Tour de bras', 'f', 'haut', 'cm', 18),
    (target_workshop_id, 'Tour de poignet', 'f', 'haut', 'cm', 19)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
