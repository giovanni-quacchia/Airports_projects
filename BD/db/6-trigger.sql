-- trigger check airplane.airline == airline
CREATE OR REPLACE FUNCTION fn_flights_check_airplane_airline()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  airplane_airline_id INT;
BEGIN
  SELECT a.airline INTO airplane_airline_id
  FROM public.airplanes a
  WHERE a.id = NEW.airplane;

  IF airplane_airline_id IS NULL THEN
    RAISE EXCEPTION 'Aereo % senza compagnie; non può essere assegnato a un volo', NEW.airplane
      USING ERRCODE = '23514';
  END IF;
    
  IF airplane_airline_id <> NEW.airline THEN
    RAISE EXCEPTION 'Aereo % appartiene alla compagnia %, ma la compagnia del volo è %',
      NEW.airplane, airplane_airline_id, NEW.airline
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flights_check_airplane_airline ON public.flights;
CREATE TRIGGER trg_flights_check_airplane_airline
BEFORE INSERT OR UPDATE OF airplane, airline ON public.flights
FOR EACH ROW
EXECUTE FUNCTION fn_flights_check_airplane_airline();

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- trigger controlla che l'aereo sia assegnato alla rotta per il periodo del volo
CREATE OR REPLACE FUNCTION fn_flights_check_route_assignment_period()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ok BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.routes_airplanes ra
    WHERE ra.route = NEW.route
      AND ra.airplane = NEW.airplane
      AND ra."startDate" <= NEW.departure
      AND ra."endDate"   >= NEW.arrival
  ) INTO ok;

  IF NOT ok THEN
    RAISE EXCEPTION 'No route/aeroplani assegnati che coprono i voli: route=%, aeroplani=%, periodo [% .. %]',
      NEW.route, NEW.airplane, NEW.departure, NEW.arrival
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ctrg_flights_check_route_assignment_period ON public.flights;
CREATE CONSTRAINT TRIGGER ctrg_flights_check_route_assignment_period
AFTER INSERT OR UPDATE OF route, airplane, departure, arrival ON public.flights
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_flights_check_route_assignment_period();

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- trigger if (route, code) exists for the airline, then same code for same route
CREATE OR REPLACE FUNCTION fn_flights_enforce_constant_code_per_route()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  exists_other BOOLEAN;
BEGIN
  IF NEW.code IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.flights f
    WHERE f.route = NEW.route
      AND f.airline = NEW.airline
      AND f.id <> COALESCE(NEW.id, -1)
      AND f.code <> NEW.code
    LIMIT 1
  ) INTO exists_other;

  IF exists_other THEN
    RAISE EXCEPTION 'Route % esiste già e ha codice differente da "%"', NEW.route, NEW.code
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flights_constant_code_per_route ON public.flights;
CREATE TRIGGER trg_flights_constant_code_per_route
BEFORE INSERT OR UPDATE OF code, route ON public.flights
FOR EACH ROW
EXECUTE FUNCTION fn_flights_enforce_constant_code_per_route();

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- trigger check user balance >= total_cost

-- test su user 2 (balance 300) acquista ticket (DBX - HND) costo 150. (trigger chiamato dopo la transazione? no, prima)

CREATE OR REPLACE FUNCTION check_user_balance()
RETURNS TRIGGER AS $$
DECLARE
    user_balance numeric;
BEGIN
    -- trova il balance dell'utente
    SELECT balance INTO user_balance
    FROM users
    WHERE id = NEW.user;

    IF user_balance IS NULL THEN
        RAISE EXCEPTION 'Utente non trovato: %', NEW.user;
    END IF;

    -- Controlla se il balance è sufficiente
    IF user_balance < NEW.total_cost THEN
        RAISE EXCEPTION 'Saldo insufficiente per l''utente %: saldo % < totale acquisto %',
            NEW.user, user_balance, NEW.total_cost;
    END IF;

    -- Se va tutto bene, permetti l'INSERT/UPDATE
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_balance ON purchases;
CREATE TRIGGER trg_check_balance
BEFORE INSERT OR UPDATE OF total_cost ON purchases
FOR EACH ROW
EXECUTE FUNCTION check_user_balance();

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- trigger: un aereo è assegnato ad una sola rotta in un certo periodo (no sovrapposizioni)
CREATE OR REPLACE FUNCTION check_airplane_route_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.routes_airplanes ra
        WHERE ra.airplane = NEW.airplane
          AND (
              (NEW.startDate BETWEEN ra.startDate AND ra.endDate)
              OR (NEW.endDate BETWEEN ra.startDate AND ra.endDate)
          )
    ) THEN
        RAISE EXCEPTION 'L''aereo % è già assegnato alla rotta % per il periodo richiesto',
            NEW.airplane, NEW.route
          USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_airplane_route_dates ON public.routes_airplanes;
CREATE TRIGGER trg_check_airplane_route_dates
BEFORE INSERT OR UPDATE ON public.routes_airplanes
FOR EACH ROW
EXECUTE FUNCTION check_airplane_route_dates();

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- trigger: controlla posto occupato
CREATE OR REPLACE FUNCTION check_seat_occupied_per_flight()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
      SELECT 1
      FROM seats s
      JOIN tickets t ON s.ticket = t.id
      WHERE s.seat = NEW.seat
        AND t.flight = (SELECT flight FROM tickets WHERE id = NEW.ticket)
    ) THEN
        RAISE EXCEPTION 'Seat % is already occupied on this flight', NEW.seat;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_unique_seats_per_flight ON public.purchases_tickets;
CREATE TRIGGER trg_check_unique_seats_per_flight
BEFORE INSERT OR UPDATE ON public.seats
FOR EACH ROW
EXECUTE FUNCTION check_seat_occupied_per_flight();