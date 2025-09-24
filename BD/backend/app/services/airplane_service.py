from app.models.airplane import Airplane
from app.models.RoutesAirplanes import RoutesAirplanes
from sqlalchemy import select, desc, func
from app.extensions import db
from flask import abort
from app.services.route_service import route_exists
from app.schemas.airplane_schema import AirplaneSchema


def get_all_airplanes(model=None):
    query = Airplane.query

    if model:
        query = query.filter(Airplane.model.ilike(f'%{model}%'))

    airplanes = query.all()

    return [AirplaneSchema().dump(airplane) for airplane in airplanes]

def get_airplanes_by_airlineId(airline_id):
    airplanes = Airplane.query.filter_by(airline=airline_id).all()
    return [AirplaneSchema().dump(airplane) for airplane in airplanes]


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
GROUP BY a.id, a.model;

"""
def get_airplanes_by_routeId(route_id):

    if(not route_exists(route_id)):
        abort(404, description=f"Route with ID {route_id} does not exist.")

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

    results = db.session.execute(query).all()

    return [
        AirplaneSchema().dump(airplane) | {"periods": periods}
        for airplane, periods in results
    ]

def get_airplane_by_id(airplane_id):
    airplane = Airplane.query.get_or_404(airplane_id)
    return AirplaneSchema().dump(airplane)

def create_airplane(data):
    new_airplane = Airplane(
        model=data['model'],
        letters=data['letters'],
        rows=data['rows'],
        airline=data['airline']
    )
    new_airplane.save()
    return AirplaneSchema().dump(new_airplane)

def delete_airplane_by_id(airplane_id):
    airplane = Airplane.query.get_or_404(airplane_id)
    airplane.delete()
    return {"message": "Airplane deleted successfully"}

def update_airplane_by_id(airplane_id, data):
    airplane = Airplane.query.get_or_404(airplane_id)
    airplane.update(data)
    return AirplaneSchema().dump(airplane)