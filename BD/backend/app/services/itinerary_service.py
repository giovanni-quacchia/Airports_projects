from sqlalchemy import text
from app.schemas.flight_schema import FlightSchema
from app.extensions import db
from datetime import datetime

flight_schema = FlightSchema()

def get_all_itineraries(from_airport=None, to_airport=None):
    sql = "SELECT * FROM itineraries WHERE 1=1"
    params = {}

    from_airport = "LHR"

    if from_airport:
        sql += " AND flight1->>'from' = :from_airport"
        params['from_airport'] = from_airport
    if to_airport:
        sql += " AND flight2->>'to' = :to_airport"
        params['to_airport'] = to_airport

    query = text(sql)
    itineraries = db.session.execute(query, params).mappings().all()

    results = []
    for itinerary in itineraries:
        flight1 = itinerary["flight1"]
        flight2 = itinerary["flight2"]

        # Serializza con Marshmallow
        results.append({
            "flight1": {
                "id": flight1['id'],
                "code": flight1['code'],
                "departure": flight1['departure'],
                "arrival": flight1['arrival'],
                "airline": flight1['airline'],
                "from": flight1['from'],
                "to": flight1['to']
            },
            "flight2": {
                "id": flight2['id'],
                "code": flight2['code'],
                "departure": flight2['departure'],
                "arrival": flight2['arrival'],
                "airline": flight2['airline'],
                "from": flight2['from'],
                "to": flight2['to']
            }
        })

    return results