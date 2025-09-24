from flask import Blueprint, jsonify, request
from app.services.flight_service import get_all_flights, get_flight_by_id, create_flight, delete_flight_by_id, update_flight_by_id
from app.schemas.flight_schema import FlightSchema, FlightQuerySchema

flight_bp = Blueprint('flight_bp', __name__)
flight_schema = FlightSchema()
flight_query_schema = FlightQuerySchema()

# Get all flights
@flight_bp.route('/', methods=['GET'])
def get_flights():
    params = flight_query_schema.load(request.args)
    results = get_all_flights(params.get('code'))
    return jsonify(results), 200

# Get flight by ID
@flight_bp.route('/<int:flight_id>', methods=['GET'])
def get_flight(flight_id):
    result = get_flight_by_id(flight_id)
    return jsonify(result), 200

# Create flight
@flight_bp.route('/', methods=['POST'])
def new_flight():
    data = flight_schema.load(request.get_json())
    flight = create_flight(data)
    return jsonify(flight), 201

# Delete flight
@flight_bp.route('/<int:flight_id>', methods=['DELETE'])
def delete_flight(flight_id):
    result = delete_flight_by_id(flight_id)
    return jsonify(result), 200

# Update flight
@flight_bp.route('/<int:flight_id>', methods=['PUT'])
def update_flight(flight_id):
    data = flight_schema.load(request.get_json(), partial=True)
    flight = update_flight_by_id(flight_id, data)
    return jsonify(flight), 200