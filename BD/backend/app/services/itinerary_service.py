from sqlalchemy import text
from app.extensions import db

def get_all_itineraries(from_airport=None, to_airport=None, from_date=None, to_date=None, onlyDirect=False):

    sql = "SELECT * FROM itineraries"
    params = {}
    filters = []

    if to_date:
        to_date += " 23:59:59"

    if onlyDirect:
        filters.append("flight2 IS NULL")
    if from_airport:
        filters.append("flight1 ->> 'from' = :from_airport")
        params['from_airport'] = from_airport
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

    query = text(sql)
    result = db.session.execute(query, params).mappings().all()
    itineraries = [dict(row) for row in result]
    return itineraries