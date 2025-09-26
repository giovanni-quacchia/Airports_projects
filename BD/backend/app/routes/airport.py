from flask import Blueprint, jsonify, request
from app.services.airport_service import get_all_airports, create_airport, get_airport_by_id, delete_airport_by_id, update_airport_by_id
from app.schemas.airport_schema import AirportSchema, AirportQuerySchema

from flask_login import login_required
from app.utils.auth_utils import admin_required

airport_bp = Blueprint('airport_bp', __name__)
airport_schema = AirportSchema()
airport_query_schema = AirportQuerySchema()

# Get all airports
@airport_bp.route('/', methods=['GET'])
def get_airports():
    params = airport_query_schema.load(request.args)
    results = get_all_airports(params.get("q"))
    return jsonify(results), 200

# Get airport by ID
@airport_bp.route('/<int:airport_id>', methods=['GET'])
def get_airport(airport_id):
    result = get_airport_by_id(airport_id)
    return jsonify(result), 200

# Create airport
@airport_bp.route('/', methods=['POST'])
@login_required
@admin_required
def new_airport():
    data = airport_schema.load(request.get_json())
    airport = create_airport(data)
    return jsonify(airport), 201

# Delete airport
@airport_bp.route('/<int:airport_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_airport(airport_id):
    result = delete_airport_by_id(airport_id)
    return jsonify(result), 200

# Update airport
@airport_bp.route('/<int:airport_id>', methods=['PUT'])
@login_required
@admin_required
def update_airport(airport_id):
    data = airport_schema.load(request.get_json(), partial=True)
    airport = update_airport_by_id(airport_id, data)
    return jsonify(airport), 200