from app.models.airline import Airline
from flask import abort
from sqlalchemy import or_

def get_all_airlines(q):
    query = Airline.query
    if q:
        query = query.filter(AirlineMatch(Airline, q))
    airlines = query.all()
    return [get_airline_json(airline) for airline in airlines]

def get_airline_by_id(airline_id):
    airline = Airline.query.get(airline_id)
    if not airline:
        abort(404)
    return get_airline_json(airline)

def create_airline(data):
    new_airline = Airline(
        mail=data.get('mail'),
        code=data.get('code'),
        name=data.get('name'),
        PIVA=data.get('PIVA'),
        logo=data.get('logo'),
    )
    new_airline.save()
    return get_airline_json(new_airline)

def delete_airline_by_id(airline_id):
    airline = Airline.query.get_or_404(airline_id)
    airline.delete()
    return {"message": "Airline deleted successfully"}

def update_airline_by_id(airline_id, data):
    airline = Airline.query.get_or_404(airline_id)
    if 'password' in data:
        airline.set_password(data.pop('password'))
    airline.update(data)
    return get_airline_json(airline)

def get_airline_json(airline):
    return {
        "id": airline.id,
        "mail": airline.mail,
        "code": airline.code,
        "name": airline.name,
        "PIVA": airline.PIVA,
        "logo": airline.logo,
        "isFirstLogin": airline.isFirstLogin
    }
    
# WHERE code LIKE '%q%' OR name LIKE '%q%' ...
def AirlineMatch(table, q):
    return or_(
        table.code.ilike(f'%{q}%'),
        table.name.ilike(f'%{q}%'),
        table.PIVA.ilike(f'%{q}%'),
    )