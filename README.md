# Airports_projects

[TAW_2025_project.pdf](https://github.com/user-attachments/files/20361937/TAW_2025_project.pdf)

## Progetto TAW

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

- npm install
- npx nodemon app.ts
