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


-- trigger check airplane.route == route per periodo
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

-- trigger if (route, code) exists, then same code for same route
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
