# Northstar CRM - User Documentation

## Overview
Northstar CRM is a proprietary customer relationship management system designed specifically for Northstar Brokerage. This system manages customers, contracts, invoices, and user permissions with a focus on the brokerage business workflow.

## Features
- **Customer Management**: Store and manage customer details, view contract history, and track open invoices
- **Contract Management**: Create and manage contracts of various types, with file upload capabilities
- **Invoice Generation**: Generate PDF invoices based on loaded weights with payment tracking
- **User Management**: Admin and User role-based access control for 20 users
- **Automatic Reminders**: Email notifications for payment reminders
- **Mobile Responsive**: Full functionality on mobile devices
- **Data Import**: Import capabilities from Google Docs lists

## System Requirements
- Web server with PHP 7.4+ and MySQL 5.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for email functionality

## Installation Instructions
1. Upload the entire `northstar_crm` directory to your web server
2. Create a MySQL database and import the included `database.sql` file
3. Configure the database connection in `src/main.py`
4. Set up a virtual environment and install dependencies from `requirements.txt`
5. Configure email settings in the environment variables
6. Access the system through your web browser

## Initial Setup
1. Log in with the default admin credentials:
   - Username: admin
   - Password: admin123
2. Immediately change the default password
3. Create user accounts for your team members
4. Import existing customer data from Google Docs
5. Configure company settings

## User Roles
- **Admin**: Full access to all features, including user management
- **User**: Access to customer, contract, and invoice management with limited permissions

## Basic Usage

### Customer Management
1. Navigate to the Customers section
2. Add new customers with contact details
3. View customer history, contracts, and invoices
4. Edit or delete customer information as needed

### Contract Management
1. Navigate to the Contracts section
2. Create new contracts with customer selection
3. Upload contract files and attachments
4. Generate PDF contracts for printing or sharing
5. Track contract status and details

### Invoice Management
1. Navigate to the Invoices section
2. Create invoices linked to contracts
3. Enter loaded weights for price calculation
4. Generate PDF invoices
5. Track payment status and send reminders

### User Management (Admin Only)
1. Navigate to the Users section
2. Add new users with appropriate roles
3. Edit user details or reset passwords
4. Deactivate users when needed

## Troubleshooting
- **Login Issues**: Verify username and password, or use the password reset feature
- **PDF Generation Errors**: Ensure proper permissions on the pdfs directory
- **Email Notification Failures**: Check email configuration settings
- **Data Import Problems**: Verify Google Docs format matches expected structure

## Support
For technical support, please contact your system administrator or the development team.

## Security Notes
- Keep your login credentials secure
- Log out when not using the system
- Regularly update your password
- Do not share your account with others
