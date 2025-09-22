from flask import Blueprint, jsonify, request
from app.services.airport_service import get_all_airports, create_airport, get_airport_by_id, delete_airport_by_id
from app.models.airport import AirportSchema
from app.extensions import db

airport_bp = Blueprint('airport_bp', __name__)
airport_schema = AirportSchema()

# Get all airports
@airport_bp.route('/', methods=['GET'])
def get_airports():
    q = request.args.get('q')
    results = get_all_airports(q)
    return jsonify(results), 200

# Get airport by ID
@airport_bp.route('/<int:airport_id>', methods=['GET'])
def get_airport(airport_id):
    result = get_airport_by_id(airport_id)
    return jsonify(result), 200

# Create airport
@airport_bp.route('/', methods=['POST'])
def new_airport():
    data = airport_schema.load(request.form)
    airport = create_airport(data)
    return jsonify(airport), 201

# Delete airport
@airport_bp.route('/<int:airport_id>', methods=['DELETE'])
def delete_airport(airport_id):
    airport = delete_airport_by_id(airport_id)

# hook chiamato dopo una richiesta
@airport_bp.after_request
def after_request(res):
    db.commit()
    return res