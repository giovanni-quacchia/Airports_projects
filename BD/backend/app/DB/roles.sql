CREATE ROLE anonymous_user
    NOINHERIT
    NOCREATEROLE
    NOCREATEDB
    LOGIN
    PASSWORD 'anonymous';

CREATE ROLE authenticated_user 
    INHERIT
    NOCREATEROLE
    NOCREATEDB
    LOGIN
    PASSWORD 'authenticated';

CREATE ROLE airline
    INHERIT
    NOCREATEROLE
    NOCREATEDB
    LOGIN
    PASSWORD 'airline';

CREATE ROLE admin
    INHERIT
    CREATEROLE
    CREATEDB
    LOGIN
    PASSWORD 'admin';
