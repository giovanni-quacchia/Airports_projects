from flask import abort
from sqlalchemy import select
from sqlalchemy.orm import aliased
from app.models.flight import Flight
from app.schemas.flight_schema import FlightSchema
from app.extensions import db
from app.services.airline_service import airline_exists

def get_all_flights(code=None):

    query = select(Flight)

    if code:
        query = query.where(Flight.code.ilike(f"%{code}%"))

    flights = db.session.execute(query).scalars().all()

    return FlightSchema(many=True).dump(flights)

def get_flights_by_airlineId(airline_id):
    
    if(not airline_exists(airline_id)):
        abort(404)

    query = select(Flight).where(Flight.airline == airline_id)
    flights = db.session.execute(query).scalars().all()
    return FlightSchema(many=True).dump(flights)

def get_flight_by_id(flight_id):
    flight = Flight.query.get_or_404(flight_id)
    return FlightSchema().dump(flight)

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
    return FlightSchema().dump(new_flight)

def delete_flight_by_id(flight_id):
    flight = Flight.query.get_or_404(flight_id)
    flight.delete()
    return {"message": "Flight deleted successfully"}

def update_flight_by_id(flight_id, data):
    flight = Flight.query.get_or_404(flight_id)
    flight.update(data)
    return FlightSchema().dump(flight)