-- Creazione ruoli senza login
CREATE ROLE anonymous NOLOGIN;
CREATE ROLE admin NOLOGIN;

-- Creazione utenti e assegnazione ruoli
CREATE USER guest WITH PASSWORD 'guest_password';
GRANT anonymous TO guest;

CREATE USER app_admin WITH PASSWORD 'admin_password';
GRANT admin TO app_admin;

-- Assegnazione minimi privilegi

-- concedi i privilegi di schema all'admin
GRANT USAGE, CREATE ON SCHEMA public TO app_admin;
-- assicura che l'admin possa gestire tutto nelle tabelle
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- privilegi per l'utente guest
-- GRANT SELECT ON public_airlines TO guest;
-- GRANT SELECT ON airports TO guest;