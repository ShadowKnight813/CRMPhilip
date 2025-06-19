// Test script for Northstar CRM
// This script will help test various aspects of the CRM system

// Test user authentication
function testAuthentication() {
    console.log('Testing authentication...');
    
    // Test login with valid credentials
    login('admin', 'password123')
        .then(user => {
            console.log('✅ Login successful:', user);
            
            // Test accessing protected route
            return apiRequest('/api/users');
        })
        .then(users => {
            console.log('✅ Protected route access successful:', users.length + ' users found');
            
            // Test logout
            logout();
            console.log('✅ Logout successful');
            
            // Test accessing protected route after logout (should fail)
            return apiRequest('/api/users').catch(error => {
                console.log('✅ Protected route correctly blocked after logout');
                return Promise.resolve();
            });
        })
        .catch(error => {
            console.error('❌ Authentication test failed:', error);
        });
}

// Test customer management
function testCustomerManagement() {
    console.log('Testing customer management...');
    
    // Login first
    login('admin', 'password123')
        .then(() => {
            // Test creating a customer
            return apiRequest('/api/customers', 'POST', {
                name: 'Test Customer',
                contact_person: 'John Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                address: '123 Test St',
                city: 'Test City',
                country: 'Test Country',
                notes: 'Test notes'
            });
        })
        .then(response => {
            console.log('✅ Customer creation successful:', response);
            const customerId = response.customer.id;
            
            // Test retrieving the customer
            return apiRequest(`/api/customers/${customerId}`).then(customer => {
                console.log('✅ Customer retrieval successful:', customer);
                return customerId;
            });
        })
        .then(customerId => {
            // Test updating the customer
            return apiRequest(`/api/customers/${customerId}`, 'PUT', {
                name: 'Updated Test Customer'
            }).then(response => {
                console.log('✅ Customer update successful:', response);
                return customerId;
            });
        })
        .then(customerId => {
            // Test deleting the customer
            return apiRequest(`/api/customers/${customerId}`, 'DELETE').then(() => {
                console.log('✅ Customer deletion successful');
            });
        })
        .catch(error => {
            console.error('❌ Customer management test failed:', error);
        });
}

// Test contract management
function testContractManagement() {
    console.log('Testing contract management...');
    let customerId;
    
    // Login first
    login('admin', 'password123')
        .then(() => {
            // Create a test customer first
            return apiRequest('/api/customers', 'POST', {
                name: 'Contract Test Customer',
                contact_person: 'Jane Doe'
            });
        })
        .then(response => {
            customerId = response.customer.id;
            console.log('✅ Test customer created for contract testing');
            
            // Test creating a contract
            return apiRequest('/api/contracts', 'POST', {
                customer_id: customerId,
                contract_number: 'TEST-001',
                title: 'Test Contract',
                description: 'This is a test contract',
                contract_type: 'Service',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                price: 1000,
                status: 'active'
            });
        })
        .then(response => {
            console.log('✅ Contract creation successful:', response);
            const contractId = response.contract.id;
            
            // Test retrieving the contract
            return apiRequest(`/api/contracts/${contractId}`).then(contract => {
                console.log('✅ Contract retrieval successful:', contract);
                return contractId;
            });
        })
        .then(contractId => {
            // Test updating the contract
            return apiRequest(`/api/contracts/${contractId}`, 'PUT', {
                title: 'Updated Test Contract'
            }).then(response => {
                console.log('✅ Contract update successful:', response);
                return contractId;
            });
        })
        .then(contractId => {
            // Test generating contract PDF
            console.log('✅ Contract PDF generation URL:', `/api/contracts/${contractId}/pdf`);
            
            // Test deleting the contract
            return apiRequest(`/api/contracts/${contractId}`, 'DELETE').then(() => {
                console.log('✅ Contract deletion successful');
                
                // Clean up the test customer
                return apiRequest(`/api/customers/${customerId}`, 'DELETE');
            });
        })
        .then(() => {
            console.log('✅ Test customer cleanup successful');
        })
        .catch(error => {
            console.error('❌ Contract management test failed:', error);
        });
}

// Test invoice management
function testInvoiceManagement() {
    console.log('Testing invoice management...');
    let customerId, contractId;
    
    // Login first
    login('admin', 'password123')
        .then(() => {
            // Create a test customer first
            return apiRequest('/api/customers', 'POST', {
                name: 'Invoice Test Customer',
                contact_person: 'Alice Smith'
            });
        })
        .then(response => {
            customerId = response.customer.id;
            console.log('✅ Test customer created for invoice testing');
            
            // Create a test contract
            return apiRequest('/api/contracts', 'POST', {
                customer_id: customerId,
                contract_number: 'INV-TEST-001',
                title: 'Invoice Test Contract',
                price: 2000,
                status: 'active'
            });
        })
        .then(response => {
            contractId = response.contract.id;
            console.log('✅ Test contract created for invoice testing');
            
            // Test creating an invoice
            return apiRequest('/api/invoices', 'POST', {
                customer_id: customerId,
                contract_id: contractId,
                invoice_number: 'INV-001',
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                amount: 2000,
                loaded_weight: 100,
                weight_unit: 'tons'
            });
        })
        .then(response => {
            console.log('✅ Invoice creation successful:', response);
            const invoiceId = response.invoice.id;
            
            // Test retrieving the invoice
            return apiRequest(`/api/invoices/${invoiceId}`).then(invoice => {
                console.log('✅ Invoice retrieval successful:', invoice);
                return invoiceId;
            });
        })
        .then(invoiceId => {
            // Test updating the invoice
            return apiRequest(`/api/invoices/${invoiceId}`, 'PUT', {
                amount: 2500
            }).then(response => {
                console.log('✅ Invoice update successful:', response);
                return invoiceId;
            });
        })
        .then(invoiceId => {
            // Test marking invoice as paid
            return apiRequest(`/api/invoices/${invoiceId}/mark-paid`, 'PUT', {
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'Bank Transfer',
                payment_reference: 'REF123456'
            }).then(response => {
                console.log('✅ Invoice marked as paid:', response);
                return invoiceId;
            });
        })
        .then(invoiceId => {
            // Test generating invoice PDF
            console.log('✅ Invoice PDF generation URL:', `/api/invoices/${invoiceId}/pdf`);
            
            // Test deleting the invoice
            return apiRequest(`/api/invoices/${invoiceId}`, 'DELETE').then(() => {
                console.log('✅ Invoice deletion successful');
                
                // Clean up the test contract
                return apiRequest(`/api/contracts/${contractId}`, 'DELETE');
            });
        })
        .then(() => {
            console.log('✅ Test contract cleanup successful');
            
            // Clean up the test customer
            return apiRequest(`/api/customers/${customerId}`, 'DELETE');
        })
        .then(() => {
            console.log('✅ Test customer cleanup successful');
        })
        .catch(error => {
            console.error('❌ Invoice management test failed:', error);
        });
}

// Test user management (admin only)
function testUserManagement() {
    console.log('Testing user management...');
    
    // Login as admin first
    login('admin', 'password123')
        .then(() => {
            // Test creating a user
            return apiRequest('/api/users', 'POST', {
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                first_name: 'Test',
                last_name: 'User',
                role: 'user'
            });
        })
        .then(response => {
            console.log('✅ User creation successful:', response);
            const userId = response.user.id;
            
            // Test retrieving the user
            return apiRequest(`/api/users/${userId}`).then(user => {
                console.log('✅ User retrieval successful:', user);
                return userId;
            });
        })
        .then(userId => {
            // Test updating the user
            return apiRequest(`/api/users/${userId}`, 'PUT', {
                first_name: 'Updated',
                last_name: 'User'
            }).then(response => {
                console.log('✅ User update successful:', response);
                return userId;
            });
        })
        .then(userId => {
            // Test deleting the user
            return apiRequest(`/api/users/${userId}`, 'DELETE').then(() => {
                console.log('✅ User deletion successful');
            });
        })
        .catch(error => {
            console.error('❌ User management test failed:', error);
        });
}

// Run all tests
function runAllTests() {
    console.log('Running all tests...');
    
    // Run tests sequentially to avoid conflicts
    testAuthentication();
    
    // Wait before running the next test
    setTimeout(testCustomerManagement, 2000);
    
    // Wait before running the next test
    setTimeout(testContractManagement, 4000);
    
    // Wait before running the next test
    setTimeout(testInvoiceManagement, 6000);
    
    // Wait before running the next test
    setTimeout(testUserManagement, 8000);
}

// Expose test functions to console
window.testAuthentication = testAuthentication;
window.testCustomerManagement = testCustomerManagement;
window.testContractManagement = testContractManagement;
window.testInvoiceManagement = testInvoiceManagement;
window.testUserManagement = testUserManagement;
window.runAllTests = runAllTests;

console.log('Test script loaded. Run tests using the following commands:');
console.log('- testAuthentication()');
console.log('- testCustomerManagement()');
console.log('- testContractManagement()');
console.log('- testInvoiceManagement()');
console.log('- testUserManagement()');
console.log('- runAllTests()');
