airports = [
    {"id": 1, "code": "JFK", "name": "John F. Kennedy International Airport", "city": "New York", "country": "USA"},
    {"id": 2, "code": "LHR", "name": "Heathrow Airport", "city": "London", "country": "UK"},
    {"id": 3, "code": "CDG", "name": "Charles de Gaulle Airport", "city": "Paris", "country": "France"},
    {"id": 4, "code": "HND", "name": "Tokyo Haneda Airport", "city": "Tokyo", "country": "Japan"},
    {"id": 5, "code": "DXB", "name": "Dubai International Airport", "city": "Dubai", "country": "UAE"},
    {"id": 6, "code": "VCE", "name": "Venice Marco Polo Airport", "city": "Venice", "country": "Italy"},
    {"id": 7, "code": "FCO", "name": "Leonardo da Vinci–Fiumicino Airport", "city": "Rome", "country": "Italy"}
]

routes = [
    {"id": 1, "from_airport": 1, "to_airport": 2},  # JFK --> LHR
    {"id": 2, "from_airport": 2, "to_airport": 3},  # LHR --> CDG
    {"id": 3, "from_airport": 3, "to_airport": 1},  # CDG --> JFK
    {"id": 4, "from_airport": 4, "to_airport": 5},  # HND --> DXB
    {"id": 5, "from_airport": 5, "to_airport": 4},  # DXB --> HND
    {"id": 6, "from_airport": 6, "to_airport": 7},  # VCE --> FCO
    {"id": 7, "from_airport": 7, "to_airport": 6},  # FCO --> VCE
    {"id": 8, "from_airport": 1, "to_airport": 6},  # JFK --> VCE
    {"id": 9, "from_airport": 2, "to_airport": 7},  # LHR --> FCO
]

users = [
    {"id": 1, "mail": "admin@gmail.com", "password": "admin", "balance": 300.0, "isAdmin": True},
    {"id": 2, "mail": "user1@gmail.com", "password": "user1", "balance": 100.0},
    {"id": 3, "mail": "user2@gmail.com", "password": "user2", "balance": 200.0},
]