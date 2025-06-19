// Add contract PDF generation functionality
function generateContractPDF(contractId) {
    // Open PDF in new tab
    window.open(`/api/contracts/${contractId}/pdf`, '_blank');
}

// Update the contract view function to include PDF generation button
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
                            
                            <div class="mb-3">
                                <h5>Actions</h5>
                                <button class="btn btn-info" onclick="generateContractPDF(${contract.id})">Generate PDF</button>
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
