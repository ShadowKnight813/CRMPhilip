import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from src.models import db
from src.models.contract import Contract, ContractAttachment
from src.routes.auth import token_required

contract_bp = Blueprint('contract', __name__)

# Helper function to create upload directory if it doesn't exist
def ensure_upload_dir():
    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'contracts')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    return upload_dir

@contract_bp.route('/', methods=['GET'])
@token_required
def get_all_contracts(current_user):
    contracts = Contract.query.all()
    return jsonify([contract.to_dict() for contract in contracts]), 200

@contract_bp.route('/<int:contract_id>', methods=['GET'])
@token_required
def get_contract(current_user, contract_id):
    contract = Contract.query.get_or_404(contract_id)
    return jsonify(contract.to_dict()), 200

@contract_bp.route('/', methods=['POST'])
@token_required
def create_contract(current_user):
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['customer_id', 'contract_number', 'title']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new contract
    new_contract = Contract(
        customer_id=data['customer_id'],
        contract_number=data['contract_number'],
        title=data['title'],
        description=data.get('description', ''),
        contract_type=data.get('contract_type', ''),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        delivery_date=data.get('delivery_date'),
        delivery_location=data.get('delivery_location', ''),
        price=data.get('price'),
        status=data.get('status', 'draft')
    )
    
    db.session.add(new_contract)
    db.session.commit()
    
    return jsonify({'message': 'Contract created successfully!', 'contract': new_contract.to_dict()}), 201

@contract_bp.route('/<int:contract_id>', methods=['PUT'])
@token_required
def update_contract(current_user, contract_id):
    contract = Contract.query.get_or_404(contract_id)
    data = request.get_json()
    
    # Update contract fields
    if 'customer_id' in data:
        contract.customer_id = data['customer_id']
    if 'contract_number' in data:
        contract.contract_number = data['contract_number']
    if 'title' in data:
        contract.title = data['title']
    if 'description' in data:
        contract.description = data['description']
    if 'contract_type' in data:
        contract.contract_type = data['contract_type']
    if 'start_date' in data:
        contract.start_date = data['start_date']
    if 'end_date' in data:
        contract.end_date = data['end_date']
    if 'delivery_date' in data:
        contract.delivery_date = data['delivery_date']
    if 'delivery_location' in data:
        contract.delivery_location = data['delivery_location']
    if 'price' in data:
        contract.price = data['price']
    if 'status' in data:
        contract.status = data['status']
    
    db.session.commit()
    
    return jsonify({'message': 'Contract updated successfully!', 'contract': contract.to_dict()}), 200

@contract_bp.route('/<int:contract_id>', methods=['DELETE'])
@token_required
def delete_contract(current_user, contract_id):
    contract = Contract.query.get_or_404(contract_id)
    
    # Check if admin or prevent deletion if has invoices
    if not current_user.is_admin() and contract.invoices:
        return jsonify({'message': 'Cannot delete contract with existing invoices!'}), 400
    
    # Delete associated attachments
    for attachment in contract.attachments:
        # Delete file from filesystem
        try:
            file_path = attachment.file_path
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    db.session.delete(contract)
    db.session.commit()
    
    return jsonify({'message': 'Contract deleted successfully!'}), 200

# Contract attachment routes
@contract_bp.route('/<int:contract_id>/attachments', methods=['GET'])
@token_required
def get_contract_attachments(current_user, contract_id):
    contract = Contract.query.get_or_404(contract_id)
    return jsonify([attachment.to_dict() for attachment in contract.attachments]), 200

@contract_bp.route('/<int:contract_id>/attachments', methods=['POST'])
@token_required
def upload_attachment(current_user, contract_id):
    contract = Contract.query.get_or_404(contract_id)
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request!'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected!'}), 400
    
    # Create upload directory if it doesn't exist
    upload_dir = ensure_upload_dir()
    
    # Secure filename and save file
    filename = secure_filename(file.filename)
    file_path = os.path.join(upload_dir, f"{contract_id}_{filename}")
    file.save(file_path)
    
    # Create attachment record
    attachment = ContractAttachment(
        contract_id=contract_id,
        filename=filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=os.path.getsize(file_path),
        is_template=request.form.get('is_template', 'false').lower() == 'true'
    )
    
    db.session.add(attachment)
    db.session.commit()
    
    return jsonify({
        'message': 'File uploaded successfully!',
        'attachment': attachment.to_dict()
    }), 201

@contract_bp.route('/<int:contract_id>/attachments/<int:attachment_id>', methods=['DELETE'])
@token_required
def delete_attachment(current_user, contract_id, attachment_id):
    attachment = ContractAttachment.query.filter_by(id=attachment_id, contract_id=contract_id).first_or_404()
    
    # Delete file from filesystem
    try:
        if os.path.exists(attachment.file_path):
            os.remove(attachment.file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    db.session.delete(attachment)
    db.session.commit()
    
    return jsonify({'message': 'Attachment deleted successfully!'}), 200

@contract_bp.route('/<int:contract_id>/attachments/<int:attachment_id>/download', methods=['GET'])
@token_required
def download_attachment(current_user, contract_id, attachment_id):
    attachment = ContractAttachment.query.filter_by(id=attachment_id, contract_id=contract_id).first_or_404()
    
    if not os.path.exists(attachment.file_path):
        return jsonify({'message': 'File not found!'}), 404
    
    return send_from_directory(
        os.path.dirname(attachment.file_path),
        os.path.basename(attachment.file_path),
        as_attachment=True,
        download_name=attachment.filename
    )
