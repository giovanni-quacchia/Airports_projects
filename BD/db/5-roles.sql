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
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO admin; -- utile anche per .flush (caricare id su un nuovo oggetto aggiunto in una transazione, ma non ancora committato)

-- privilegi per l'utente guest
GRANT SELECT ON public_airlines, airlines, airplanes, flights, routes, airports, tickets, users, itineraries, public_seats TO anonymous;
GRANT INSERT ON users TO anonymous;
GRANT UPDATE ON airlines TO anonymous; -- guest fa login come airline e aggiorna la password
GRANT USAGE ON SEQUENCE users_id_seq TO anonymous; -- per PK increment

-- privilegi per l'utente user
GRANT SELECT, INSERT ON purchases, purchases_tickets, passengers, seats TO user_authenticated;
GRANT UPDATE ON passengers, purchases, seats TO user_authenticated;
GRANT UPDATE, DELETE ON users TO user_authenticated;
GRANT USAGE ON SEQUENCE purchases_id_seq, passengers_id_seq TO user_authenticated; -- per PK increment

GRANT UPDATE ON tickets TO user_authenticated; -- per l'acquisto del biglietto (decrementa quantity)

-- privilegi per l'utente airline
GRANT SELECT, INSERT, UPDATE ON airlines, routes_airplanes, passengers, seats TO airline;
GRANT SELECT ON purchases_tickets, purchases TO airline; -- per visualizzare le statistiche sui passeggeri
GRANT INSERT ON routes TO airline;
GRANT INSERT, UPDATE ON airplanes, flights, tickets TO airline;
GRANT USAGE ON SEQUENCE airlines_id_seq, routes_airplanes_id_seq, passengers_id_seq, routes_id_seq, airplanes_id_seq, flights_id_seq, tickets_id_seq TO airline; -- per PK increment