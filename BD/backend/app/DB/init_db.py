from app.extensions import db
from app.models.airport import Airport
from app.models.route import Route
from app.models.user import User
from app.models.airline import Airline
from app.models.airplane import Airplane
from app.models.RoutesAirplanes import RoutesAirplanes
from app.models.flight import Flight
from sqlalchemy import text

from .data import airports, routes, users, airlines, airplanes, routesAirplanes, flights

def init_db():
    db.drop_all()
    db.create_all()
    
    for airport_data in airports:
        airport = Airport(**airport_data)
        db.session.add(airport)
    update_PK_increment('airports', len(airports) + 1)

    for route_data in routes:
        route = Route(**route_data)
        db.session.add(route)
    update_PK_increment('routes', len(routes) + 1)

    for user_data in users:
        user = User(**user_data)
        db.session.add(user)
    update_PK_increment('users', len(users) + 1)
    
    for airline_data in airlines:
        airline = Airline(**airline_data)
        db.session.add(airline)
    update_PK_increment('airlines', len(airlines) + 1)
    
    for airplane_data in airplanes:
        airplane = Airplane(**airplane_data)
        db.session.add(airplane)
    update_PK_increment('airplanes', len(airplanes) + 1)
    
    for ra_data in routesAirplanes:
        ra = RoutesAirplanes(**ra_data)
        db.session.add(ra)
    update_PK_increment('routes_airplanes', len(routesAirplanes) + 1)

    for flight_data in flights:
        flight = Flight(**flight_data)
        db.session.add(flight)
    update_PK_increment('flights', len(flights) + 1)

    db.session.commit()

    print("Database initialized with sample data.")

def update_PK_increment(table, new_value):
    seq_name = f"{table}_id_seq"
    db.session.execute(text(f"ALTER SEQUENCE {seq_name} RESTART WITH :new_value"), {"new_value": new_value})    