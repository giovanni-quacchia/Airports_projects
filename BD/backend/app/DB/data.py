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
    {"id": 2, "mail": "user1@gmail.com", "password": "user1", "balance": 1000000.0},
    {"id": 3, "mail": "user2@gmail.com", "password": "user2", "balance": 200.0},
]

airlines = [
    {"id": 1, "mail": "american@contact.com", "code": "AA", "name": "American Airlines", "PIVA": "12345678901", "logo": "https://example.com/aa_logo.png"},
    {"id": 2, "mail": "british@contact.com", "code": "BA", "name": "British Airways", "PIVA": "23456789012", "logo": "https://example.com/ba_logo.png"},
    {"id": 3, "mail": "airfrance@contact.com", "code": "AF", "name": "Air France", "PIVA": "34567890123", "logo": "https://example.com/af_logo.png"},
    {"id": 4, "mail": "emirates@contact.com", "code": "EK", "name": "Emirates", "PIVA": "45678901234", "logo": "https://example.com/ek_logo.png"},
    {"id": 5, "mail": "alitalia@contact.com", "code": "AZ", "name": "Alitalia", "PIVA": "56789012345", "logo": "https://example.com/az_logo.png"},
    {"id": 6, "mail": "ryanair@contact.com", "code": "FR", "name": "Ryanair", "PIVA": "67890123456", "logo": "https://example.com/fr_logo.png"},
]

airplanes = [
    {"id": 1, "model": "Boeing 737", "letters": 6, "rows": 30, "airline": 1},  # American
    {"id": 2, "model": "Airbus A320", "letters": 6, "rows": 28, "airline": 2}, # British
    {"id": 3, "model": "Airbus A350", "letters": 9, "rows": 35, "airline": 3}, # Air France
    {"id": 4, "model": "Boeing 777", "letters": 10, "rows": 40, "airline": 4}, # Emirates
    {"id": 5, "model": "Airbus A330", "letters": 8, "rows": 32, "airline": 5}, # Alitalia
    {"id": 6, "model": "Boeing 737 MAX", "letters": 6, "rows": 28, "airline": 6}, # Ryanair
    {"id": 7, "model": "Boeing 787", "letters": 8, "rows": 32, "airline": None}, # Nessuna airline
]

routesAirplanes = [
    {"id": 1, "route": 1, "airplane": 1, "startDate": "2023-10-01 08:00:00", "endDate": "2023-12-31 20:00:00"},
    {"id": 2, "route": 2, "airplane": 2, "startDate": "2023-11-01 09:00:00", "endDate": "2023-12-14 23:59:59"},
    {"id": 3, "route": 3, "airplane": 3, "startDate": "2023-09-15 10:00:00", "endDate": "2023-10-04 23:59:59"},
    {"id": 4, "route": 4, "airplane": 4, "startDate": "2023-12-01 11:00:00", "endDate": "2024-02-28 23:00:00"},
    {"id": 5, "route": 5, "airplane": 5, "startDate": "2023-10-20 12:00:00", "endDate": "2024-01-20 20:00:00"},
    {"id": 6, "route": 6, "airplane": 6, "startDate": "2023-11-10 13:00:00", "endDate": "2024-03-10 21:00:00"},
    {"id": 7, "route": 1, "airplane": 1, "startDate": "2024-01-01 14:00:00", "endDate": "2024-04-01 22:00:00"},
    {"id": 8, "route": 2, "airplane": 2, "startDate": "2024-01-01 00:00:00", "endDate": "2024-02-15 23:00:00"},
    {"id": 9, "route": 3, "airplane": 3, "startDate": "2023-10-05 00:00:00", "endDate": "2024-01-05 20:00:00"},
    
    # aereo 4 sovrapposizione
    # {"id": 10, "route": 10, "airplane": 4, "startDate": "2024-01-15 08:00:00", "endDate": "2024-03-01 20:00:00"},
    
    # aereo 7 senza airline
    # {"id": 11, "route": 11, "airplane": 7, "startDate": "2024-02-01 09:00:00", "endDate": "2024-04-15 21:00:00"}
]

flights = [
    {"id": 1, "code": "AA100", "route": 1, "airline": 1, "airplane": 1, "departure": "2023-10-01 08:00:00", "arrival": "2023-10-01 20:00:00", "duration": 480},
    {"id": 2, "code": "BA200", "route": 2, "airline": 2, "airplane": 2, "departure": "2023-11-01 09:00:00", "arrival": "2023-11-01 11:00:00", "duration": 120},
    {"id": 3, "code": "AF300", "route": 3, "airline": 3, "airplane": 3, "departure": "2023-09-15 10:00:00", "arrival": "2023-09-15 22:00:00", "duration": 720},
    {"id": 4, "code": "EK400", "route": 4, "airline": 4, "airplane": 4, "departure": "2023-12-01 11:00:00", "arrival": "2023-12-01 23:00:00", "duration": 720},
    {"id": 5, "code": "AZ500", "route": 5, "airline": 5, "airplane": 5, "departure": "2023-10-20 12:00:00", "arrival": "2023-10-20 18:00:00", "duration": 360},
    {"id": 6, "code": "FR600", "route": 6, "airline": 6, "airplane": 6, "departure": "2023-11-10 13:00:00", "arrival": "2023-11-10 15:00:00", "duration": 120},
    {"id": 7, "code": "AA101", "route": 1, "airline": 1, "airplane": 1, "departure": "2024-01-01 14:00:00", "arrival": "2024-01-01 22:00:00", "duration": 480},
    {"id": 8, "code": "BA201", "route": 2, "airline": 2, "airplane": 2, "departure": "2024-01-01 00:00:00", "arrival": "2024-01-01 02:00:00", "duration": 120},
    {"id": 9, "code": "AF301", "route": 3, "airline": 3, "airplane": 3, "departure": "2023-10-05 00:00:00", "arrival": "2023-10-05 12:00:00", "duration": 720},

    # Volo errato: aereo non associato alla rotta
    # {"id": 10, "code": "EK401", "route": 1, "airline": 4, "airplane": 4, "departure": "2024-01-10 10:00:00", "arrival": "2024-01-10 18:00:00", "duration": 480},

    # Volo errato: periodo del volo non coperto dal periodo assegnato all'aereo per la rotta
    # {"id": 11, "code": "AA102", "route": 1, "airline": 1, "airplane": 1, "departure": "2025-01-01 10:00:00", "arrival": "2025-01-01 18:00:00", "duration": 480},

    # Volo errato: aereo non assegnato alla compagnia
    # {"id": 12, "code": "AZ501", "route": 5, "airline": 1, "airplane": 5, "departure": "2023-11-01 08:00:00", "arrival": "2023-11-01 12:00:00", "duration": 240},
]

tickets = [
    {"id": 1, "type": "ECONOMY", "price": 150.0, "quantity": 50, "flight": 1},
    {"id": 2, "type": "BUSINESS", "price": 450.0, "quantity": 20, "flight": 1},
    {"id": 3, "type": "FIRST_CLASS", "price": 900.0, "quantity": 10, "flight": 1},
    {"id": 4, "type": "ECONOMY", "price": 100.0, "quantity": 60, "flight": 2},
    {"id": 5, "type": "BUSINESS", "price": 300.0, "quantity": 15, "flight": 2},
    {"id": 6, "type": "FIRST_CLASS", "price": 800.0, "quantity": 5, "flight": 2},
]

purchases = [
    {"id": 1, "user": 2, "total_cost": 300.0, "date": "2023-10-01 09:00:00", "quantity": 2},
    {"id": 2, "user": 3, "total_cost": 450.0, "date": "2023-11-01 10:00:00", "quantity": 1},
]

"""

Test for purchases creation

{
    "user": 2,
    "quantity": 2,
    "tickets": [1, 2]
}

"""