from flask import Blueprint, jsonify, request
from app.services.route_service import get_all_airplanes, get_airplane_by_id, create_airplane, delete_airplane_by_id, update_airplane_by_id
from app.schemas.airplane_schema import AirplaneSchema, AirplaneQuerySchema

airplane_bp = Blueprint('airplane_bp', __name__)
airplane_schema = AirplaneSchema()
airplane_query_schema = AirplaneQuerySchema()

# Get all airplanes
@airplane_bp.route('/', methods=['GET'])
def get_airplanes():
    params = airplane_query_schema.load(request.args)
    results = get_all_airplanes(params.get('from_airport'), params.get('to_airport'))
    return jsonify(results), 200

# Get airplane by ID
@airplane_bp.route('/<int:airplane_id>', methods=['GET'])
def get_airplane(airplane_id):
    result = get_airplane_by_id(airplane_id)
    return jsonify(result), 200

# Create airplane
@airplane_bp.route('/', methods=['POST'])
def new_airplane():
    data = airplane_schema.load(request.get_json())
    airplane = create_airplane(data)
    return jsonify(airplane), 201

# Delete airplane
@airplane_bp.route('/<int:airplane_id>', methods=['DELETE'])
def delete_airplane(airplane_id):
    result = delete_airplane_by_id(airplane_id)
    return jsonify(result), 200

# Update airplane
@airplane_bp.route('/<int:airplane_id>', methods=['PUT'])
def update_airplane(airplane_id):
    data = airplane_schema.load(request.get_json(), partial=True)
    airplane = update_airplane_by_id(airplane_id, data)
    return jsonify(airplane), 200