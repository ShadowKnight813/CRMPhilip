import os
import sys

# Add the CRM src directory to Python path
crm_src_path = os.path.join(os.path.dirname(__file__), 'CRM', 'src')
sys.path.insert(0, crm_src_path)

from flask import Flask, send_from_directory
from src.models import db
from src.models.all_models import User, Customer, Contract, ContractAttachment, Invoice
from src.routes.user import user_bp
from src.routes.customer import customer_bp
from src.routes.contract import contract_bp
from src.routes.invoice import invoice_bp
from src.routes.auth import auth_bp
from src.routes.contract_pdf import contract_pdf_bp

app = Flask(__name__, static_folder=os.path.join(crm_src_path, 'static'))
app.config['SECRET_KEY'] = 'test-secret-key-for-crm-testing'

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(customer_bp, url_prefix='/api/customers')
app.register_blueprint(contract_bp, url_prefix='/api/contracts')
app.register_blueprint(contract_pdf_bp, url_prefix='/api/contracts')
app.register_blueprint(invoice_bp, url_prefix='/api/invoices')

# Use SQLite for testing instead of MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def create_test_data():
    """Create some test data for testing the system"""
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if admin user already exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            # Create admin user
            admin = User(
                username='admin',
                email='admin@northstar.com',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            
            # Create regular user
            user = User(
                username='user',
                email='user@northstar.com', 
                first_name='Test',
                last_name='User',
                role='user'
            )
            user.set_password('user123')
            db.session.add(user)
            
            # Create test customer
            customer = Customer(
                name='Test Company Inc.',
                contact_person='John Doe',
                email='john@testcompany.com',
                phone='555-1234',
                address='123 Test Street, Test City, TC 12345'
            )
            db.session.add(customer)
            
            db.session.commit()
            print("✅ Test data created successfully!")
            print("Admin credentials: admin / admin123")
            print("User credentials: user / user123")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    create_test_data()
    print("🚀 Starting Northstar CRM Test Server...")
    print("📋 Access the CRM at: http://localhost:5000")
    print("👤 Login with: admin / admin123 or user / user123")
    app.run(host='0.0.0.0', port=5000, debug=True) 