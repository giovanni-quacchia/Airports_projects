-- =====================
-- AIRPORTS
-- =====================
INSERT INTO airports (id, code, name, city, country) VALUES
(1,  'JFK', 'John F. Kennedy International Airport', 'New York', 'USA'),
(2,  'LHR', 'Heathrow Airport', 'London', 'UK'),
(3,  'CDG', 'Charles de Gaulle Airport', 'Paris', 'France'),
(4,  'HND', 'Tokyo Haneda Airport', 'Tokyo', 'Japan'),
(5,  'DXB', 'Dubai International Airport', 'Dubai', 'UAE'),
(6,  'VCE', 'Venice Marco Polo Airport', 'Venice', 'Italy'),
(7,  'FCO', 'Leonardo da Vinci–Fiumicino Airport', 'Rome', 'Italy'),
(8,  'LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA'),
(9,  'ORD', 'O''Hare International Airport', 'Chicago', 'USA'),
(10, 'SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia'),
(11, 'YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada'),
(12, 'MAD', 'Adolfo Suárez Madrid–Barajas Airport', 'Madrid', 'Spain'),
(13, 'BCN', 'Barcelona–El Prat Airport', 'Barcelona', 'Spain'),
(14, 'GRU', 'São Paulo–Guarulhos International Airport', 'São Paulo', 'Brazil'),
(15, 'FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany');

-- =====================
-- ROUTES
-- =====================
INSERT INTO routes (id, from_airport, to_airport) VALUES
(1, 1, 2),   -- JFK --> LHR
(2, 2, 3),   -- LHR --> CDG
(3, 3, 1),   -- CDG --> JFK
(4, 4, 5),   -- HND --> DXB
(5, 5, 4),   -- DXB --> HND
(6, 6, 7),   -- VCE --> FCO
(7, 7, 6),   -- FCO --> VCE
(8, 1, 6),   -- JFK --> VCE
(9, 2, 7),   -- LHR --> FCO
(10, 1, 8),  -- JFK --> LAX
(11, 8, 9),  -- LAX --> ORD
(12, 2, 12), -- LHR --> MAD
(13, 12, 13),-- MAD --> BCN
(14, 15, 3), -- FRA --> CDG
(15, 14, 1); -- GRU --> JFK

-- =====================
-- USERS
-- =====================
INSERT INTO users (id, mail, salt, digest, role, balance) VALUES
(1, 'admin@gmail.com',
 DECODE('225583f197d5f74b61f65792d7083117','hex'),
 DECODE('f721aa78f7bb8653f8de5d6894e98fdeb6993bc8f2817012ba7597ed91baacf9','hex'), -- pw: admin
 'admin', 300.0),
(2, 'user1@gmail.com',
 DECODE('d712aea6c09ca11d8d87b77c859423fd','hex'),
 DECODE('c2b456636c84be63db3fdaf410d62fcbe49269aed7246123eccb6a5b4c6542ad','hex'), -- pw: user1
 'user', 10000.0),
(3, 'user2@gmail.com',
 DECODE('973a3d6e1db7785eb514e2c1a9a08ea1','hex'),
 DECODE('a1dbdd273fe20da44d5ee0e4743fead6eb2779f1b3bb9b0f79d164e6a62fcc39','hex'), -- pw: user2
 'user', 200.0);

-- =====================
-- AIRLINES
-- =====================

INSERT INTO airlines (id, mail, salt, digest, code, name, "PIVA", logo, role, "isFirstLogin") VALUES 
(1, 'american@contact.com', DECODE('a38616a3ecf97e181ba91e00ef670e18','hex'), DECODE('78d79ced96de9901deb5e5689dce653c83115d7d85320634ad064d8fc6578edc','hex'), 'AA', 'American Airlines', '12345678901', 'https://example.com/aa_logo.png', 'airline', true),
(2, 'british@contact.com', DECODE('04f6819e8ebafdce5a0225951a443950','hex'), DECODE('1407b87469ed63bacf0bde37e904feb72fb9173579bbe044dc44ae91945174da','hex'), 'BA', 'British Airways', '23456789012', 'https://example.com/ba_logo.png', 'airline', true),
(3, 'airfrance@contact.com', DECODE('878fa9ec0ee09b67009f5b3094cabd2a','hex'), DECODE('9657a3b11cf81d8c995765b4ce0e4bca11de0250a83c9cea73094354767dc3df','hex'), 'AF', 'Air France', '34567890123', 'https://example.com/af_logo.png', 'airline', true),
(4, 'emirates@contact.com', DECODE('c04d54cbdfd2a0f8525f9d472e8a6d44','hex'), DECODE('46f49357738011fb3dc82bdcd15fddc23c586760c01b58a4adb6c5212958f6d7','hex'), 'EK', 'Emirates', '45678901234', 'https://example.com/ek_logo.png', 'airline', true),
(5, 'alitalia@contact.com', DECODE('ffa482f49ee31cf4caaeb22e5485a078','hex'), DECODE('0cfaa0a1df2006515e8f7e3e2aa391b152b58a7f6b56e6fc58c17437d7b542c6','hex'), 'AZ', 'Alitalia', '56789012345', 'https://example.com/az_logo.png', 'airline', true),
(6, 'ryanair@contact.com', DECODE('ad845298a8c6213e5727be348474d73d','hex'), DECODE('8f15588f0c5f1dd87744cc70a94c3557b93914a19805caa37550025bc9d8522e','hex'), 'FR', 'Ryanair', '67890123456', 'https://example.com/fr_logo.png', 'airline', true);

-- =====================
-- AIRPLANES
-- =====================
INSERT INTO airplanes (id, model, letters, rows, airline) VALUES
(1, 'Boeing 737',     6, 30, 1), -- American
(2, 'Airbus A320',    6, 28, 2), -- British
(3, 'Airbus A350',    9, 35, 3), -- Air France
(4, 'Boeing 777',    10, 40, 4), -- Emirates
(5, 'Airbus A330',    8, 32, 5), -- Alitalia
(6, 'Boeing 737 MAX', 6, 28, 6), -- Ryanair
(7, 'Boeing 787',     8, 32, NULL), -- senza airline
(8, 'Airbus A380',   10, 50, 4), -- Emirates (voli lunghi)
(9, 'Boeing 747',    10, 45, 1); -- American


-- =====================
-- ROUTES_AIRPLANES
-- =====================
INSERT INTO routes_airplanes (id, route, airplane, "startDate", "endDate") VALUES
(1, 1, 1, '2023-10-01 00:00:00', '2023-12-31 23:59:59'),   -- route 1, airplane 1
(2, 2, 2, '2023-11-01 00:00:00', '2023-12-14 23:59:59'),   -- route 2, airplane 2
(3, 3, 3, '2023-09-15 00:00:00', '2023-10-04 23:59:59'),   -- route 3, airplane 3
(4, 4, 4, '2023-12-01 00:00:00', '2024-02-28 23:59:59'),   -- route 4, airplane 4
(5, 5, 5, '2023-10-20 00:00:00', '2024-01-20 23:59:59'),   -- route 5, airplane 5
(6, 6, 6, '2023-11-10 00:00:00', '2024-03-10 23:59:59'),   -- route 6, airplane 6
(7, 1, 1, '2024-01-01 00:00:00', '2024-04-01 23:59:59'),   -- route 1, airplane 1 (nuovo periodo)
(8, 2, 2, '2024-01-01 00:00:00', '2024-02-15 23:59:59'),   -- route 2, airplane 2 (nuovo periodo)
(9, 3, 3, '2023-10-05 00:00:00', '2024-01-05 23:59:59'),   -- route 3, airplane 3 (esteso)
(10, 10, 9, '2024-01-01 00:00:00', '2024-12-31 23:59:59'), -- route 10 (JFK-LAX), airplane 9
(11, 11, 9, '2024-02-01 00:00:00', '2024-12-31 23:59:59'), -- route 11 (LAX-ORD), airplane 9
(12, 12, 2, '2024-03-01 00:00:00', '2024-12-31 23:59:59'), -- route 12 (LHR-MAD), airplane 2
(13, 14, 3, '2024-01-01 00:00:00', '2024-12-31 23:59:59'), -- route 14 (FRA-CDG), airplane 3
(14, 15, 8, '2024-01-15 00:00:00', '2024-12-31 23:59:59'); -- route 15 (GRU-JFK), airplane 8

-- Errori da testare

-- (15, 10, 4, '2024-01-15 08:00:00', '2024-03-01 20:00:00'), -- aereo 4 sovrapposizione
-- (16, 11, 7, '2024-02-01 09:00:00', '2024-04-15 21:00:00'); -- aereo 7 senza airline

-- =====================
-- FLIGHTS
-- =====================
INSERT INTO flights (id, code, route, airline, airplane, departure, arrival, duration) VALUES
(1,  'EK101', '5', 4, 4, '2025-09-10T08:30:00Z', '2025-09-10T20:30:00Z', 720), -- DXB --> HND
(2,  'AF202', '7', 3, 3, '2025-09-12T13:45:00Z', '2025-09-13T01:45:00Z', 660), -- FCO --> VCE
(3,  'AZ303', '6', 5, 5, '2025-09-14T07:00:00Z', '2025-09-14T08:30:00Z', 90),  -- VCE --> FCO
(4,  'LH404', '4', 2, 2, '2025-09-16T22:00:00Z', '2025-09-17T12:00:00Z', 840), -- HND --> DXB
(5,  'FR505', '6', 6, 6, '2025-09-16T09:30:00Z', '2025-09-16T18:30:00Z', 540), -- VCE --> FCO
(6,  'FR505', '6', 6, 6, '2025-10-16T09:30:00Z', '2025-10-16T18:30:00Z', 540), -- VCE --> FCO (repeated code later date)
(7,  'BA606', '4', 2, 2, '2025-09-18T11:15:00Z', '2025-09-18T21:15:00Z', 600), -- HND --> DXB
(8,  'BA608', '8', 2, 2, '2025-09-18T11:15:00Z', '2025-09-18T21:15:00Z', 600), -- JFK --> VCE
(9,  'EK707', '3', 4, 4, '2025-09-19T20:45:00Z', '2025-09-20T08:45:00Z', 720), -- CDG --> JFK
(10, 'AF808', '2', 3, 3, '2025-09-20T06:00:00Z', '2025-09-20T14:00:00Z', 480), -- LHR --> CDG
(11, 'FR909', '3', 6, 6, '2025-09-22T14:30:00Z', '2025-09-22T22:30:00Z', 480), -- CDG --> JFK
(12, 'AZ010', '7', 5, 5, '2025-09-25T18:00:00Z', '2025-09-26T00:00:00Z', 360), -- FCO --> VCE
(13, 'EK312', '5', 4, 4, '2025-09-20T09:30:00Z', '2025-09-20T19:30:00Z', 600), -- DXB --> HND
(14, 'AA100', '10', 1, 9, '2025-09-25T14:00:00Z', '2025-09-25T20:00:00Z', 360), -- JFK --> LAX
(15, 'AA101', '11', 1, 9, '2025-09-26T09:00:00Z', '2025-09-26T13:00:00Z', 240), -- LAX --> ORD
(16, 'BA200', '12', 2, 2, '2025-09-27T10:30:00Z', '2025-09-27T13:30:00Z', 180), -- LHR --> MAD
(17, 'AF300', '14', 3, 3, '2025-09-28T15:00:00Z', '2025-09-28T17:00:00Z', 120), -- FRA --> CDG
(18, 'EK400', '15', 4, 8, '2025-09-29T20:00:00Z', '2025-09-30T08:00:00Z', 720); -- GRU --> JFK

-- Errori da testare
-- (19, 'AZ404', 6, 5, 5, '2025-09-14T07:30:00Z', '2025-09-14T09:00:00Z', 90), -- Sovrapposizione VCE-FCO
-- (20, 'EK505', 6, 4, 4, '2025-09-14T07:00:00Z', '2025-09-14T09:00:00Z', 120), -- Airline sbagliata

-- =====================
-- TICKETS
-- =====================
INSERT INTO tickets (id, type, price, quantity, flight) VALUES
(1,  'ECONOMY',     150.0, 50, 1),   -- EK101 DXB-->HND
(2,  'BUSINESS',    450.0, 20, 1),   -- EK101 DXB-->HND
(3,  'FIRST_CLASS', 900.0, 10, 1),   -- EK101 DXB-->HND
(4,  'ECONOMY',     100.0, 60, 2),   -- AF202 FCO-->VCE
(5,  'BUSINESS',    300.0, 15, 2),   -- AF202 FCO-->VCE
(6,  'FIRST_CLASS', 800.0, 5,  2),   -- AF202 FCO-->VCE
(7,  'ECONOMY',     90.0,  100,5),   -- FR505 VCE-->FCO
(8,  'BUSINESS',    200.0, 20, 5),   -- FR505 VCE-->FCO
(9,  'ECONOMY',     220.0, 80, 10),  -- AF808 LHR-->CDG
(10, 'BUSINESS',    500.0, 25, 10),  -- AF808 LHR-->CDG
(11, 'FIRST_CLASS', 950.0, 8,  10),  -- AF808 LHR-->CDG
(12, 'ECONOMY',     400.0, 70, 18),  -- EK400 GRU-->JFK
(13, 'BUSINESS',    900.0, 25, 18),  -- EK400 GRU-->JFK
(14, 'FIRST_CLASS', 1500.0,10, 18),  -- EK400 GRU-->JFK
(15, 'ECONOMY', 500.0, 30, 14),      -- AA100 JFK -> LAX
(16, 'BUSINESS', 900.0, 25, 14),     -- AA100 JFK -> LAX
(17, 'ECONOMY', 400.0, 20, 15),      -- AA101 LAX -> ORD
(18, 'BUSINESS', 800.0, 15, 15);      -- AA101 LAX -> ORD

-- Errori da testare
-- (15, 'ECONOMY', 120.0, -5, 1),  -- quantity negativa
-- (16, 'PREMIUM', 500.0, 20, 2),  -- type non valido
-- (17, 'ECONOMY', 150.0, 30, 999); -- volo inesistente

-- =====================
-- PURCHASES
-- =====================
INSERT INTO purchases (id, "user", total_cost, date, quantity) VALUES
(1, 2, 300.0, '2023-10-01 09:00:00', 2), -- user 2 acquista 2 biglietti
(2, 3, 450.0, '2023-11-01 10:00:00', 1); -- user 3 acquista 1 biglietto

-- =====================
-- PURCHASES_TICKETS
-- =====================
INSERT INTO purchases_tickets (purchase, ticket) VALUES
(1, 15), -- purchase 1 -> ticket 15: JFK->LAX ECONOMY
(1, 17), -- purchase 1 -> ticket 17: LAX->ORD ECONOMY
(2, 5); -- purchase 2 -> ticket 5: FCO->VCE BUSINESS

-- =====================
-- PASSENGERS
-- =====================
INSERT INTO passengers (id, name, surname, "CF", "passportNumber", purchase) VALUES
(1, 'Mario', 'Rossi', 'RSSMRA80A01H501X', NULL, 1),
(2, 'Luigi', 'Bianchi', NULL, 'P1234567', 1),
(3, 'Anna', 'Verdi', 'VRDANN90B02H501Y', NULL, 2);

-- =====================
-- SEATS
-- =====================
INSERT INTO seats (passenger, ticket, seat, extra) VALUES
(1, 15, 'A1', ARRAY['LARGER SEAT']::extra_types[]), -- Mario Rossi su volo JFK->LAX ECONOMY 
(2, 15, 'A2', ARRAY['PRIORITY']::extra_types[]),    -- Luigi Bianchi su volo JFK->LAX ECONOMY
(3, 5, 'B1', ARRAY['EXTRA BAG']::extra_types[]),
(1, 17, 'C1', ARRAY['LARGER SEAT']::extra_types[]), -- Mario Rossi su volo LAX->ORD ECONOMY
(2, 17, 'C2', ARRAY['PRIORITY']::extra_types[]);    -- Luigi Bianchi su volo LAX->ORD ECONOMY

-- =====================
-- AGGIORNA LE SEQUENCE (PK)
-- Imposta le sequence al valore massimo presente, così che il prossimo id generato sia MAX(id)+1

SELECT setval('airports_id_seq', COALESCE((SELECT MAX(id) FROM airports), 0));
SELECT setval('routes_id_seq', COALESCE((SELECT MAX(id) FROM routes), 0));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0));
SELECT setval('airlines_id_seq', COALESCE((SELECT MAX(id) FROM airlines), 0));
SELECT setval('airplanes_id_seq', COALESCE((SELECT MAX(id) FROM airplanes), 0));
SELECT setval('routes_airplanes_id_seq', COALESCE((SELECT MAX(id) FROM routes_airplanes), 0));
SELECT setval('flights_id_seq', COALESCE((SELECT MAX(id) FROM flights), 0));
SELECT setval('tickets_id_seq', COALESCE((SELECT MAX(id) FROM tickets), 0));
SELECT setval('purchases_id_seq', COALESCE((SELECT MAX(id) FROM purchases), 0));
SELECT setval('passengers_id_seq', COALESCE((SELECT MAX(id) FROM passengers), 0));