from flask import Blueprint, jsonify, request
from app.services.purchase_service import get_all_purchases, create_purchase, get_purchase_by_id, delete_purchase_by_id, update_purchase_by_id
from app.schemas.purchase_schema import PurchaseCreateSchema, PurchaseUpdateSchema

from flask_login import login_required
from app.utils.auth_utils import admin_required, admin_or_user_required

purchase_bp = Blueprint('purchase_bp', __name__)
purchase_create_schema = PurchaseCreateSchema()
purchase_update_schema = PurchaseUpdateSchema()

# Get all purchases
@purchase_bp.route('/', methods=['GET'])
@login_required
@admin_required
def get_purchases():
    results = get_all_purchases()
    return jsonify(results), 200

# Get purchase by ID
@purchase_bp.route('/<int:purchase_id>', methods=['GET'])
@login_required
@admin_or_user_required
def get_purchase(purchase_id):
    result = get_purchase_by_id(purchase_id)
    return jsonify(result), 200

# Create purchase
"""
{
    user, 
    tickets: [id, id, ...] # list of unique ticket IDs
    passengers: [
        {
            name, surname, CF, passportNumber,
            seats: [{
                ticket, seat, extra                     # all tickets different
            }]
        }
    ]
}

TEST

{
    "user":3, // budget iniziale 200
    "tickets": [1], // quantity iniziale 50, price 150
    "quantity": 1
}

{
    "user":2, // budget iniziale 10000
    "tickets": [1], // quantity iniziale 50, price 150
    "quantity": 1,
    "passengers":[
        {
            "name": "Mario",
            "surname": "Rossi",
            "CF": "MRARSS80A01H501U",
            "passportNumber": "X1234567",   
            "seats": [
                {
                    "ticket": 2, # error qui, ticket non valido per il volo
                    "seat": "A3",
                    "extra": ["PRIORITY"]
                }
            ]
        }
    ]
}


"""
@purchase_bp.route('/', methods=['POST'])
@login_required
@admin_or_user_required
def new_purchase():
    data = purchase_create_schema.load(request.get_json())
    purchase = create_purchase(data)
    return jsonify(purchase), 201

# Delete purchase
@purchase_bp.route('/<int:purchase_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_purchase(purchase_id):
    result = delete_purchase_by_id(purchase_id)
    return jsonify(result), 200

# Update purchase
@purchase_bp.route('/<int:purchase_id>', methods=['PUT'])
@login_required
@admin_required
def update_purchase(purchase_id):
    data = purchase_update_schema.load(request.get_json(), partial=True)
    purchase = update_purchase_by_id(purchase_id, data)
    return jsonify(purchase), 200