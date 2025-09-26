from flask import Blueprint, jsonify, request
from app.services.flight_service import get_all_flights, get_flight_by_id, create_flight, delete_flight_by_id, update_flight_by_id
from app.schemas.flight_schema import FlightSchema, FlightQuerySchema

from flask_login import login_required
from app.utils.auth_utils import admin_or_airline_required

flight_bp = Blueprint('flight_bp', __name__)

# Get all flights
@flight_bp.route('/', methods=['GET'])
def get_flights():
    params = FlightQuerySchema().load(request.args, partial=True)
    results = get_all_flights(**params)
    return jsonify(results), 200

# Get flight by ID
@flight_bp.route('/<int:flight_id>', methods=['GET'])
def get_flight(flight_id):
    result = get_flight_by_id(flight_id)
    return jsonify(result), 200

# Create flight
@login_required
@admin_or_airline_required
@flight_bp.route('/', methods=['POST'])
def new_flight():
    data = FlightSchema().load(request.get_json())
    flight = create_flight(data)
    return jsonify(flight), 201

# Delete flight
@login_required
@admin_or_airline_required
@flight_bp.route('/<int:flight_id>', methods=['DELETE'])
def delete_flight(flight_id):
    result = delete_flight_by_id(flight_id)
    return jsonify(result), 200

# Update flight
@login_required
@admin_or_airline_required
@flight_bp.route('/<int:flight_id>', methods=['PUT'])
def update_flight(flight_id):
    data = FlightSchema().load(request.get_json(), partial=True)
    flight = update_flight_by_id(flight_id, data)
    return jsonify(flight), 200