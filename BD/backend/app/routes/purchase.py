from flask import Blueprint, jsonify, request
from app.services.purchase_service import get_all_purchases, create_purchase, get_purchase_by_id, delete_purchase_by_id, update_purchase_by_id
from app.schemas.purchase_schema import PurchaseSchema
from app.extensions import db

purchase_bp = Blueprint('purchase_bp', __name__)
purchase_schema = PurchaseSchema()

# Get all purchases
@purchase_bp.route('/', methods=['GET'])
def get_purchases():
    results = get_all_purchases()
    return jsonify(results), 200

# Get purchase by ID
@purchase_bp.route('/<int:purchase_id>', methods=['GET'])
def get_purchase(purchase_id):
    result = get_purchase_by_id(purchase_id)
    return jsonify(result), 200

# Create purchase
@purchase_bp.route('/', methods=['POST'])
def new_purchase():
    data = purchase_schema.load(request.get_json())
    purchase = create_purchase(data)
    return jsonify(purchase), 201

# Delete purchase
@purchase_bp.route('/<int:purchase_id>', methods=['DELETE'])
def delete_purchase(purchase_id):
    result = delete_purchase_by_id(purchase_id)
    return jsonify(result), 200

# Update purchase
@purchase_bp.route('/<int:purchase_id>', methods=['PUT'])
def update_purchase(purchase_id):
    # TODO: trigger before update: check new.quantity >= passengers
    data = purchase_schema.load(request.get_json(), partial=True)
    purchase = update_purchase_by_id(purchase_id, data)
    return jsonify(purchase), 200