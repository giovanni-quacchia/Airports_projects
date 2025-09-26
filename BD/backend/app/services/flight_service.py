from flask import abort
from sqlalchemy import select
from sqlalchemy.orm import aliased
from app.models.flight import Flight
from app.models.route import Route
from app.models.airport import Airport
from app.schemas.flight_schema import FlightSchema
from app.extensions import db
from app.services.airline_service import airline_exists

from app.extensions import get_session
from flask_login import current_user

def get_all_flights(from_airport=None, to_airport=None, from_date=None, to_date=None, code=None):

    FromAirport, ToAirport = aliased(Airport), aliased(Airport)

    session = get_session()
    
    query = (
        select(Flight)
        .join(Route, Flight.route == Route.id)
        .join(FromAirport, Route.from_airport == FromAirport.id)
        .join(ToAirport, Route.to_airport == ToAirport.id)
    )
    
    if code:
        query = query.where(Flight.code.ilike(f'%{code}%'))
    if from_airport:
        query = query.where(FromAirport.code == from_airport)
    if to_airport:
        query = query.where(ToAirport.code == to_airport)
    if from_date:
        query = query.where(Flight.departure >= from_date)
    if to_date:
        query = query.where(Flight.arrival <= to_date)

    flights = session.execute(query).scalars().all()
    return FlightSchema(many=True).dump(flights)

def get_flights_by_airlineId(airline_id):
    
    session = get_session()
    
    if(not airline_exists(airline_id)):
        abort(404)

    flights = session.query(Flight).where(Flight.airline == airline_id)

    return FlightSchema(many=True, exclude=["airline"]).dump(flights)

def get_flight_by_id(flight_id):
    flight = Flight.query.get_or_404(flight_id)
    return FlightSchema().dump(flight)

def create_flight(data):
    session = get_session(current_user.role)
    new_flight = Flight(
        code=data.get('code'),
        route=data.get('route'),
        airline=data.get('airline'),
        airplane=data.get('airplane'),
        departure=data.get('departure'),
        arrival=data.get('arrival'),
        duration=data.get('duration')
    )
    new_flight.save(session)
    return FlightSchema().dump(new_flight)

def delete_flight_by_id(flight_id):
    try:
        session = get_session(current_user.role)
        with session.begin():
            
            # Find flight
            flight = session.query(Flight).get(flight_id)
            if not flight:
                abort(404, description="Flight not found")
            
            # Check if admin or airline owner
            if current_user.role != "admin" and flight.airline != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")
                
            # TODO: check associated tickets or other
            
            flight.delete(session)
            session.commit()
    except Exception as e:
        # rollback automatico
        raise e
    
# TODO: airplane checked by trigger
def update_flight_by_id(flight_id, data):
    try:
        session = get_session(current_user.role)
        with session.begin():
            
            # Find flight
            flight = session.query(Flight).get(flight_id)
            if not flight:
                abort(404, description="Flight not found")
            
            # Check if admin or airline owner
            if current_user.role != "admin" and flight.airline != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")
                
            # Airline owner cannot change airline
            if current_user.role == "airline" and "airline" in data and data["airline"] != current_user.id:
                abort(403, description="Forbidden: You cannot change the airline field")    
                
            flight.update(data)
            session.commit()
            return FlightSchema().dump(flight)
    except Exception as e:
        # rollback automatico
        raise e