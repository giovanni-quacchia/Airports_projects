# Airports_projects

[TAW_2025_project.pdf](https://github.com/user-attachments/files/20361937/TAW_2025_project.pdf)

## Progetto TAW

### TODO

- Sistemare Users - Airlines
- Sistemare i validate delle interfacce
- change password after first login for airlines
- Aggiungere ricerca, sort su airplanes
- Aggiungere check primo accesso airline
- Statistiche: num passeggeri per volo, tot revenue, rotte + richieste
- Rotte gestite da admin e airlines
- Aerei hanno una rotta in un certo periodo
- Acquisto biglietto solo per utenti loggati
- Mostrare disponibilità posti in tempo reale

### Specifiche

- Backend with Express for routing
- Frontend with Angular
- MongoDB

Ciascun componente su un container docker connessi da una rete

Utenti: email, pw, roles("ADMIN")

- Registrazione utente
- Registrazione Airline: by invitation (Admin crea airline con temp pw, poi al primo accesso la pw deve essere cambiata)
- Eliminazione utenti (solo admin)
- Admin creato quando il backend starta (caricare anche altri dati: users, airlines, flights)

Routes (solo airlines): from, to

- Creazione rotta
- Creazione aerei: ...
- Creazione voli: aereo, rotta, specific time
- UPDATE costi biglietti per tipo (economy, premium, ultra super premium)
- Statistiche: num passeggeri sui voli, revenue (incasso), rotte + richieste

Ricerca voli (login not required): utente selezione from, to. Ticket acquistabili dopo login

Ticket: volo, prezzo, tipo (economy, ...)

- Additional: + bagagli, + spazio
- Selezione posto

### Backend

Per eseguire fuori dal docker

- docker run -d -p 27017:27017 --name mymongo mongo:6 // database
- npm install
- npx nodemon app.ts

ADMIN INFO
/airlines (CRUD) ✅
/airplanes
/customers

## Progetto DB

- Trigger per flight.airline = flight.airplane.airline
- Un volo di una compagnia per una certa rotta deve avere lo stesso codice (TRIGGER)
- Flight.code = airline.code + number (TRIGGER)
