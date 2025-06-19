from datetime import datetime
from src.models import db

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(64), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    loaded_weight = db.Column(db.Float)  # Weight in tons or kg
    weight_unit = db.Column(db.String(10), default='tons')  # tons, kg, etc.
    is_paid = db.Column(db.Boolean, default=False)
    payment_date = db.Column(db.Date)
    payment_method = db.Column(db.String(64))
    payment_reference = db.Column(db.String(128))
    notes = db.Column(db.Text)
    reminder_sent = db.Column(db.Boolean, default=False)
    last_reminder_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'contract_id': self.contract_id,
            'contract_number': self.contract.contract_number if self.contract else None,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'amount': self.amount,
            'loaded_weight': self.loaded_weight,
            'weight_unit': self.weight_unit,
            'is_paid': self.is_paid,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'notes': self.notes,
            'reminder_sent': self.reminder_sent,
            'last_reminder_date': self.last_reminder_date.isoformat() if self.last_reminder_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def is_overdue(self):
        if not self.is_paid and self.due_date:
            return self.due_date < datetime.utcnow().date()
        return False
    
    @property
    def days_overdue(self):
        if self.is_overdue:
            return (datetime.utcnow().date() - self.due_date).days
        return 0
    
    @property
    def pdf_url(self):
        return f"/api/invoices/{self.id}/pdf"
