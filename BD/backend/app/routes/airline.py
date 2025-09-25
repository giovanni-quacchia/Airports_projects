from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.services.airline_service import get_all_airlines, create_airline, get_airline_by_id, delete_airline_by_id, update_airline_by_id, login_airline_, logout_airline_
from app.services.airplane_service import get_airplanes_by_airlineId
from app.services.flight_service import get_flights_by_airlineId
from app.schemas.airline_schema import AirlineSchema, AirlineUpdateSchema, AirlineQuerySchema, AirlineLoginSchema

airline_bp = Blueprint('airline_bp', __name__)
airline_create_schema = AirlineSchema()
airline_update_schema = AirlineUpdateSchema()
airline_query_schema = AirlineQuerySchema()
airline_login_schema = AirlineLoginSchema()

# login
@airline_bp.route('/login', methods=['POST'])
def login():
    data = airline_login_schema.load(request.get_json())
    result = login_airline_(**data)
    return jsonify(result), 200

# logout
@airline_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    result = logout_airline_()
    return jsonify(result), 200

# Get all airlines
@airline_bp.route('/', methods=['GET'])
def get_airlines():
    params = airline_query_schema.load(request.args)
    results = get_all_airlines(params.get('q'))
    return jsonify(results), 200

# Get airline by ID
@airline_bp.route('/<int:airline_id>', methods=['GET'])
def get_airline(airline_id):
    result = get_airline_by_id(airline_id)
    return jsonify(result), 200

# Get airplanes by airline ID
@airline_bp.route('/<int:airline_id>/airplanes', methods=['GET'])
def get_airplanes_by_airline(airline_id):
    results = get_airplanes_by_airlineId(airline_id)
    return jsonify(results), 200

# Get flights by airline ID TODO
@airline_bp.route('/<int:airline_id>/flights', methods=['GET'])
def get_flights_by_airline(airline_id):
    results = get_flights_by_airlineId(airline_id)
    return jsonify(results), 200

# Create airline
@airline_bp.route('/', methods=['POST'])
def new_airline():
    data = airline_create_schema.load(request.get_json())
    airline = create_airline(data)
    return jsonify(airline), 201

# Delete airline
@airline_bp.route('/<int:airline_id>', methods=['DELETE'])
def delete_airline(airline_id):
    result = delete_airline_by_id(airline_id)
    return jsonify(result), 200

# Update airline
# TODO: trigger beforeupdate code, update flights code ???
@airline_bp.route('/<int:airline_id>', methods=['PUT'])
def update_airline(airline_id):
    data = airline_update_schema.load(request.get_json(), partial=True)
    airline = update_airline_by_id(airline_id, data)
    return jsonify(airline), 200    