# Airports_projects

[TAW_2025_project.pdf](https://github.com/user-attachments/files/20361937/TAW_2025_project.pdf)

## Progetto TAW

### Comandi

```bash
# Per configurare inizialmente tutti i containers
/TAW > docker compose up -d

# Poi per startare/stoppare/restartare (down rimuove i containers)
/TAW > docker compose start/stop/restart/down 

# Per vedere i log dei vari containers
docker logs -f <taw_backend / taw_frontend>

```


### TODO

- Sistemare i validate delle interfacce
- Aggiungere ricerca, sort su airplanes
- Statistiche: rotte + richieste (aggiungere sortBy numPasseggeri)
- Rotte gestite da admin e airlines
- Aerei hanno una rotta in un certo periodo
- Acquisto biglietto solo per utenti loggati
- Mostrare disponibilità posti in tempo reale (check posti)
- Aggiungere campo populate: boolean per decidere se aggiungere info (Ad esempio per flight aggiungo le info su airports, airline, airplane). Allora forse è meglio tenere l'objectId per le richerche con :id. magari solo per singolo volo. Perche ad esempio mi servono le info per from e to su tutti gli aerei boh

- configurare il db e inserire i dati

### Specifiche

SERVICE lavora sempre sugli id per le FK (create, update)

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

```bash
# Container docker
# replica set con nome rs0, --bind_ip_all rende mongo accessibile anche dall'host esterno
docker run -d -p 27017:27017 --name mymongo2 -v /path/to/init-scripts:/docker-entrypoint-initdb.d mongo:6 --replSet rs0 --bind_ip_all

# init del db
docker exec -it mymongo2 mongosh

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})

# Backend
npm install
npx nodemon app.ts
```

ADMIN INFO
/airlines (CRUD) ✅
/airplanes
/customers

#### Group by

Query per numPasseggeri + totalRevenue

- Result senza group by

  [
  {
  id: f1,
  ticket: {id: t1, flight: f1, price: 2000},
  passenger: {ticket: t1}
  },
  {
  id: f1,
  ticket: {id: t2, flight: f1, price: 600},
  passenger: {ticket: t2}
  },
  {
  id: f2,
  ticket: {id: t3, flight: f2, price: 300},
  passenger: {ticket: t3}
  },
  ]

#### Transactions

Replica set: Utilizza un transaction coordinator che garantisce atomicità multi-documento

## Progetto DB

docker compose down -v (elimina anche i dati dal db)

- Trigger per flight.airline = flight.airplane.airline
- Un volo di una compagnia per una certa rotta deve avere lo stesso codice (TRIGGER)
- Flight.code = airline.code + number (TRIGGER)
