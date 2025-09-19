from flask import Blueprint, jsonify, request
from app.services.airport_service import get_all_airports, create_airport
from app.models.airport import AirportSchema

airport_bp = Blueprint('airport_bp', __name__)
airport_schema = AirportSchema()

# Get all airports
@airport_bp.route('/', methods=['GET'])
def get_airports():
    results = get_all_airports()
    return jsonify(results), 200

# Create airport
@airport_bp.route('/', methods=['POST'])
def new_airport():
    data = airport_schema.load(request.form)
    airport = create_airport(data)
    return jsonify(airport), 201