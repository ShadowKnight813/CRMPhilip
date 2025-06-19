from flask import Blueprint, request, jsonify
from src.models import db
from src.models.customer import Customer
from src.routes.auth import token_required

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/', methods=['GET'])
@token_required
def get_all_customers(current_user):
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers]), 200

@customer_bp.route('/<int:customer_id>', methods=['GET'])
@token_required
def get_customer(current_user, customer_id):
    customer = Customer.query.get_or_404(customer_id)
    return jsonify(customer.to_dict()), 200

@customer_bp.route('/', methods=['POST'])
@token_required
def create_customer(current_user):
    data = request.get_json()
    
    # Check if required fields are present
    if 'name' not in data:
        return jsonify({'message': 'Customer name is required!'}), 400
    
    # Create new customer
    new_customer = Customer(
        name=data['name'],
        contact_person=data.get('contact_person', ''),
        email=data.get('email', ''),
        phone=data.get('phone', ''),
        address=data.get('address', ''),
        city=data.get('city', ''),
        country=data.get('country', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(new_customer)
    db.session.commit()
    
    return jsonify({'message': 'Customer created successfully!', 'customer': new_customer.to_dict()}), 201

@customer_bp.route('/<int:customer_id>', methods=['PUT'])
@token_required
def update_customer(current_user, customer_id):
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()
    
    # Update customer fields
    if 'name' in data:
        customer.name = data['name']
    if 'contact_person' in data:
        customer.contact_person = data['contact_person']
    if 'email' in data:
        customer.email = data['email']
    if 'phone' in data:
        customer.phone = data['phone']
    if 'address' in data:
        customer.address = data['address']
    if 'city' in data:
        customer.city = data['city']
    if 'country' in data:
        customer.country = data['country']
    if 'notes' in data:
        customer.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({'message': 'Customer updated successfully!', 'customer': customer.to_dict()}), 200

@customer_bp.route('/<int:customer_id>', methods=['DELETE'])
@token_required
def delete_customer(current_user, customer_id):
    customer = Customer.query.get_or_404(customer_id)
    
    # Check if admin or prevent deletion if has contracts
    if not current_user.is_admin() and customer.contracts:
        return jsonify({'message': 'Cannot delete customer with existing contracts!'}), 400
    
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({'message': 'Customer deleted successfully!'}), 200
