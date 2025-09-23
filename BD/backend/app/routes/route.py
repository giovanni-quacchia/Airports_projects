from flask import Blueprint, jsonify, request
from app.services.route_service import get_all_routes, create_route, get_route_by_id, delete_route_by_id, update_route_by_id
from app.schemas.route_schema import RouteSchema, RouteQuerySchema
from app.extensions import db

route_bp = Blueprint('route_bp', __name__)
route_schema = RouteSchema()
route_query_schema = RouteQuerySchema()

# Get all routes
@route_bp.route('/', methods=['GET'])
def get_routes():
    params = route_query_schema.load(request.args)
    results = get_all_routes(params.get('from_airport'), params.get('to_airport'))
    return jsonify(results), 200

# Get route by ID
@route_bp.route('/<int:route_id>', methods=['GET'])
def get_route(route_id):
    result = get_route_by_id(route_id)
    return jsonify(result), 200

# Create route
@route_bp.route('/', methods=['POST'])
def new_route():
    data = route_schema.load(request.get_json())
    route = create_route(data)
    return jsonify(route), 201

# Delete route
@route_bp.route('/<int:route_id>', methods=['DELETE'])
def delete_route(route_id):
    result = delete_route_by_id(route_id)
    return jsonify(result), 200

# Update route
@route_bp.route('/<int:route_id>', methods=['PUT'])
def update_route(route_id):
    data = route_schema.load(request.get_json(), partial=True)
    route = update_route_by_id(route_id, data)
    return jsonify(route), 200