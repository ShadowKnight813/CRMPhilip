// Customer modal functions
function showCustomerModal(customerId = null) {
    const isEdit = customerId !== null;
    const title = isEdit ? 'Edit Customer' : 'Add Customer';
    const modalContainer = document.getElementById('customer-modal-container');
    
    modalContainer.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form">
                        <div class="form-group">
                            <label for="customer-name" class="form-label">Company Name *</label>
                            <input type="text" id="customer-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-contact" class="form-label">Contact Person</label>
                            <input type="text" id="customer-contact" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="customer-email" class="form-label">Email</label>
                            <input type="email" id="customer-email" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="customer-phone" class="form-label">Phone</label>
                            <input type="text" id="customer-phone" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="customer-address" class="form-label">Address</label>
                            <input type="text" id="customer-address" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="customer-city" class="form-label">City</label>
                            <input type="text" id="customer-city" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="customer-country" class="form-label">Country</label>
                            <input type="text" id="customer-country" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="customer-notes" class="form-label">Notes</label>
                            <textarea id="customer-notes" class="form-control"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeCustomerModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="saveCustomer(${customerId})">Save</button>
                </div>
            </div>
        </div>
    `;
    
    // If editing, fetch customer data
    if (isEdit) {
        apiRequest(`/api/customers/${customerId}`)
            .then(customer => {
                document.getElementById('customer-name').value = customer.name || '';
                document.getElementById('customer-contact').value = customer.contact_person || '';
                document.getElementById('customer-email').value = customer.email || '';
                document.getElementById('customer-phone').value = customer.phone || '';
                document.getElementById('customer-address').value = customer.address || '';
                document.getElementById('customer-city').value = customer.city || '';
                document.getElementById('customer-country').value = customer.country || '';
                document.getElementById('customer-notes').value = customer.notes || '';
            })
            .catch(error => {
                alert(`Error loading customer: ${error.message}`);
                closeCustomerModal();
            });
    }
}

function closeCustomerModal() {
    const modalContainer = document.getElementById('customer-modal-container');
    modalContainer.innerHTML = '';
}

function saveCustomer(customerId = null) {
    const isEdit = customerId !== null;
    const endpoint = isEdit ? `/api/customers/${customerId}` : '/api/customers';
    const method = isEdit ? 'PUT' : 'POST';
    
    const customerData = {
        name: document.getElementById('customer-name').value,
        contact_person: document.getElementById('customer-contact').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        city: document.getElementById('customer-city').value,
        country: document.getElementById('customer-country').value,
        notes: document.getElementById('customer-notes').value
    };
    
    apiRequest(endpoint, method, customerData)
        .then(response => {
            closeCustomerModal();
            loadCustomers(); // Reload customer list
        })
        .catch(error => {
            alert(`Error saving customer: ${error.message}`);
        });
}

function viewCustomer(customerId) {
    apiRequest(`/api/customers/${customerId}`)
        .then(customer => {
            const modalContainer = document.getElementById('customer-modal-container');
            
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Customer Details</h3>
                            <button class="modal-close" onclick="closeCustomerModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <h4>${customer.name}</h4>
                                <p><strong>Contact:</strong> ${customer.contact_person || 'N/A'}</p>
                                <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> ${customer.address ? `${customer.address}, ${customer.city}, ${customer.country}` : 'N/A'}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Notes</h5>
                                <p>${customer.notes || 'No notes available'}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Contracts</h5>
                                <button class="btn btn-sm btn-primary" onclick="loadContractsForCustomer(${customer.id})">View Contracts</button>
                            </div>
                            
                            <div>
                                <h5>Invoices</h5>
                                <button class="btn btn-sm btn-primary" onclick="loadInvoicesForCustomer(${customer.id})">View Invoices</button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeCustomerModal()">Close</button>
                            <button class="btn btn-primary" onclick="editCustomer(${customer.id})">Edit</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            alert(`Error loading customer: ${error.message}`);
        });
}

function editCustomer(customerId) {
    showCustomerModal(customerId);
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        apiRequest(`/api/customers/${customerId}`, 'DELETE')
            .then(() => {
                loadCustomers(); // Reload customer list
            })
            .catch(error => {
                alert(`Error deleting customer: ${error.message}`);
            });
    }
}

// Contract modal functions
function showContractModal(contractId = null) {
    const isEdit = contractId !== null;
    const title = isEdit ? 'Edit Contract' : 'Add Contract';
    const modalContainer = document.getElementById('contract-modal-container');
    
    // First, fetch customers for dropdown
    apiRequest('/api/customers')
        .then(customers => {
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">${title}</h3>
                            <button class="modal-close" onclick="closeContractModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="contract-form">
                                <div class="form-group">
                                    <label for="contract-customer" class="form-label">Customer *</label>
                                    <select id="contract-customer" class="form-control" required>
                                        <option value="">Select Customer</option>
                                        ${customers.map(customer => `
                                            <option value="${customer.id}">${customer.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="contract-number" class="form-label">Contract Number *</label>
                                    <input type="text" id="contract-number" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="contract-title" class="form-label">Title *</label>
                                    <input type="text" id="contract-title" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="contract-description" class="form-label">Description</label>
                                    <textarea id="contract-description" class="form-control"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="contract-type" class="form-label">Contract Type</label>
                                    <input type="text" id="contract-type" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="contract-start-date" class="form-label">Start Date</label>
                                    <input type="date" id="contract-start-date" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="contract-end-date" class="form-label">End Date</label>
                                    <input type="date" id="contract-end-date" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="contract-delivery-date" class="form-label">Delivery Date</label>
                                    <input type="date" id="contract-delivery-date" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="contract-delivery-location" class="form-label">Delivery Location</label>
                                    <input type="text" id="contract-delivery-location" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="contract-price" class="form-label">Price</label>
                                    <input type="number" id="contract-price" class="form-control" step="0.01">
                                </div>
                                <div class="form-group">
                                    <label for="contract-status" class="form-label">Status</label>
                                    <select id="contract-status" class="form-control">
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeContractModal()">Cancel</button>
                            <button class="btn btn-primary" onclick="saveContract(${contractId})">Save</button>
                        </div>
                    </div>
                </div>
            `;
            
            // If editing, fetch contract data
            if (isEdit) {
                apiRequest(`/api/contracts/${contractId}`)
                    .then(contract => {
                        document.getElementById('contract-customer').value = contract.customer_id || '';
                        document.getElementById('contract-number').value = contract.contract_number || '';
                        document.getElementById('contract-title').value = contract.title || '';
                        document.getElementById('contract-description').value = contract.description || '';
                        document.getElementById('contract-type').value = contract.contract_type || '';
                        document.getElementById('contract-start-date').value = contract.start_date ? contract.start_date.split('T')[0] : '';
                        document.getElementById('contract-end-date').value = contract.end_date ? contract.end_date.split('T')[0] : '';
                        document.getElementById('contract-delivery-date').value = contract.delivery_date ? contract.delivery_date.split('T')[0] : '';
                        document.getElementById('contract-delivery-location').value = contract.delivery_location || '';
                        document.getElementById('contract-price').value = contract.price || '';
                        document.getElementById('contract-status').value = contract.status || 'draft';
                    })
                    .catch(error => {
                        alert(`Error loading contract: ${error.message}`);
                        closeContractModal();
                    });
            }
        })
        .catch(error => {
            alert(`Error loading customers: ${error.message}`);
        });
}

function closeContractModal() {
    const modalContainer = document.getElementById('contract-modal-container');
    modalContainer.innerHTML = '';
}

function saveContract(contractId = null) {
    const isEdit = contractId !== null;
    const endpoint = isEdit ? `/api/contracts/${contractId}` : '/api/contracts';
    const method = isEdit ? 'PUT' : 'POST';
    
    const contractData = {
        customer_id: parseInt(document.getElementById('contract-customer').value),
        contract_number: document.getElementById('contract-number').value,
        title: document.getElementById('contract-title').value,
        description: document.getElementById('contract-description').value,
        contract_type: document.getElementById('contract-type').value,
        start_date: document.getElementById('contract-start-date').value || null,
        end_date: document.getElementById('contract-end-date').value || null,
        delivery_date: document.getElementById('contract-delivery-date').value || null,
        delivery_location: document.getElementById('contract-delivery-location').value,
        price: parseFloat(document.getElementById('contract-price').value) || null,
        status: document.getElementById('contract-status').value
    };
    
    apiRequest(endpoint, method, contractData)
        .then(response => {
            closeContractModal();
            loadContracts(); // Reload contract list
        })
        .catch(error => {
            alert(`Error saving contract: ${error.message}`);
        });
}

function viewContract(contractId) {
    apiRequest(`/api/contracts/${contractId}`)
        .then(contract => {
            const modalContainer = document.getElementById('contract-modal-container');
            
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Contract Details</h3>
                            <button class="modal-close" onclick="closeContractModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <h4>${contract.title}</h4>
                                <p><strong>Contract #:</strong> ${contract.contract_number}</p>
                                <p><strong>Customer:</strong> ${contract.customer_name}</p>
                                <p><strong>Status:</strong> ${contract.status}</p>
                                <p><strong>Price:</strong> $${contract.price ? contract.price.toFixed(2) : '0.00'}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Description</h5>
                                <p>${contract.description || 'No description available'}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Dates</h5>
                                <p><strong>Start Date:</strong> ${formatDate(contract.start_date)}</p>
                                <p><strong>End Date:</strong> ${formatDate(contract.end_date)}</p>
                                <p><strong>Delivery Date:</strong> ${formatDate(contract.delivery_date)}</p>
                                <p><strong>Delivery Location:</strong> ${contract.delivery_location || 'N/A'}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Attachments</h5>
                                <div id="contract-attachments">
                                    ${contract.attachments && contract.attachments.length > 0 ? 
                                        `<ul>
                                            ${contract.attachments.map(attachment => `
                                                <li>
                                                    <a href="${attachment.file_url}" target="_blank">${attachment.filename}</a>
                                                    <button class="btn btn-sm btn-danger" onclick="deleteAttachment(${contract.id}, ${attachment.id})">Delete</button>
                                                </li>
                                            `).join('')}
                                        </ul>` : 
                                        '<p>No attachments</p>'
                                    }
                                </div>
                                <form id="attachment-form" enctype="multipart/form-data">
                                    <div class="form-group">
                                        <label for="attachment-file" class="form-label">Upload Attachment</label>
                                        <input type="file" id="attachment-file" class="form-control">
                                    </div>
                                    <button type="button" class="btn btn-sm btn-primary" onclick="uploadAttachment(${contract.id})">Upload</button>
                                </form>
                            </div>
                            
                            <div>
                                <h5>Invoices</h5>
                                <button class="btn btn-sm btn-primary" onclick="loadInvoicesForContract(${contract.id})">View Invoices</button>
                                <button class="btn btn-sm btn-success" onclick="createInvoiceForContract(${contract.id})">Create Invoice</button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeContractModal()">Close</button>
                            <button class="btn btn-primary" onclick="editContract(${contract.id})">Edit</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            alert(`Error loading contract: ${error.message}`);
        });
}

function editContract(contractId) {
    showContractModal(contractId);
}

function deleteContract(contractId) {
    if (confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
        apiRequest(`/api/contracts/${contractId}`, 'DELETE')
            .then(() => {
                loadContracts(); // Reload contract list
            })
            .catch(error => {
                alert(`Error deleting contract: ${error.message}`);
            });
    }
}

function uploadAttachment(contractId) {
    const fileInput = document.getElementById('attachment-file');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file to upload');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    fetch(`/api/contracts/${contractId}/attachments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Upload failed');
            });
        }
        return response.json();
    })
    .then(() => {
        // Refresh contract view
        viewContract(contractId);
    })
    .catch(error => {
        alert(`Error uploading attachment: ${error.message}`);
    });
}

function deleteAttachment(contractId, attachmentId) {
    if (confirm('Are you sure you want to delete this attachment?')) {
        apiRequest(`/api/contracts/${contractId}/attachments/${attachmentId}`, 'DELETE')
            .then(() => {
                // Refresh contract view
                viewContract(contractId);
            })
            .catch(error => {
                alert(`Error deleting attachment: ${error.message}`);
            });
    }
}

// Invoice modal functions
function showInvoiceModal(invoiceId = null) {
    const isEdit = invoiceId !== null;
    const title = isEdit ? 'Edit Invoice' : 'Add Invoice';
    const modalContainer = document.getElementById('invoice-modal-container');
    
    // First, fetch customers and contracts for dropdowns
    Promise.all([
        apiRequest('/api/customers'),
        apiRequest('/api/contracts')
    ])
    .then(([customers, contracts]) => {
        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="closeInvoiceModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="invoice-form">
                            <div class="form-group">
                                <label for="invoice-customer" class="form-label">Customer *</label>
                                <select id="invoice-customer" class="form-control" required onchange="updateContractDropdown()">
                                    <option value="">Select Customer</option>
                                    ${customers.map(customer => `
                                        <option value="${customer.id}">${customer.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="invoice-contract" class="form-label">Contract *</label>
                                <select id="invoice-contract" class="form-control" required>
                                    <option value="">Select Contract</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="invoice-number" class="form-label">Invoice Number *</label>
                                <input type="text" id="invoice-number" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="invoice-issue-date" class="form-label">Issue Date *</label>
                                <input type="date" id="invoice-issue-date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="invoice-due-date" class="form-label">Due Date *</label>
                                <input type="date" id="invoice-due-date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="invoice-amount" class="form-label">Amount *</label>
                                <input type="number" id="invoice-amount" class="form-control" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="invoice-loaded-weight" class="form-label">Loaded Weight</label>
                                <input type="number" id="invoice-loaded-weight" class="form-control" step="0.01">
                            </div>
                            <div class="form-group">
                                <label for="invoice-weight-unit" class="form-label">Weight Unit</label>
                                <select id="invoice-weight-unit" class="form-control">
                                    <option value="tons">Tons</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="lb">Pounds</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="invoice-notes" class="form-label">Notes</label>
                                <textarea id="invoice-notes" class="form-control"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Payment Status</label>
                                <div>
                                    <input type="checkbox" id="invoice-is-paid">
                                    <label for="invoice-is-paid">Paid</label>
                                </div>
                            </div>
                            <div id="payment-details" style="display: none;">
                                <div class="form-group">
                                    <label for="invoice-payment-date" class="form-label">Payment Date</label>
                                    <input type="date" id="invoice-payment-date" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="invoice-payment-method" class="form-label">Payment Method</label>
                                    <input type="text" id="invoice-payment-method" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="invoice-payment-reference" class="form-label">Payment Reference</label>
                                    <input type="text" id="invoice-payment-reference" class="form-control">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeInvoiceModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="saveInvoice(${invoiceId})">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        // Store contracts in a global variable for filtering
        window.allContracts = contracts;
        
        // Set up payment status toggle
        const isPaidCheckbox = document.getElementById('invoice-is-paid');
        const paymentDetails = document.getElementById('payment-details');
        
        isPaidCheckbox.addEventListener('change', function() {
            paymentDetails.style.display = this.checked ? 'block' : 'none';
        });
        
        // If editing, fetch invoice data
        if (isEdit) {
            apiRequest(`/api/invoices/${invoiceId}`)
                .then(invoice => {
                    document.getElementById('invoice-customer').value = invoice.customer_id || '';
                    updateContractDropdown(invoice.contract_id);
                    document.getElementById('invoice-number').value = invoice.invoice_number || '';
                    document.getElementById('invoice-issue-date').value = invoice.issue_date ? invoice.issue_date.split('T')[0] : '';
                    document.getElementById('invoice-due-date').value = invoice.due_date ? invoice.due_date.split('T')[0] : '';
                    document.getElementById('invoice-amount').value = invoice.amount || '';
                    document.getElementById('invoice-loaded-weight').value = invoice.loaded_weight || '';
                    document.getElementById('invoice-weight-unit').value = invoice.weight_unit || 'tons';
                    document.getElementById('invoice-notes').value = invoice.notes || '';
                    document.getElementById('invoice-is-paid').checked = invoice.is_paid;
                    
                    if (invoice.is_paid) {
                        paymentDetails.style.display = 'block';
                        document.getElementById('invoice-payment-date').value = invoice.payment_date ? invoice.payment_date.split('T')[0] : '';
                        document.getElementById('invoice-payment-method').value = invoice.payment_method || '';
                        document.getElementById('invoice-payment-reference').value = invoice.payment_reference || '';
                    }
                })
                .catch(error => {
                    alert(`Error loading invoice: ${error.message}`);
                    closeInvoiceModal();
                });
        } else {
            // Set default dates for new invoice
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('invoice-issue-date').value = today;
            
            // Set due date to 30 days from today
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            document.getElementById('invoice-due-date').value = dueDate.toISOString().split('T')[0];
        }
    })
    .catch(error => {
        alert(`Error loading data: ${error.message}`);
    });
}

function updateContractDropdown(selectedContractId = null) {
    const customerSelect = document.getElementById('invoice-customer');
    const contractSelect = document.getElementById('invoice-contract');
    const customerId = parseInt(customerSelect.value);
    
    // Clear current options
    contractSelect.innerHTML = '<option value="">Select Contract</option>';
    
    if (customerId && window.allContracts) {
        // Filter contracts by customer
        const customerContracts = window.allContracts.filter(contract => contract.customer_id === customerId);
        
        // Add options
        customerContracts.forEach(contract => {
            const option = document.createElement('option');
            option.value = contract.id;
            option.textContent = `${contract.contract_number} - ${contract.title}`;
            contractSelect.appendChild(option);
        });
        
        // Select contract if provided
        if (selectedContractId) {
            contractSelect.value = selectedContractId;
        }
    }
}

function closeInvoiceModal() {
    const modalContainer = document.getElementById('invoice-modal-container');
    modalContainer.innerHTML = '';
}

function saveInvoice(invoiceId = null) {
    const isEdit = invoiceId !== null;
    const endpoint = isEdit ? `/api/invoices/${invoiceId}` : '/api/invoices';
    const method = isEdit ? 'PUT' : 'POST';
    
    const isPaid = document.getElementById('invoice-is-paid').checked;
    
    const invoiceData = {
        customer_id: parseInt(document.getElementById('invoice-customer').value),
        contract_id: parseInt(document.getElementById('invoice-contract').value),
        invoice_number: document.getElementById('invoice-number').value,
        issue_date: document.getElementById('invoice-issue-date').value,
        due_date: document.getElementById('invoice-due-date').value,
        amount: parseFloat(document.getElementById('invoice-amount').value),
        loaded_weight: parseFloat(document.getElementById('invoice-loaded-weight').value) || null,
        weight_unit: document.getElementById('invoice-weight-unit').value,
        is_paid: isPaid,
        notes: document.getElementById('invoice-notes').value
    };
    
    if (isPaid) {
        invoiceData.payment_date = document.getElementById('invoice-payment-date').value || null;
        invoiceData.payment_method = document.getElementById('invoice-payment-method').value || '';
        invoiceData.payment_reference = document.getElementById('invoice-payment-reference').value || '';
    }
    
    apiRequest(endpoint, method, invoiceData)
        .then(response => {
            closeInvoiceModal();
            loadInvoices(); // Reload invoice list
        })
        .catch(error => {
            alert(`Error saving invoice: ${error.message}`);
        });
}

function viewInvoice(invoiceId) {
    apiRequest(`/api/invoices/${invoiceId}`)
        .then(invoice => {
            const modalContainer = document.getElementById('invoice-modal-container');
            
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Invoice Details</h3>
                            <button class="modal-close" onclick="closeInvoiceModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <h4>Invoice #${invoice.invoice_number}</h4>
                                <p><strong>Customer:</strong> ${invoice.customer_name}</p>
                                <p><strong>Contract:</strong> ${invoice.contract_number}</p>
                                <p><strong>Issue Date:</strong> ${formatDate(invoice.issue_date)}</p>
                                <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
                                <p><strong>Amount:</strong> $${invoice.amount.toFixed(2)}</p>
                                <p><strong>Status:</strong> ${invoice.is_paid ? 
                                    '<span class="text-success">Paid</span>' : 
                                    (isOverdue(invoice) ? 
                                        '<span class="text-danger">Overdue</span>' : 
                                        '<span class="text-warning">Unpaid</span>')}</p>
                            </div>
                            
                            ${invoice.loaded_weight ? `
                                <div class="mb-3">
                                    <h5>Loaded Weight</h5>
                                    <p>${invoice.loaded_weight} ${invoice.weight_unit}</p>
                                </div>
                            ` : ''}
                            
                            ${invoice.notes ? `
                                <div class="mb-3">
                                    <h5>Notes</h5>
                                    <p>${invoice.notes}</p>
                                </div>
                            ` : ''}
                            
                            ${invoice.is_paid ? `
                                <div class="mb-3">
                                    <h5>Payment Details</h5>
                                    <p><strong>Payment Date:</strong> ${formatDate(invoice.payment_date)}</p>
                                    <p><strong>Payment Method:</strong> ${invoice.payment_method || 'N/A'}</p>
                                    <p><strong>Reference:</strong> ${invoice.payment_reference || 'N/A'}</p>
                                </div>
                            ` : ''}
                            
                            <div class="mb-3">
                                <button class="btn btn-info" onclick="generateInvoicePDF(${invoice.id})">Download PDF</button>
                                ${!invoice.is_paid ? `
                                    <button class="btn btn-success" onclick="markInvoicePaid(${invoice.id})">Mark as Paid</button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeInvoiceModal()">Close</button>
                            <button class="btn btn-primary" onclick="editInvoice(${invoice.id})">Edit</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            alert(`Error loading invoice: ${error.message}`);
        });
}

function editInvoice(invoiceId) {
    showInvoiceModal(invoiceId);
}

function markInvoicePaid(invoiceId) {
    const modalContainer = document.getElementById('invoice-modal-container');
    
    modalContainer.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Mark Invoice as Paid</h3>
                    <button class="modal-close" onclick="closeInvoiceModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="payment-form">
                        <div class="form-group">
                            <label for="payment-date" class="form-label">Payment Date</label>
                            <input type="date" id="payment-date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="payment-method" class="form-label">Payment Method</label>
                            <input type="text" id="payment-method" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="payment-reference" class="form-label">Payment Reference</label>
                            <input type="text" id="payment-reference" class="form-control">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeInvoiceModal()">Cancel</button>
                    <button class="btn btn-success" onclick="submitPayment(${invoiceId})">Mark as Paid</button>
                </div>
            </div>
        </div>
    `;
}

function submitPayment(invoiceId) {
    const paymentData = {
        payment_date: document.getElementById('payment-date').value,
        payment_method: document.getElementById('payment-method').value,
        payment_reference: document.getElementById('payment-reference').value
    };
    
    apiRequest(`/api/invoices/${invoiceId}/mark-paid`, 'PUT', paymentData)
        .then(response => {
            closeInvoiceModal();
            loadInvoices(); // Reload invoice list
        })
        .catch(error => {
            alert(`Error marking invoice as paid: ${error.message}`);
        });
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
        apiRequest(`/api/invoices/${invoiceId}`, 'DELETE')
            .then(() => {
                loadInvoices(); // Reload invoice list
            })
            .catch(error => {
                alert(`Error deleting invoice: ${error.message}`);
            });
    }
}

// User modal functions
function showUserModal(userId = null) {
    const isEdit = userId !== null;
    const title = isEdit ? 'Edit User' : 'Add User';
    const modalContainer = document.getElementById('user-modal-container');
    
    modalContainer.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeUserModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="user-form">
                        <div class="form-group">
                            <label for="user-username" class="form-label">Username *</label>
                            <input type="text" id="user-username" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="user-email" class="form-label">Email *</label>
                            <input type="email" id="user-email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="user-first-name" class="form-label">First Name *</label>
                            <input type="text" id="user-first-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="user-last-name" class="form-label">Last Name *</label>
                            <input type="text" id="user-last-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="user-password" class="form-label">${isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                            <input type="password" id="user-password" class="form-control" ${isEdit ? '' : 'required'}>
                        </div>
                        <div class="form-group">
                            <label for="user-role" class="form-label">Role *</label>
                            <select id="user-role" class="form-control" required>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeUserModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="saveUser(${userId})">Save</button>
                </div>
            </div>
        </div>
    `;
    
    // If editing, fetch user data
    if (isEdit) {
        apiRequest(`/api/users/${userId}`)
            .then(user => {
                document.getElementById('user-username').value = user.username || '';
                document.getElementById('user-email').value = user.email || '';
                document.getElementById('user-first-name').value = user.first_name || '';
                document.getElementById('user-last-name').value = user.last_name || '';
                document.getElementById('user-role').value = user.role || 'user';
            })
            .catch(error => {
                alert(`Error loading user: ${error.message}`);
                closeUserModal();
            });
    }
}

function closeUserModal() {
    const modalContainer = document.getElementById('user-modal-container');
    modalContainer.innerHTML = '';
}

function saveUser(userId = null) {
    const isEdit = userId !== null;
    const endpoint = isEdit ? `/api/users/${userId}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';
    
    const userData = {
        username: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value,
        first_name: document.getElementById('user-first-name').value,
        last_name: document.getElementById('user-last-name').value,
        role: document.getElementById('user-role').value
    };
    
    const password = document.getElementById('user-password').value;
    if (password) {
        userData.password = password;
    }
    
    apiRequest(endpoint, method, userData)
        .then(response => {
            closeUserModal();
            loadUsers(); // Reload user list
        })
        .catch(error => {
            alert(`Error saving user: ${error.message}`);
        });
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        apiRequest(`/api/users/${userId}`, 'DELETE')
            .then(() => {
                loadUsers(); // Reload user list
            })
            .catch(error => {
                alert(`Error deleting user: ${error.message}`);
            });
    }
}

// Additional helper functions
function loadContractsForCustomer(customerId) {
    apiRequest('/api/contracts')
        .then(contracts => {
            const customerContracts = contracts.filter(contract => contract.customer_id === customerId);
            
            const modalContainer = document.getElementById('customer-modal-container');
            
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Customer Contracts</h3>
                            <button class="modal-close" onclick="closeCustomerModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Contract #</th>
                                            <th>Title</th>
                                            <th>Delivery Date</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${customerContracts.length > 0 ? 
                                            customerContracts.map(contract => `
                                                <tr>
                                                    <td>${contract.contract_number}</td>
                                                    <td>${contract.title}</td>
                                                    <td>${formatDate(contract.delivery_date)}</td>
                                                    <td>$${contract.price ? contract.price.toFixed(2) : '0.00'}</td>
                                                    <td>${formatContractStatus(contract.status)}</td>
                                                    <td class="actions">
                                                        <button class="btn btn-sm btn-secondary" onclick="viewContract(${contract.id})">View</button>
                                                    </td>
                                                </tr>
                                            `).join('') : 
                                            '<tr><td colspan="6" class="text-center">No contracts found</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeCustomerModal()">Close</button>
                            <button class="btn btn-primary" onclick="showContractModal()">Add Contract</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            alert(`Error loading contracts: ${error.message}`);
        });
}

function loadInvoicesForCustomer(customerId) {
    apiRequest('/api/invoices')
        .then(invoices => {
            const customerInvoices = invoices.filter(invoice => invoice.customer_id === customerId);
            
            const modalContainer = document.getElementById('customer-modal-container');
            
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Customer Invoices</h3>
                            <button class="modal-close" onclick="closeCustomerModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Contract #</th>
                                            <th>Issue Date</th>
                                            <th>Due Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${customerInvoices.length > 0 ? 
                                            customerInvoices.map(invoice => `
                                                <tr>
                                                    <td>${invoice.invoice_number}</td>
                                                    <td>${invoice.contract_number}</td>
                                                    <td>${formatDate(invoice.issue_date)}</td>
                                                    <td>${formatDate(invoice.due_date)}</td>
                                                    <td>$${invoice.amount.toFixed(2)}</td>
                                                    <td>${invoice.is_paid ? 
                                                        '<span class="text-success">Paid</span>' : 
                                                        (isOverdue(invoice) ? 
                                                            '<span class="text-danger">Overdue</span>' : 
                                                            '<span class="text-warning">Unpaid</span>')}</td>
                                                    <td class="actions">
                                                        <button class="btn btn-sm btn-secondary" onclick="viewInvoice(${invoice.id})">View</button>
                                                    </td>
                                                </tr>
                                            `).join('') : 
                                            '<tr><td colspan="7" class="text-center">No invoices found</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeCustomerModal()">Close</button>
                            <button class="btn btn-primary" onclick="showInvoiceModal()">Add Invoice</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            alert(`Error loading invoices: ${error.message}`);
        });
}

function loadInvoicesForContract(contractId) {
    apiRequest('/api/invoices')
        .then(invoices => {
            const contractInvoices = invoices.filter(invoice => invoice.contract_id === contractId);
            
            const modalContainer = document.getElementById('contract-modal-container');
            
            modalContainer.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="modal-title">Contract Invoices</h3>
                            <button class="modal-close" onclick="closeContractModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Issue Date</th>
                                            <th>Due Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${contractInvoices.length > 0 ? 
                                            contractInvoices.map(invoice => `
                                                <tr>
                                                    <td>${invoice.invoice_number}</td>
                                                    <td>${formatDate(invoice.issue_date)}</td>
                                                    <td>${formatDate(invoice.due_date)}</td>
                                                    <td>$${invoice.amount.toFixed(2)}</td>
                                                    <td>${invoice.is_paid ? 
                                                        '<span class="text-success">Paid</span>' : 
                                                        (isOverdue(invoice) ? 
                                                            '<span class="text-danger">Overdue</span>' : 
                                                            '<span class="text-warning">Unpaid</span>')}</td>
                                                    <td class="actions">
                                                        <button class="btn btn-sm btn-secondary" onclick="viewInvoice(${invoice.id})">View</button>
                                                    </td>
                                                </tr>
                                            `).join('') : 
                                            '<tr><td colspan="6" class="text-center">No invoices found</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeContractModal()">Close</button>
                            <button class="btn btn-primary" onclick="createInvoiceForContract(${contractId})">Add Invoice</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            alert(`Error loading invoices: ${error.message}`);
        });
}

function createInvoiceForContract(contractId) {
    // Fetch contract details first
    apiRequest(`/api/contracts/${contractId}`)
        .then(contract => {
            showInvoiceModal();
            
            // Wait for modal to be created
            setTimeout(() => {
                document.getElementById('invoice-customer').value = contract.customer_id;
                updateContractDropdown(contractId);
            }, 500);
        })
        .catch(error => {
            alert(`Error loading contract: ${error.message}`);
        });
}
