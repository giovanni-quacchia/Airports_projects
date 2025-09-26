from app.models.airport import Airport
from app.schemas.airport_schema import AirportSchema
from sqlalchemy import or_
from app.extensions import get_session
from flask import abort
from flask_login import current_user

def get_all_airports(q):
    session = get_session()
    query = session.query(Airport)

    if q:
        query = query.filter(AirportsMatch(Airport, q))

    airports = query.all()
    
    return [AirportSchema().dump(airport) for airport in airports]

def get_airport_by_id(airport_id):
    session = get_session()
    airport = session.query(Airport).get(airport_id)
    if not airport:
        abort(404, description="Airport not found")
    return AirportSchema().dump(airport)

def create_airport(data):
    session = get_session(current_user.role)
    new_airport = Airport(
        code=data.get('code'),
        name=data['name'],
        city=data['city'],
        country=data['country']
    )
    new_airport.save(session)
    return AirportSchema().dump(new_airport)
    
def delete_airport_by_id(airport_id):
    session = get_session(current_user.role)
    airport = session.query(Airport).get(airport_id)
    if not airport:
        abort(404, description="Airport not found")
    airport.delete()
    return {"message": "Airport deleted successfully"}
    
def update_airport_by_id(airport_id, data):
    session = get_session(current_user.role)
    airport = session.query(Airport).get(airport_id)
    if not airport:
        abort(404, description="Airport not found")
    airport.update(data)
    return AirportSchema().dump(airport)

# WHERE code LIKE '%q%' OR name LIKE '%q%' ...
def AirportsMatch(table, q):
    return or_(
        table.code.ilike(f'%{q}%'),
        table.name.ilike(f'%{q}%'),
        table.city.ilike(f'%{q}%'),
        table.country.ilike(f'%{q}%')
    )