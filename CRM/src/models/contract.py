from datetime import datetime
import os
from src.models import db

class Contract(db.Model):
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    contract_number = db.Column(db.String(64), unique=True, nullable=False)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    contract_type = db.Column(db.String(64))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    delivery_date = db.Column(db.Date)
    delivery_location = db.Column(db.String(256))
    price = db.Column(db.Float)
    status = db.Column(db.String(20), default='draft')  # draft, active, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    attachments = db.relationship('ContractAttachment', backref='contract', lazy=True, cascade="all, delete-orphan")
    invoices = db.relationship('Invoice', backref='contract', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'contract_number': self.contract_number,
            'title': self.title,
            'description': self.description,
            'contract_type': self.contract_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'delivery_location': self.delivery_location,
            'price': self.price,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'attachments': [attachment.to_dict() for attachment in self.attachments],
            'invoices': [invoice.to_dict() for invoice in self.invoices]
        }


class ContractAttachment(db.Model):
    __tablename__ = 'contract_attachments'
    
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    file_type = db.Column(db.String(64))
    file_size = db.Column(db.Integer)  # Size in bytes
    is_template = db.Column(db.Boolean, default=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'filename': self.filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'is_template': self.is_template,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None
        }
    
    @property
    def file_url(self):
        return f"/api/contracts/{self.contract_id}/attachments/{self.id}/download"
