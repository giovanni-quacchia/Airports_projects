from app.extensions import db
from app.models.airport import Airport
from app.models.route import Route
from app.models.user import User
from sqlalchemy import text

from .data import airports, routes, users

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

    db.session.commit()

    print("Database initialized with sample data.")

def update_PK_increment(table, new_value):
    seq_name = f"{table}_id_seq"
    db.session.execute(text(f"ALTER SEQUENCE {seq_name} RESTART WITH :new_value"), {"new_value": new_value})    