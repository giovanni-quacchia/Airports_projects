from flask import Blueprint, jsonify, request
from app.services.itinerary_service import get_all_itineraries
from app.schemas.flight_schema import FlightSchema, FlightQuerySchema

itinerary_bp = Blueprint('itinerary_bp', __name__)
flight_schema = FlightSchema()
flight_query_schema = FlightQuerySchema()

# Get all itineraries
@itinerary_bp.route('/', methods=['GET'])
def get_itineraries():
    params = flight_query_schema.load(request.args)
    results = get_all_itineraries(**params)
    return jsonify(results), 200