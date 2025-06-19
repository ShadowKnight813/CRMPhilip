from datetime import datetime
from flask import Blueprint, request, jsonify, make_response, render_template
from src.models import db
from src.models.invoice import Invoice
from src.models.contract import Contract
from src.routes.auth import token_required
import os
from fpdf2 import FPDF

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('/', methods=['GET'])
@token_required
def get_all_invoices(current_user):
    invoices = Invoice.query.all()
    return jsonify([invoice.to_dict() for invoice in invoices]), 200

@invoice_bp.route('/<int:invoice_id>', methods=['GET'])
@token_required
def get_invoice(current_user, invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    return jsonify(invoice.to_dict()), 200

@invoice_bp.route('/', methods=['POST'])
@token_required
def create_invoice(current_user):
    data = request.get_json()
    
    # Check if required fields are present
    required_fields = ['customer_id', 'contract_id', 'invoice_number', 'issue_date', 'due_date', 'amount']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new invoice
    new_invoice = Invoice(
        customer_id=data['customer_id'],
        contract_id=data['contract_id'],
        invoice_number=data['invoice_number'],
        issue_date=data['issue_date'],
        due_date=data['due_date'],
        amount=data['amount'],
        loaded_weight=data.get('loaded_weight'),
        weight_unit=data.get('weight_unit', 'tons'),
        is_paid=data.get('is_paid', False),
        payment_date=data.get('payment_date'),
        payment_method=data.get('payment_method', ''),
        payment_reference=data.get('payment_reference', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(new_invoice)
    db.session.commit()
    
    return jsonify({'message': 'Invoice created successfully!', 'invoice': new_invoice.to_dict()}), 201

@invoice_bp.route('/<int:invoice_id>', methods=['PUT'])
@token_required
def update_invoice(current_user, invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()
    
    # Update invoice fields
    if 'customer_id' in data:
        invoice.customer_id = data['customer_id']
    if 'contract_id' in data:
        invoice.contract_id = data['contract_id']
    if 'invoice_number' in data:
        invoice.invoice_number = data['invoice_number']
    if 'issue_date' in data:
        invoice.issue_date = data['issue_date']
    if 'due_date' in data:
        invoice.due_date = data['due_date']
    if 'amount' in data:
        invoice.amount = data['amount']
    if 'loaded_weight' in data:
        invoice.loaded_weight = data['loaded_weight']
    if 'weight_unit' in data:
        invoice.weight_unit = data['weight_unit']
    if 'is_paid' in data:
        invoice.is_paid = data['is_paid']
    if 'payment_date' in data:
        invoice.payment_date = data['payment_date']
    if 'payment_method' in data:
        invoice.payment_method = data['payment_method']
    if 'payment_reference' in data:
        invoice.payment_reference = data['payment_reference']
    if 'notes' in data:
        invoice.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({'message': 'Invoice updated successfully!', 'invoice': invoice.to_dict()}), 200

@invoice_bp.route('/<int:invoice_id>', methods=['DELETE'])
@token_required
def delete_invoice(current_user, invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    
    # Only admin can delete paid invoices
    if invoice.is_paid and not current_user.is_admin():
        return jsonify({'message': 'Cannot delete paid invoice! Admin privileges required.'}), 403
    
    db.session.delete(invoice)
    db.session.commit()
    
    return jsonify({'message': 'Invoice deleted successfully!'}), 200

@invoice_bp.route('/<int:invoice_id>/mark-paid', methods=['PUT'])
@token_required
def mark_invoice_paid(current_user, invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()
    
    invoice.is_paid = True
    invoice.payment_date = data.get('payment_date', datetime.utcnow().date())
    invoice.payment_method = data.get('payment_method', invoice.payment_method)
    invoice.payment_reference = data.get('payment_reference', invoice.payment_reference)
    
    db.session.commit()
    
    return jsonify({'message': 'Invoice marked as paid!', 'invoice': invoice.to_dict()}), 200

@invoice_bp.route('/<int:invoice_id>/pdf', methods=['GET'])
@token_required
def generate_invoice_pdf(current_user, invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    contract = Contract.query.get_or_404(invoice.contract_id)
    customer = invoice.customer
    
    # Create PDF directory if it doesn't exist
    pdf_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'pdfs')
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir)
    
    # Generate PDF
    pdf = FPDF()
    pdf.add_page()
    
    # Add company logo and header
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'NORTHSTAR BROKERAGE', 0, 1, 'C')
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, 'Invoice', 0, 1, 'C')
    pdf.ln(10)
    
    # Invoice details
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f'Invoice #: {invoice.invoice_number}', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f'Issue Date: {invoice.issue_date}', 0, 1)
    pdf.cell(0, 10, f'Due Date: {invoice.due_date}', 0, 1)
    pdf.ln(5)
    
    # Customer details
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Customer Details:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f'Name: {customer.name}', 0, 1)
    pdf.cell(0, 10, f'Contact: {customer.contact_person}', 0, 1)
    pdf.cell(0, 10, f'Address: {customer.address}, {customer.city}, {customer.country}', 0, 1)
    pdf.ln(5)
    
    # Contract details
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Contract Details:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f'Contract #: {contract.contract_number}', 0, 1)
    pdf.cell(0, 10, f'Title: {contract.title}', 0, 1)
    pdf.cell(0, 10, f'Delivery Date: {contract.delivery_date}', 0, 1)
    pdf.cell(0, 10, f'Delivery Location: {contract.delivery_location}', 0, 1)
    pdf.ln(5)
    
    # Invoice items
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Invoice Details:', 0, 1)
    pdf.set_font('Arial', '', 10)
    
    # Table header
    pdf.cell(90, 10, 'Description', 1)
    pdf.cell(30, 10, 'Weight', 1)
    pdf.cell(30, 10, 'Unit', 1)
    pdf.cell(40, 10, 'Amount', 1)
    pdf.ln()
    
    # Table data
    pdf.cell(90, 10, contract.title, 1)
    pdf.cell(30, 10, str(invoice.loaded_weight) if invoice.loaded_weight else '', 1)
    pdf.cell(30, 10, invoice.weight_unit, 1)
    pdf.cell(40, 10, f'${invoice.amount:.2f}', 1)
    pdf.ln()
    
    # Total
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(150, 10, 'Total:', 1)
    pdf.cell(40, 10, f'${invoice.amount:.2f}', 1)
    pdf.ln(20)
    
    # Payment status
    pdf.set_font('Arial', 'B', 12)
    if invoice.is_paid:
        pdf.set_text_color(0, 128, 0)  # Green
        pdf.cell(0, 10, f'PAID (Date: {invoice.payment_date})', 0, 1)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 10, f'Payment Method: {invoice.payment_method}', 0, 1)
        pdf.cell(0, 10, f'Reference: {invoice.payment_reference}', 0, 1)
    else:
        pdf.set_text_color(255, 0, 0)  # Red
        pdf.cell(0, 10, 'UNPAID', 0, 1)
        pdf.set_text_color(0, 0, 0)  # Reset to black
    
    # Save PDF
    pdf_filename = f'invoice_{invoice.invoice_number}.pdf'
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    pdf.output(pdf_path)
    
    # Return PDF file
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()
    
    response = make_response(pdf_data)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'inline; filename={pdf_filename}'
    
    return response

@invoice_bp.route('/overdue', methods=['GET'])
@token_required
def get_overdue_invoices(current_user):
    overdue_invoices = Invoice.query.filter_by(is_paid=False).filter(Invoice.due_date < datetime.utcnow().date()).all()
    return jsonify([invoice.to_dict() for invoice in overdue_invoices]), 200

@invoice_bp.route('/send-reminders', methods=['POST'])
@token_required
def send_payment_reminders(current_user):
    # In a real implementation, this would connect to an email service
    # For now, we'll just mark invoices as having reminders sent
    
    overdue_invoices = Invoice.query.filter_by(is_paid=False).filter(Invoice.due_date < datetime.utcnow().date()).all()
    reminder_count = 0
    
    for invoice in overdue_invoices:
        if not invoice.reminder_sent:
            invoice.reminder_sent = True
            invoice.last_reminder_date = datetime.utcnow()
            reminder_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'Payment reminders sent for {reminder_count} overdue invoices.',
        'reminder_count': reminder_count
    }), 200
