from flask import Blueprint, request, jsonify

from app.schemas.seat_schema import SeatSchema
from app.utils.auth_utils import admin_required
from flask_login import login_required
from app.services.seat_service import get_all_seats, get_seat_by_id, create_seat, update_seat_by_id, delete_seat_by_id

seat_bp = Blueprint("seat_bp", __name__)

# Get all seats
@seat_bp.route('/', methods=['GET'])
def get_seats():
    params = SeatSchema().load(request.args, partial=True)
    results = get_all_seats(**params)
    return jsonify(results), 200

# GET seat by ID
@seat_bp.get("/<int:pid>")
@login_required
def get_seat(pid: int):
    result = get_seat_by_id(pid)
    return jsonify(result), 200

# POST /api/seats   (autenticato)
@seat_bp.post("/")
@login_required
def create_seat_():
    data = SeatSchema().load(request.get_json())
    seat = create_seat(data)
    return jsonify(seat), 201

# PUT /api/seats/<id>   (autenticato)
@seat_bp.put("/<int:pid>")
@login_required
def update_seat(pid: int):
    data = SeatSchema().load(request.get_json(), partial=True)
    seat = update_seat_by_id(pid, data)
    return jsonify(seat), 200

# DELETE /api/seats/<id>   (autenticato)
@seat_bp.delete("/<int:pid>")
@login_required
@admin_required
def delete_seat(pid: int):
    result = delete_seat_by_id(pid)
    return jsonify(result), 200
