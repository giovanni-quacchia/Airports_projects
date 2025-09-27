from sqlalchemy import text
from app.extensions import get_session
from app.models.flight import Itinerary
from app.schemas.itinerary_schema import ItinerarySchema

def get_all_itineraries(from_airport=None, to_airport=None, from_date=None, to_date=None, onlyDirect=False):

    session = get_session()

    query = session.query(Itinerary)
    res = query.all()

    if to_date:
        to_date += " 23:59:59"

    if onlyDirect:
        query = query.where(Itinerary.flight2._is_(None))

    if from_airport:
        query = query.where(Itinerary.flight1['from_'].astext == from_airport)

    if to_airport:
        query = query.where(
            (Itinerary.flight1['to_'].astext == to_airport and Itinerary.flight2._is_(None)) | 
            ((Itinerary.flight2 != None) & (Itinerary.flight2['to_'].astext == to_airport))
        )

    if to_airport:
        filters.append("((flight1 ->> 'to' = :to_airport AND flight2 IS NULL) OR flight2 ->> 'to' = :to_airport)")
        params['to_airport'] = to_airport
    if from_date:
        filters.append("(TO_TIMESTAMP(flight1 ->> 'departure', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') >= :from_date)")
        params['from_date'] = from_date
    # Controlla f1.arrival se f2 è NULL, altrimenti controlla f2.arrival
    if to_date:
        filters.append("((flight2 IS NULL AND TO_TIMESTAMP(flight1 ->> 'arrival', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') <= :to_date) "
                    "OR (flight2 IS NOT NULL AND TO_TIMESTAMP(flight2 ->> 'arrival', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') <= :to_date))")
        params['to_date'] = to_date

    if filters:
        sql += " WHERE " + " AND ".join(filters)


    result = session.execute(query, params).mappings().all()
    return ItinerarySchema(many=True).dump(res)
