from flask import abort
from sqlalchemy import select
from sqlalchemy.orm import aliased
from app.models.flight import Flight
from app.extensions import db

def get_all_flights(code=None):

    query = select(Flight)

    if code:
        query = query.where(Flight.code == code)

    flights = db.session.execute(query).scalars().all()

    return [get_flight_json(flight) for flight in flights]

def get_flight_by_id(flight_id):
    flight = db.session.get(Flight, flight_id)
    if not flight:
        abort(404)
    return get_flight_json(flight)

def create_flight(data):
    new_flight = Flight(
        code=data.get('code'),
        route=data.get('route'),
        airline=data.get('airline'),
        airplane=data.get('airplane'),
        departure=data.get('departure'),
        arrival=data.get('arrival'),
        duration=data.get('duration')
    )
    new_flight.save()
    return get_flight_json(new_flight)

def delete_flight_by_id(flight_id):
    flight = Flight.query.get_or_404(flight_id)
    flight.delete()
    return {"message": "Flight deleted successfully"}

def update_flight_by_id(flight_id, data):
    flight = Flight.query.get_or_404(flight_id)
    flight.update(data)
    return get_flight_json(flight)

def get_flight_json(flight):
    return {
        "id": flight.id,
        "code": flight.code,
        "departure": flight.departure,
        "arrival": flight.arrival,
        "duration": flight.duration,
        "route": flight.route,
        "airline": flight.airline,
        "airplane": flight.airplane
    }