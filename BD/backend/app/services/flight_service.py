from flask import abort
from sqlalchemy import func
from sqlalchemy.orm import aliased
from app.models.flight import Flight
from app.models.route import Route
from app.models.airport import Airport
from app.models.ticket import Ticket
from app.models.seat import Seat
from app.models.purchase import Purchase
from app.models.PurchaseTicket import PurchaseTicket
from app.schemas.flight_schema import FlightSchema, FlightGetSchema
from app.services.airline_service import airline_exists
from datetime import timedelta

from app.extensions import get_session
from flask_login import current_user

def get_all_flights(from_airport=None, to_airport=None, from_date=None, to_date=None, code=None):

    FromAirport, ToAirport = aliased(Airport), aliased(Airport)

    session = get_session()
    
    query = (
        session.query(Flight)
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
        to_date += timedelta(hours=23, minutes=59, seconds=59)
        query = query.where(Flight.arrival <= to_date)

    res = query.all()
    return FlightSchema(many=True).dump(res)

"""
SELECT f.*,
    af.code AS from_airport,
    at.code AS to_airport,
    COUNT(s.seat) AS numPassengers,
    SUM(p.totalPrice * p.quantity) AS totRevenue
FROM Flights f
LEFT JOIN Ticktets t ON f.id = t.flight -- considera tutti i voli, anche quelli senza biglietti o passeggeri
LEFT JOIN Seats s ON t.id = s.ticket
LEFT JOIN PurchasesTickets pt ON t.id = pt.ticket
LEFT JOIN Purchases p ON pt.purchase = p.id
JOIN Routes r ON f.route = r.id
JOIN Airport af ON r.from_airport = af.id
JOIN Airport at ON r.to_airport = at.id
WHERE f.airline = :airline_id
GROUP BY f.id, af.code, at.code
"""

def get_flights_by_airlineId(airline_id):
    
    session = get_session()
    
    FromAirport, ToAirport = aliased(Airport), aliased(Airport) 
    
    query = (
        session.query(
            Flight,
            FromAirport.code.label('from_airport'),
            ToAirport.code.label('to_airport'),
            func.sum(Purchase.total_cost * Purchase.quantity).label('totRevenue'), 
            func.count(Seat.seat).label('numPassengers'))
        .join(Ticket, Ticket.flight == Flight.id, isouter=True)  # considera tutti i voli, anche quelli senza biglietti o passeggeri
        .join(Seat, Seat.ticket == Ticket.id, isouter=True)
        .join(PurchaseTicket, PurchaseTicket.ticket == Ticket.id, isouter=True)
        .join(Purchase, PurchaseTicket.purchase == Purchase.id, isouter=True)
        .join(Route, Flight.route == Route.id)
        .join(FromAirport, Route.from_airport == FromAirport.id)
        .join(ToAirport, Route.to_airport == ToAirport.id)
        .where(Flight.airline == airline_id)
        .group_by(Flight.id, FromAirport.code, ToAirport.code)
    )
    
    if(not airline_exists(airline_id)):
        abort(404)

    flights = query.all()

    return [{
        **FlightSchema(exclude=["airline"]).dump(flight),
        "from_airport": from_airport,
        "to_airport": to_airport,
        "totRevenue": totRevenue or 0,
        "numPassengers": numPassengers or 0
    } for flight, from_airport, to_airport, totRevenue, numPassengers in flights
    ]

def get_flight_by_id(flight_id):
    session = get_session()

    FromAirport, ToAirport = aliased(Airport), aliased(Airport)

    query = (
        session.query(
            Flight.id,
            Flight.code,
            Flight.airline,
            Flight.airplane,
            Flight.departure,
            Flight.arrival,
            Flight.duration,
            func.json_build_object(
                'from_airport', func.json_build_object(
                    'id', FromAirport.id,
                    'name', FromAirport.name,
                    'code', FromAirport.code,
                    'city', FromAirport.city,
                    'country', FromAirport.country
                ),
                'to_airport', func.json_build_object(
                    'id', ToAirport.id,
                    'name', ToAirport.name,
                    'code', ToAirport.code,
                    'city', ToAirport.city,
                    'country', ToAirport.country
                )
            ).label('route')
        )
        .join(Route, Flight.route == Route.id)
        .join(FromAirport, Route.from_airport == FromAirport.id)
        .join(ToAirport, Route.to_airport == ToAirport.id)
        .where(Flight.id == flight_id)
    )

    flight = query.first()

    if not flight:
        abort(404, description="Flight not found")
    return FlightGetSchema().dump(flight)

def create_flight(data):
    session = get_session()
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
        session = get_session()
        with session.begin():
            
            # Find flight
            flight = session.query(Flight).get(flight_id)
            if not flight:
                abort(404, description="Flight not found")
            
            # Check if admin or airline owner
            if current_user.role != "admin" and flight.airline != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")
            
            flight.delete(session, commit=False)
            return {"message": "Flight deleted"}
    except Exception as e:
        # rollback automatico
        raise e
    
def update_flight_by_id(flight_id, data):
    try:
        session = get_session()
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
            return FlightSchema().dump(flight)
    except Exception as e:
        # rollback automatico
        raise e