-- Tipi ENUM
CREATE TYPE public.ticket_types AS ENUM ('ECONOMY','BUSINESS','FIRST_CLASS');

-- Tabelle principali
CREATE TABLE public.airlines (
    id SERIAL PRIMARY KEY,
    mail VARCHAR(120) UNIQUE NOT NULL,
    salt BYTEA NOT NULL,
    digest BYTEA NOT NULL,
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    "PIVA" VARCHAR(11) UNIQUE NOT NULL,
    logo VARCHAR(255),
    "isFirstLogin" BOOLEAN NOT NULL,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE public.airplanes (
    id SERIAL PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    letters INT NOT NULL CHECK (letters > 0),
    rows INT NOT NULL CHECK (rows > 0),
    airline INT REFERENCES public.airlines(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE public.airports (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

CREATE TABLE public.routes (
    id SERIAL PRIMARY KEY,
    from_airport INT NOT NULL REFERENCES public.airports(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    to_airport INT NOT NULL REFERENCES public.airports(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT check_different_airports CHECK (from_airport <> to_airport),
    CONSTRAINT unique_route UNIQUE (from_airport, to_airport)
);

CREATE TABLE public.flights (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    departure TIMESTAMP NOT NULL,
    arrival TIMESTAMP NOT NULL CHECK (arrival > departure),
    duration INT NOT NULL CHECK (duration > 0),
    route INT NOT NULL REFERENCES public.routes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    airline INT NOT NULL REFERENCES public.airlines(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    airplane INT NOT NULL REFERENCES public.airplanes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT unique_flight UNIQUE (code, route, departure)
);

CREATE TABLE public.tickets (
    id SERIAL PRIMARY KEY,
    type public.ticket_types NOT NULL,
    price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity >= 0),
    flight INT NOT NULL REFERENCES public.flights(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_flight_type UNIQUE (flight, type)
);

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    mail VARCHAR(120) UNIQUE NOT NULL,
    salt BYTEA NOT NULL,
    digest BYTEA NOT NULL,
    role VARCHAR(20) NOT NULL,
    balance DOUBLE PRECISION NOT NULL CHECK (balance >= 0)
);

CREATE TABLE public.purchases (
    id SERIAL PRIMARY KEY,
    "user" INT REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    total_cost DOUBLE PRECISION NOT NULL CHECK (total_cost >= 0),
    date TIMESTAMP NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE public."purchasesTickets" (
    purchase INT NOT NULL REFERENCES public.purchases(id) ON UPDATE CASCADE ON DELETE CASCADE,
    ticket INT NOT NULL REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    PRIMARY KEY (purchase, ticket)
);

CREATE TABLE public.routes_airplanes (
    id SERIAL PRIMARY KEY,
    route INT NOT NULL REFERENCES public.routes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    airplane INT NOT NULL REFERENCES public.airplanes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL CHECK ("endDate" > "startDate")
);
