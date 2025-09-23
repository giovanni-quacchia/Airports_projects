from flask import Blueprint, jsonify, request
from app.services.user_service import get_all_airlines, create_airline, get_airline_by_id, delete_airline_by_id, update_airline_by_id
from app.schemas.airline_schema import AirlineCreateSchema, AirlineUpdateSchema, AirlineQuerySchema

user_bp = Blueprint('user_bp', __name__)
user_create_schema = AirlineCreateSchema()
user_update_schema = AirlineUpdateSchema()
user_query_schema = AirlineQuerySchema()

# Get all users
@user_bp.route('/', methods=['GET'])
def get_airlines():
    params = user_query_schema.load(request.args)
    results = get_all_airlines(params.get('q'))
    return jsonify(results), 200

# Get airline by ID
@user_bp.route('/<int:airline_id>', methods=['GET'])
def get_airline(airline_id):
    result = get_airline_by_id(airline_id)
    return jsonify(result), 200

# Create airline
@user_bp.route('/', methods=['POST'])
def new_airline():
    data = user_create_schema.load(request.get_json())
    airline = create_airline(data)
    return jsonify(airline), 201

# Delete airline
@user_bp.route('/<int:airline_id>', methods=['DELETE'])
def delete_airline(airline_id):
    result = delete_airline_by_id(airline_id)
    return jsonify(result), 200

# Update airline
@user_bp.route('/<int:airline_id>', methods=['PUT'])
def update_airline(airline_id):
    data = user_update_schema.load(request.get_json(), partial=True)
    airline = update_airline_by_id(airline_id, data)
    return jsonify(airline), 200