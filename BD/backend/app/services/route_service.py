from flask import abort
from sqlalchemy import select
from sqlalchemy.orm import aliased
from app.models.route import Route
from app.models.airport import Airport
from app.extensions import db
from app.services.airport_service import AirportsMatch
from app.extensions import get_session

def get_all_routes(from_airport=None, to_airport=None):

    session = get_session()
    
    FromAirport = aliased(Airport)
    ToAirport = aliased(Airport)
    
    query = query_get_routes(FromAirport, ToAirport)

    if from_airport:
        query = query.where(AirportsMatch(FromAirport,from_airport))
    if to_airport:
        query = query.where(AirportsMatch(ToAirport, to_airport))

    routes = session.execute(query).all()

    return [get_route_json(route) for route in routes]

def get_route_by_id(route_id):
    
    session = get_session()

    FromAirport = aliased(Airport)
    ToAirport = aliased(Airport)
    
    query = query_get_routes(FromAirport, ToAirport).where(Route.id == route_id)

    route = session.execute(query).one_or_none()
    if not route:
        abort(404)

    return get_route_json(route)

def create_route(data):
    session = get_session()
    new_route = Route(
        from_airport=data.get('from_airport'),
        to_airport=data.get('to_airport')
    )
    new_route.save(session)
    return {
        "id": new_route.id,
        "from_airport": new_route.from_airport,
        "to_airport": new_route.to_airport
    }

def delete_route_by_id(route_id):
    session = get_session()
    route = session.query(Route).get(route_id)
    if not route:
        abort(404, description="Route not found")
    route.delete(session)
    return {"message": "Route deleted successfully"}

def update_route_by_id(route_id, data):
    session = get_session()
    route = session.query(Route).get(route_id)
    if not route:
        abort(404, description="Route not found")
    route.update(data, session)
    return {
        "id": route.id,
        "from_airport": route.from_airport,
        "to_airport": route.to_airport
    }
    
def query_get_routes(FromAirport, ToAirport):
    
    return select(
        Route.id,
        FromAirport.code.label("from_code"),
        FromAirport.name.label("from_name"),
        FromAirport.city.label("from_city"),
        FromAirport.country.label("from_country"),
        ToAirport.code.label("to_code"),
        ToAirport.name.label("to_name"),
        ToAirport.city.label("to_city"),
        ToAirport.country.label("to_country")
    ).select_from(Route).join(
        FromAirport, Route.from_airport == FromAirport.id
    ).join(
        ToAirport, Route.to_airport == ToAirport.id
    )

def get_route_json(route):
    return {
        "id": route.id,
        "from_airport": {
            "code": route.from_code,
            "name": route.from_name,
            "city": route.from_city,
            "country": route.from_country
        },
        "to_airport": {
            "code": route.to_code,
            "name": route.to_name,
            "city": route.to_city,
            "country": route.to_country
        }
    }

def route_exists(route_id) -> bool:
    exists_query = select(Route.id).where(Route.id == route_id).exists()
    exists_route = db.session.execute(select(exists_query)).scalar()
    return exists_route