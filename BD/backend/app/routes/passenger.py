from flask import Blueprint, request, jsonify

from app.schemas.passenger_schema import (
    PassengerSchema, PassengerBaseSchema, PassengerQuerySchema
)
from app.utils.auth_utils import admin_required, admin_or_airline_required
from flask_login import login_required
from app.services.passenger_service import get_all_passengers, get_passenger_by_id, create_passenger, update_passenger_by_id, delete_passenger_by_id

passenger_bp = Blueprint("passenger_bp", __name__)

# Get all passengers
@passenger_bp.route('/', methods=['GET'])
@login_required
@admin_required
def get_passengers():
    params = PassengerQuerySchema().load(request.args, partial=True)
    results = get_all_passengers(**params)
    return jsonify(results), 200

# GET passenger by ID
@passenger_bp.get("/<int:pid>")
@login_required
def get_passenger(pid: int):
    result = get_passenger_by_id(pid)
    return jsonify(result), 200

# POST /api/passengers   (autenticato)
@passenger_bp.post("/")
@login_required
def create_passenger_():
    data = PassengerSchema().load(request.get_json())
    passenger = create_passenger(data)
    return jsonify(passenger), 201

# PUT /api/passengers/<id>   (autenticato)
@passenger_bp.put("/<int:pid>")
@login_required
def update_passenger(pid: int):
    data = PassengerBaseSchema().load(request.get_json(), partial=True)
    passenger = update_passenger_by_id(pid, data)
    return jsonify(passenger), 200

# DELETE /api/passengers/<id>   (autenticato)
@passenger_bp.delete("/<int:pid>")
@login_required
@admin_required
def delete_passenger(pid: int):
    result = delete_passenger_by_id(pid)
    return jsonify(result), 200
