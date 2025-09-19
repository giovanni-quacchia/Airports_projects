from app.models.airport import Airport

def get_all_airports():
    airports = Airport.query.all()
    return [{
        "code": airport.code,
        "name": airport.name,
        "city": airport.city,
        "country": airport.country
    } for airport in airports]

def create_airport(data):
    new_airport = Airport(
        code=data.get('code'),
        name=data['name'],
        city=data['city'],
        country=data['country']
    )
    new_airport.save()
    return {
        "code": new_airport.code,
        "name": new_airport.name,
        "city": new_airport.city,
        "country": new_airport.country
    }