from flask import Blueprint, jsonify, request
from app.services.itinerary_service import get_all_itineraries
from app.schemas.itinerary_schema import ItineraryQuerySchema

itinerary_bp = Blueprint('itinerary_bp', __name__)

# Get all itineraries
@itinerary_bp.route('/', methods=['GET'])
def get_itineraries():
    params = ItineraryQuerySchema().load(request.args, partial=True)
    results = get_all_itineraries(**params)
    return jsonify(results), 200