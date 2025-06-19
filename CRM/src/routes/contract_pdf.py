from datetime import datetime
import os
from flask import Blueprint, request, jsonify, make_response, render_template
from src.models import db
from src.models.contract import Contract, ContractAttachment
from src.routes.auth import token_required
from fpdf2 import FPDF

contract_pdf_bp = Blueprint('contract_pdf', __name__)

@contract_pdf_bp.route('/<int:contract_id>/pdf', methods=['GET'])
@token_required
def generate_contract_pdf(current_user, contract_id):
    contract = Contract.query.get_or_404(contract_id)
    customer = contract.customer
    
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
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'CONTRACT', 0, 1, 'C')
    pdf.ln(10)
    
    # Contract details
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f'Contract #: {contract.contract_number}', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f'Date: {datetime.utcnow().strftime("%Y-%m-%d")}', 0, 1)
    pdf.ln(5)
    
    # Customer details
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Customer Details:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f'Name: {customer.name}', 0, 1)
    pdf.cell(0, 10, f'Contact: {customer.contact_person}', 0, 1)
    pdf.cell(0, 10, f'Address: {customer.address}, {customer.city}, {customer.country}', 0, 1)
    pdf.cell(0, 10, f'Email: {customer.email}', 0, 1)
    pdf.cell(0, 10, f'Phone: {customer.phone}', 0, 1)
    pdf.ln(5)
    
    # Contract details
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Contract Details:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f'Title: {contract.title}', 0, 1)
    pdf.cell(0, 10, f'Type: {contract.contract_type}', 0, 1)
    pdf.cell(0, 10, f'Start Date: {contract.start_date.strftime("%Y-%m-%d") if contract.start_date else "N/A"}', 0, 1)
    pdf.cell(0, 10, f'End Date: {contract.end_date.strftime("%Y-%m-%d") if contract.end_date else "N/A"}', 0, 1)
    pdf.cell(0, 10, f'Delivery Date: {contract.delivery_date.strftime("%Y-%m-%d") if contract.delivery_date else "N/A"}', 0, 1)
    pdf.cell(0, 10, f'Delivery Location: {contract.delivery_location}', 0, 1)
    pdf.cell(0, 10, f'Price: ${contract.price:.2f}', 0, 1)
    pdf.ln(5)
    
    # Description
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Description:', 0, 1)
    pdf.set_font('Arial', '', 10)
    
    # Handle multi-line description
    if contract.description:
        # Split description into lines that fit the page width
        lines = []
        description = contract.description
        while len(description) > 0:
            # Calculate how many characters fit in a line
            # This is approximate and depends on the font
            chars_per_line = 90  # Adjust based on font and page width
            if len(description) <= chars_per_line:
                lines.append(description)
                description = ''
            else:
                # Find the last space within the character limit
                cut_point = description[:chars_per_line].rfind(' ')
                if cut_point == -1:  # No space found, force cut
                    cut_point = chars_per_line
                lines.append(description[:cut_point])
                description = description[cut_point:].lstrip()
        
        # Print each line
        for line in lines:
            pdf.cell(0, 10, line, 0, 1)
    else:
        pdf.cell(0, 10, 'No description provided.', 0, 1)
    
    pdf.ln(10)
    
    # Terms and conditions
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Terms and Conditions:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 10, 'This contract is subject to the standard terms and conditions of Northstar Brokerage. By signing below, both parties agree to the terms outlined in this contract.')
    
    pdf.ln(20)
    
    # Signatures
    pdf.cell(90, 10, 'Northstar Brokerage Representative:', 0, 0)
    pdf.cell(90, 10, 'Customer Representative:', 0, 1)
    pdf.ln(15)
    pdf.cell(90, 10, '______________________________', 0, 0)
    pdf.cell(90, 10, '______________________________', 0, 1)
    pdf.ln(5)
    pdf.cell(90, 10, 'Date: ____________________', 0, 0)
    pdf.cell(90, 10, 'Date: ____________________', 0, 1)
    
    # Save PDF
    pdf_filename = f'contract_{contract.contract_number}.pdf'
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    pdf.output(pdf_path)
    
    # Return PDF file
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()
    
    response = make_response(pdf_data)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'inline; filename={pdf_filename}'
    
    return response
