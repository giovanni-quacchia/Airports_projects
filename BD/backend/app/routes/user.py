from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.services.user_service import get_all_users, create_user, get_user_by_id, delete_user_by_id, update_user_by_id, login_user_, logout_user_
from app.schemas.user_schema import UserCreateSchema, UserUpdateSchema, UserQuerySchema
from app.utils.auth_utils import admin_required, admin_or_owner_required

user_bp = Blueprint('user_bp', __name__)
user_create_schema = UserCreateSchema()
user_update_schema = UserUpdateSchema()
user_query_schema = UserQuerySchema()

# login
@user_bp.route('/login', methods=['POST'])
def login():
    data = user_create_schema.load(request.get_json())
    result = login_user_(data['mail'], data['password'])
    return jsonify(result), 200

# logout
@user_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    result = logout_user_()
    return jsonify(result), 200

# Get all users
@user_bp.route('/', methods=['GET'])
@login_required
@admin_required
def get_users():
    params = user_query_schema.load(request.args)
    results = get_all_users(params.get('q'))
    return jsonify(results), 200

# Get user by ID
@user_bp.route('/<int:user_id>', methods=['GET'])
@login_required
@admin_or_owner_required
def get_user(user_id):
    result = get_user_by_id(user_id)
    return jsonify(result), 200

# Create user
@user_bp.route('/', methods=['POST'])
@login_required
@admin_required
def new_user():
    data = user_create_schema.load(request.get_json())
    user = create_user(data)
    return jsonify(user), 201

# Delete user
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
@admin_or_owner_required
def delete_user(user_id):
    result = delete_user_by_id(user_id)
    return jsonify(result), 200

# Update user
@user_bp.route('/<int:user_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_user(user_id):
    data = user_update_schema.load(request.get_json(), partial=True)
    user = update_user_by_id(user_id, data)
    return jsonify(user), 200