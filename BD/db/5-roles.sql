-- Creazione ruoli senza login
CREATE ROLE anonymous NOLOGIN;
CREATE ROLE admin NOLOGIN;
CREATE ROLE user_authenticated NOLOGIN;
CREATE ROLE airline NOLOGIN;

-- Creazione utenti e assegnazione ruoli
CREATE USER guest WITH PASSWORD 'guest_password';
GRANT anonymous TO guest;

CREATE USER app_admin WITH PASSWORD 'admin_password';
GRANT admin TO app_admin;

CREATE USER app_user WITH PASSWORD 'user_password';
GRANT anonymous TO app_user;
GRANT user_authenticated TO app_user;

CREATE USER app_airline WITH PASSWORD 'airline_password';
GRANT anonymous TO app_airline;
GRANT airline TO app_airline;

-- Assegnazione minimi privilegi

-- privilegi per admin: tutte le operazioni CRUD su tutte le tabelle
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO admin;

-- privilegi per l'utente guest
GRANT SELECT ON public_airlines, airlines, airplanes, flights, routes, airports, tickets, users, itineraries TO anonymous;
GRANT INSERT ON users TO anonymous;

-- TODO: aggiungere seats

-- privilegi per l'utente user
-- TODO: add purchases
GRANT SELECT, INSERT ON purchases, purchases_tickets TO user_authenticated;
GRANT UPDATE, DELETE ON users TO user_authenticated;
-- TODO: aggiungere anche passengers, seats

-- privilegi per l'utente airline
GRANT SELECT, INSERT, UPDATE ON airlines, routes_airplanes TO airline;
GRANT INSERT ON routes TO airline;
GRANT INSERT, UPDATE ON airplanes, flights, tickets TO airline;
-- TODO: aggiungere anche passengers, seats