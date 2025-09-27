from flask import Blueprint, jsonify, request
from app.services.route_service import get_all_routes, create_route, get_route_by_id, delete_route_by_id, update_route_by_id
from app.services.airplane_service import get_airplanes_by_routeId
from app.schemas.route_schema import RouteSchema, RouteQuerySchema
from app.extensions import db

from flask_login import login_required
from app.utils.auth_utils import admin_required, admin_or_airline_required

route_bp = Blueprint('route_bp', __name__)
route_schema = RouteSchema()
route_query_schema = RouteQuerySchema()

# Get all routes
@route_bp.route('/', methods=['GET'])
def get_routes():
    params = route_query_schema.load(request.args)
    results = get_all_routes(params.get('from_airport'), params.get('to_airport'))
    return jsonify(results), 200

# Get airplanes by route ID
@route_bp.route('/<int:route_id>/airplanes', methods=['GET'])
@login_required
@admin_or_airline_required
def get_airplanes_by_route(route_id):
    results = get_airplanes_by_routeId(route_id)
    return jsonify(results), 200

# Get route by ID
@route_bp.route('/<int:route_id>', methods=['GET'])
def get_route(route_id):
    result = get_route_by_id(route_id)
    return jsonify(result), 200

# Create route
@route_bp.route('/', methods=['POST'])
@login_required
@admin_or_airline_required
def new_route():
    data = route_schema.load(request.get_json())
    route = create_route(data)
    return jsonify(route), 201

# Delete route
@login_required
@admin_required
@route_bp.route('/<int:route_id>', methods=['DELETE'])
def delete_route(route_id):
    result = delete_route_by_id(route_id)
    return jsonify(result), 200

# Update route
@route_bp.route('/<int:route_id>', methods=['PUT'])
@login_required
@admin_required
def update_route(route_id):
    data = route_schema.load(request.get_json(), partial=True)
    route = update_route_by_id(route_id, data)
    return jsonify(route), 200