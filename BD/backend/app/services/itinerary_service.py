from app.extensions import get_session
from app.models.flight import Itinerary
from app.schemas.itinerary_schema import ItinerarySchema
from datetime import timedelta

def get_all_itineraries(from_airport=None, to_airport=None, from_date=None, to_date=None, onlyDirect=False):

    session = get_session()

    query = (session.query(
        Itinerary.flight1,
        Itinerary.flight2,
        Itinerary.tot_duration,
        Itinerary.stop_time
    ))

    if onlyDirect:
        query = query.where(Itinerary.flight2.is_(None))

    if from_airport:
        query = query.where(Itinerary.flight1['from_'].astext == from_airport)

    # flight2 IS NULL ? flight1.to_ = to_airport : flight2.to_ = to_airport
    if to_airport:
        query = query.where(
            (Itinerary.flight2.is_(None) & (Itinerary.flight1['to_'].astext == to_airport)) |
            (Itinerary.flight2.isnot(None) & (Itinerary.flight2['to_'].astext == to_airport))
        )

    if from_date:
        query = query.where(Itinerary.flight1['departure'].astext >= from_date.isoformat())

    if to_date:
        to_date += timedelta(hours=23, minutes=59, seconds=59)
        query = query.where(
            (Itinerary.flight2.is_(None) & (Itinerary.flight1['arrival'].astext <= to_date.isoformat())) |
            (Itinerary.flight2.isnot(None) & (Itinerary.flight2['arrival'].astext <= to_date.isoformat()))
        )
   
    res = query.all()
    return ItinerarySchema(many=True).dump(res)