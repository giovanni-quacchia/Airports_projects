from app.models.airplane import Airplane
from app.models.RoutesAirplanes import RoutesAirplanes
from sqlalchemy import select, desc
from app.extensions import db
from flask import abort
from app.services.route_service import route_exists


def get_all_airplanes(model=None):
    query = Airplane.query

    if model:
        query = query.filter(Airplane.model.ilike(f'%{model}%'))

    airplanes = query.all()

    return [get_airplane_json(airplane) for airplane in airplanes]

def get_airplanes_by_airlineId(airline_id):
    airplanes = Airplane.query.filter_by(airline=airline_id).all()
    return [get_airplane_json(airplane) for airplane in airplanes]


"""
SELECT a.*, ra.startDate, ra.endDate
FROM airplanes a JOIN routes_airplanes ra ON a.id = ra.airplane
WHERE ra.route = route_id
ORDER BY ra.endDate DESC
"""
def get_airplanes_by_routeId(route_id):

    if(not route_exists(route_id)):
        abort(404)

    # Trova tutti gli aerei con relativo periodo associato
    query = (
        select(Airplane, RoutesAirplanes.startDate, RoutesAirplanes.endDate)
        .join(RoutesAirplanes, Airplane.id == RoutesAirplanes.airplane)
        .where(RoutesAirplanes.route == route_id)
        .order_by(desc(RoutesAirplanes.endDate))
    )

    print(query)

    results = db.session.execute(query).all()
    
    # Raggruppa per aereo, costruendo una lista di periodi per ciascun aereo
    airplanes_dict = {}
    for airplane, start_date, end_date in results:
        if airplane.id not in airplanes_dict:
            airplanes_dict[airplane.id] = {
                "airplane": airplane,
                "periods": []
            }
        airplanes_dict[airplane.id]["periods"].append({
            "startDate": start_date,
            "endDate": end_date
        })

    return [get_airplane_json(a["airplane"]) | {"periods": a["periods"]} for a in airplanes_dict.values()]

def get_airplane_by_id(airplane_id):
    airplane = Airplane.query.get_or_404(airplane_id)
    return get_airplane_json(airplane)

def create_airplane(data):
    new_airplane = Airplane(
        model=data['model'],
        letters=data['letters'],
        rows=data['rows'],
        airline=data['airline']
    )
    new_airplane.save()
    return get_airplane_json(new_airplane)

def delete_airplane_by_id(airplane_id):
    airplane = Airplane.query.get_or_404(airplane_id)
    airplane.delete()
    return {"message": "Airplane deleted successfully"}

def update_airplane_by_id(airplane_id, data):
    airplane = Airplane.query.get_or_404(airplane_id)
    airplane.update(data)
    return get_airplane_json(airplane)
    
def get_airplane_json(airplane):
    return {
        "id": airplane.id,
        "model": airplane.model,
        "letters": airplane.letters,
        "rows": airplane.rows,
        "airline": airplane.airline
    }