from app.models.airport import Airport
from sqlalchemy import or_

def get_all_airports(q):
    query = Airport.query
    
    if q:
        query = query.filter(AirportsMatch(q))
        
    airports = query.all()
    
    return [{
        "id": airport.id,
        "code": airport.code,
        "name": airport.name,
        "city": airport.city,
        "country": airport.country
    } for airport in airports]

def get_airport_by_id(airport_id):
    airport = Airport.query.get_or_404(airport_id)
    return {
        "id": airport.id,
        "code": airport.code,
        "name": airport.name,
        "city": airport.city,
        "country": airport.country
    }

def create_airport(data):
    new_airport = Airport(
        code=data.get('code'),
        name=data['name'],
        city=data['city'],
        country=data['country']
    )
    new_airport.save()
    return {
        "id": new_airport.id,
        "code": new_airport.code,
        "name": new_airport.name,
        "city": new_airport.city,
        "country": new_airport.country
    }
    
def delete_airport_by_id(airport_id):
    airport = Airport.query.get_or_404(airport_id)
    airport.delete()
    return {"message": "Airport deleted successfully"}
    
def update_airport_by_id(airport_id, data):
    airport = Airport.query.get_or_404(airport_id)
    airport.update(data)
    return {
        "id": airport.id,
        "code": airport.code,
        "name": airport.name,
        "city": airport.city,
        "country": airport.country
    }

# WHERE code LIKE '%q%' OR name LIKE '%q%' ...
def AirportsMatch(q):
    return or_(
        Airport.code.ilike(f'%{q}%'),
        Airport.name.ilike(f'%{q}%'),
        Airport.city.ilike(f'%{q}%'),
        Airport.country.ilike(f'%{q}%')
    )