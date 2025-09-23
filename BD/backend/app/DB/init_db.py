from app.extensions import db
from app.models.airport import Airport
from app.models.route import Route

from .data import airports, routes

def init_db():
    db.drop_all()
    db.create_all()
    
    for airport_data in airports:
        airport = Airport(**airport_data)
        airport.save()

    for route_data in routes:
        route = Route(**route_data)
        route.save()

    print("Database initialized with sample data.")
    