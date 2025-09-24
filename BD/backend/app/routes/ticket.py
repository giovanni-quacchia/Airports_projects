from flask import Blueprint, jsonify, request
from app.services.ticket_service import get_all_tickets, get_ticket_by_id, create_ticket, delete_ticket_by_id, update_ticket_by_id
from app.schemas.ticket_schema import TicketSchema, TicketQuerySchema
from app.extensions import db

ticket_bp = Blueprint('ticket_bp', __name__)
ticket_schema = TicketSchema()
ticket_query_schema = TicketQuerySchema()

# Get all tickets
@ticket_bp.route('/', methods=['GET'])
def get_tickets():
    params = ticket_query_schema.load(request.args)
    results = get_all_tickets(params)
    return jsonify(results), 200

# Get ticket by ID
@ticket_bp.route('/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    result = get_ticket_by_id(ticket_id)
    return jsonify(result), 200

# Create ticket
@ticket_bp.route('/', methods=['POST'])
def new_ticket():
    data = ticket_schema.load(request.get_json())
    ticket = create_ticket(data)
    return jsonify(ticket), 201

# Delete ticket
@ticket_bp.route('/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    result = delete_ticket_by_id(ticket_id)
    return jsonify(result), 200

# Update ticket
@ticket_bp.route('/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    data = ticket_schema.load(request.get_json(), partial=True)
    ticket = update_ticket_by_id(ticket_id, data)
    return jsonify(ticket), 200