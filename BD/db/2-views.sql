CREATE OR REPLACE VIEW public_airlines AS
SELECT id, code, name, "PIVA", logo
FROM airlines;

CREATE OR REPLACE VIEW public_seats AS 
SELECT ticket, seat
FROM seats;