from app.models.airplane import Airplane
from app.models.flight import Flight
from app.models.route import Route
from app.models.airport import Airport
from app.models.RoutesAirplanes import RoutesAirplanes
from sqlalchemy import select, func
from flask import abort
from app.services.route_service import route_exists
from app.schemas.airplane_schema import AirplaneSchema
from app.extensions import get_session
from sqlalchemy.orm import aliased

from flask_login import current_user

def get_all_airplanes(model=None):
    session = get_session()
    query = session.query(Airplane)

    if model:
        query = query.filter(Airplane.model.ilike(f'%{model}%'))

    airplanes = query.all()

    return [AirplaneSchema().dump(airplane) for airplane in airplanes]

"""
SELECT
    a.*,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'from_airport', AirportFrom.code,
            'to_airport', AirportTo.code,
            'startDate', ra.startDate,
            'endDate', ra.endDate
        )
    ) AS periods
FROM Airplane a
LEFT JOIN RoutesAirplanes ra ON a.id = ra.airplane -- anche aeroplani senza rotta associata
LEFT JOIN Route r ON ra.route = r.id
LEFT JOIN Airport AirportFrom ON r.from_airport = AirportFrom.id
LEFT JOIN Airport AirportTo ON r.to_airport = AirportTo.id
WHERE a.airline =: airline_id
GROUP BY a.id;
"""
def get_airplanes_by_airlineId(airline_id):
    session = get_session()
    
    FromAirport, ToAirport = aliased(Airport), aliased(Airport)
    # TODO: add coalesce
    query = (
        select(
            Airplane, 
            func.json_agg(
                func.json_build_object(
                    'from_airport', FromAirport.code,
                    'to_airport', ToAirport.code,
                    'startDate', RoutesAirplanes.startDate,
                    'endDate', RoutesAirplanes.endDate
                )
            )
        )
        .join(RoutesAirplanes, Airplane.id == RoutesAirplanes.airplane, isouter=True)  # anche aeroplani senza rotta associata
        .join(Route, RoutesAirplanes.route == Route.id, isouter=True)
        .join(FromAirport, Route.from_airport == FromAirport.id, isouter=True)
        .join(ToAirport, Route.to_airport == ToAirport.id, isouter=True)
        .where(Airplane.airline == airline_id)
        .group_by(Airplane.id)
    )
    
    results = session.execute(query).all()
    return [
        AirplaneSchema().dump(airplane) | {"periods": periods}
        for airplane, periods in results
    ]

def get_airplane_for_flight(flight_id):
    session = get_session()

    # Query to find the airplane associated with the given flight ID
    query = (
        select(Airplane)
        .join(Flight, Airplane.id == Flight.airplane)
        .where(Flight.id == flight_id)
    )

    airplane = session.execute(query).scalar_one_or_none()

    if not airplane:
        abort(404, description="Airplane not found for the given flight ID")

    return AirplaneSchema().dump(airplane)

"""
SELECT
    a.*,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'startDate', ra.startDate,
            'endDate', ra.endDate
        )
    ) AS periods
FROM Airplane a
JOIN RoutesAirplanes ra ON a.id = ra.airplane 
WHERE ra.route = ?
GROUP BY a.id;
"""
def get_airplanes_by_routeId(route_id):

    if(not route_exists(route_id)):
        abort(404, description=f"Route with ID {route_id} does not exist.")

    session = get_session()

    # Trova tutti gli aerei con relativo periodo associato
    query = (
        select(
            Airplane, 
            func.json_agg(
                func.json_build_object(
                    'startDate', RoutesAirplanes.startDate,
                    'endDate', RoutesAirplanes.endDate
                )
            )
        )
        .join(RoutesAirplanes, Airplane.id == RoutesAirplanes.airplane)
        .where(RoutesAirplanes.route == route_id)
        .group_by(Airplane.id)
    )

    results = session.execute(query).all()

    return [
        AirplaneSchema().dump(airplane) | {"periods": periods}
        for airplane, periods in results
    ]

def get_airplane_by_id(airplane_id):
    session = get_session()
    airplane = session.query(Airplane).get(airplane_id)
    if not airplane:
        abort(404, description="Airplane not found")
    return AirplaneSchema().dump(airplane)

def create_airplane(data):
    session = get_session()
    new_airplane = Airplane(
        model=data['model'],
        letters=data['letters'],
        rows=data['rows'],
        airline=current_user.id
    )
    new_airplane.save(session)
    return AirplaneSchema().dump(new_airplane)

def delete_airplane_by_id(airplane_id):
    try:
        session = get_session()
        with session.begin():
            
            # Find airplane
            airplane = find_airplane_by_id(session, airplane_id)
            
            # Check if admin or airline owner
            if current_user.role != "admin" and airplane.airline != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")
                
            # Associated routes are ondelete=cascade
            
            airplane.delete(session)
            
            return {"message": "Airplane deleted successfully"}
        
    except Exception as e:
        # rollback automatico
        raise e

def update_airplane_by_id(airplane_id, data):
    try:
        session = get_session()
        with session.begin():
            
            # Find airplane
            airplane = find_airplane_by_id(session, airplane_id)
            
            # Check if admin or airline owner
            if current_user.role != "admin" and airplane.airline != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")
                
            airplane.update(data, session)

            return AirplaneSchema().dump(airplane)

    except Exception as e:
        # rollback automatico
        raise e

def find_airplane_by_id(session, id):
    airplane = session.query(Airplane).get(id)
    if not airplane:
        abort(404, description="Airplane not found")
    return airplane