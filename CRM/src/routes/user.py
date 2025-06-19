from flask import Blueprint, request, jsonify
from src.models import db
from src.models.user import User
from src.routes.auth import token_required, admin_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@user_bp.route('/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@user_bp.route('/', methods=['POST'])
@token_required
@admin_required
def create_user(current_user):
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists!'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists!'}), 400
    
    # Validate role
    if data['role'] not in ['admin', 'user']:
        return jsonify({'message': 'Invalid role! Must be "admin" or "user"'}), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully!', 'user': new_user.to_dict()}), 201

@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Update user fields
    if 'username' in data:
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'message': 'Username already in use!'}), 400
        user.username = data['username']
    
    if 'email' in data:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'message': 'Email already in use!'}), 400
        user.email = data['email']
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    if 'role' in data:
        if data['role'] not in ['admin', 'user']:
            return jsonify({'message': 'Invalid role! Must be "admin" or "user"'}), 400
        user.role = data['role']
    
    if 'password' in data:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({'message': 'User updated successfully!', 'user': user.to_dict()}), 200

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        return jsonify({'message': 'Cannot delete your own account!'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully!'}), 200
