// Northstar CRM - Main JavaScript File

// Global variables
let currentUser = null;
let authToken = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for token in localStorage
    authToken = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('currentUser');
    
    if (authToken && userJson) {
        try {
            currentUser = JSON.parse(userJson);
            setupAuthenticatedUI();
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    } else {
        setupLoginUI();
    }
});

// Authentication Functions
function login(username, password) {
    return fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        authToken = data.token;
        currentUser = data.user;
        
        // Store in localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        setupAuthenticatedUI();
        return currentUser;
    });
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setupLoginUI();
}

// UI Setup Functions
function setupLoginUI() {
    // Hide main app content
    const appContent = document.getElementById('app-content');
    if (appContent) appContent.style.display = 'none';
    
    // Show login form
    let loginForm = document.getElementById('login-container');
    if (!loginForm) {
        loginForm = createLoginForm();
        document.body.appendChild(loginForm);
    } else {
        loginForm.style.display = 'flex';
    }
}

function setupAuthenticatedUI() {
    // Hide login form
    const loginForm = document.getElementById('login-container');
    if (loginForm) loginForm.style.display = 'none';
    
    // Show main app content
    let appContent = document.getElementById('app-content');
    if (!appContent) {
        appContent = createAppContent();
        document.body.appendChild(appContent);
    } else {
        appContent.style.display = 'block';
    }
    
    // Update user info in header
    updateUserInfo();
    
    // Load dashboard by default
    loadDashboard();
}

function createLoginForm() {
    const container = document.createElement('div');
    container.id = 'login-container';
    container.className = 'login-container';
    
    container.innerHTML = `
        <div class="login-card">
            <div class="login-logo">
                <img src="/static/img/northstar-logo.png" alt="Northstar Brokerage" onerror="this.src='/static/img/logo-placeholder.png'">
            </div>
            <h2 class="login-title">Northstar CRM</h2>
            <div id="login-error" class="alert alert-danger" style="display: none;"></div>
            <form id="login-form">
                <div class="form-group">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" id="username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
            </form>
        </div>
    `;
    
    // Add event listener for form submission
    setTimeout(() => {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            login(username, password).catch(error => {
                const errorElement = document.getElementById('login-error');
                errorElement.textContent = 'Invalid username or password';
                errorElement.style.display = 'block';
            });
        });
    }, 0);
    
    return container;
}

function createAppContent() {
    const container = document.createElement('div');
    container.id = 'app-content';
    
    container.innerHTML = `
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <div class="logo">
                        <img src="/static/img/northstar-logo.png" alt="Northstar Brokerage" onerror="this.src='/static/img/logo-placeholder.png'">
                        <span class="logo-text">Northstar CRM</span>
                    </div>
                    
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <ul class="nav-menu" id="nav-menu">
                        <li class="nav-item"><a href="#" class="nav-link active" data-page="dashboard">Dashboard</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" data-page="customers">Customers</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" data-page="contracts">Contracts</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" data-page="invoices">Invoices</a></li>
                        <li class="nav-item" id="admin-nav-item" style="display: none;"><a href="#" class="nav-link" data-page="users">Users</a></li>
                    </ul>
                    
                    <div class="user-info">
                        <span class="user-name" id="user-name"></span>
                        <button class="logout-btn" id="logout-btn">Logout</button>
                    </div>
                </div>
            </div>
        </header>
        
        <main class="main-content">
            <div class="container">
                <div id="page-content"></div>
            </div>
        </main>
    `;
    
    // Add event listeners after the element is added to the DOM
    setTimeout(() => {
        // Navigation menu
        const navLinks = container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Load page content
                const page = this.getAttribute('data-page');
                loadPage(page);
            });
        });
        
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                logout();
            });
        }
    }, 0);
    
    return container;
}

function updateUserInfo() {
    if (!currentUser) return;
    
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = currentUser.first_name ? 
            `${currentUser.first_name} ${currentUser.last_name || ''}` : 
            currentUser.username;
    }
    
    // Show admin menu items if user is admin
    const adminNavItem = document.getElementById('admin-nav-item');
    if (adminNavItem) {
        adminNavItem.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
}

// Page Loading Functions
function loadPage(page) {
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'contracts':
            loadContracts();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'users':
            loadUsers();
            break;
        default:
            loadDashboard();
    }
}

// API Helper Functions
function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    return fetch(endpoint, options)
        .then(response => {
            if (response.status === 401) {
                // Unauthorized - token expired or invalid
                logout();
                throw new Error('Session expired. Please login again.');
            }
            
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'API request failed');
                });
            }
            
            if (response.status === 204) {
                return null; // No content
            }
            
            return response.json();
        });
}

// Dashboard Functions
function loadDashboard() {
    const pageContent = document.getElementById('page-content');
    
    // Show loading state
    pageContent.innerHTML = '<div class="text-center"><p>Loading dashboard...</p></div>';
    
    // Fetch data for dashboard
    Promise.all([
        apiRequest('/api/customers'),
        apiRequest('/api/contracts'),
        apiRequest('/api/invoices'),
        apiRequest('/api/invoices/overdue')
    ])
    .then(([customers, contracts, invoices, overdueInvoices]) => {
        // Calculate statistics
        const totalCustomers = customers.length;
        const totalContracts = contracts.length;
        const totalInvoices = invoices.length;
        const totalOverdue = overdueInvoices.length;
        
        const paidInvoices = invoices.filter(inv => inv.is_paid);
        const unpaidInvoices = invoices.filter(inv => !inv.is_paid);
        const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        
        // Render dashboard
        pageContent.innerHTML = `
            <h1 class="mb-4">Dashboard</h1>
            
            <div class="dashboard">
                <div class="dashboard-card">
                    <h3>Customers</h3>
                    <div class="stat-number">${totalCustomers}</div>
                    <div class="stat-label">Total Customers</div>
                </div>
                
                <div class="dashboard-card">
                    <h3>Contracts</h3>
                    <div class="stat-number">${totalContracts}</div>
                    <div class="stat-label">Active Contracts</div>
                </div>
                
                <div class="dashboard-card">
                    <h3>Invoices</h3>
                    <div class="stat-number">${totalInvoices}</div>
                    <div class="stat-label">Total Invoices</div>
                </div>
                
                <div class="dashboard-card">
                    <h3>Overdue</h3>
                    <div class="stat-number text-danger">${totalOverdue}</div>
                    <div class="stat-label">Overdue Invoices</div>
                </div>
            </div>
            
            <div class="row">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Recent Invoices</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${invoices.slice(0, 5).map(invoice => `
                                        <tr>
                                            <td>${invoice.invoice_number}</td>
                                            <td>${invoice.customer_name}</td>
                                            <td>$${invoice.amount.toFixed(2)}</td>
                                            <td>${formatDate(invoice.due_date)}</td>
                                            <td>${invoice.is_paid ? 
                                                '<span class="text-success">Paid</span>' : 
                                                '<span class="text-danger">Unpaid</span>'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm" onclick="loadPage('invoices')">View All Invoices</button>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(error => {
        pageContent.innerHTML = `
            <div class="alert alert-danger">
                Error loading dashboard: ${error.message}
            </div>
        `;
    });
}

// Customer Functions
function loadCustomers() {
    const pageContent = document.getElementById('page-content');
    
    // Show loading state
    pageContent.innerHTML = '<div class="text-center"><p>Loading customers...</p></div>';
    
    // Fetch customers
    apiRequest('/api/customers')
        .then(customers => {
            pageContent.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Customers</h1>
                    <button class="btn btn-primary" onclick="showCustomerModal()">Add Customer</button>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact Person</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Contracts</th>
                                        <th>Open Invoices</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${customers.map(customer => `
                                        <tr>
                                            <td>${customer.name}</td>
                                            <td>${customer.contact_person || '-'}</td>
                                            <td>${customer.email || '-'}</td>
                                            <td>${customer.phone || '-'}</td>
                                            <td>${customer.contract_count || 0}</td>
                                            <td>${customer.open_invoices || 0}</td>
                                            <td class="actions">
                                                <button class="btn btn-sm btn-secondary" onclick="viewCustomer(${customer.id})">View</button>
                                                <button class="btn btn-sm btn-primary" onclick="editCustomer(${customer.id})">Edit</button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="customer-modal-container"></div>
            `;
        })
        .catch(error => {
            pageContent.innerHTML = `
                <div class="alert alert-danger">
                    Error loading customers: ${error.message}
                </div>
            `;
        });
}

// Contract Functions
function loadContracts() {
    const pageContent = document.getElementById('page-content');
    
    // Show loading state
    pageContent.innerHTML = '<div class="text-center"><p>Loading contracts...</p></div>';
    
    // Fetch contracts
    apiRequest('/api/contracts')
        .then(contracts => {
            pageContent.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Contracts</h1>
                    <button class="btn btn-primary" onclick="showContractModal()">Add Contract</button>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Contract #</th>
                                        <th>Customer</th>
                                        <th>Title</th>
                                        <th>Delivery Date</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${contracts.map(contract => `
                                        <tr>
                                            <td>${contract.contract_number}</td>
                                            <td>${contract.customer_name}</td>
                                            <td>${contract.title}</td>
                                            <td>${formatDate(contract.delivery_date)}</td>
                                            <td>$${contract.price ? contract.price.toFixed(2) : '0.00'}</td>
                                            <td>${formatContractStatus(contract.status)}</td>
                                            <td class="actions">
                                                <button class="btn btn-sm btn-secondary" onclick="viewContract(${contract.id})">View</button>
                                                <button class="btn btn-sm btn-primary" onclick="editContract(${contract.id})">Edit</button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteContract(${contract.id})">Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="contract-modal-container"></div>
            `;
        })
        .catch(error => {
            pageContent.innerHTML = `
                <div class="alert alert-danger">
                    Error loading contracts: ${error.message}
                </div>
            `;
        });
}

// Invoice Functions
function loadInvoices() {
    const pageContent = document.getElementById('page-content');
    
    // Show loading state
    pageContent.innerHTML = '<div class="text-center"><p>Loading invoices...</p></div>';
    
    // Fetch invoices
    apiRequest('/api/invoices')
        .then(invoices => {
            pageContent.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Invoices</h1>
                    <button class="btn btn-primary" onclick="showInvoiceModal()">Add Invoice</button>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="card-title">Invoice Management</h3>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-3">
                            <div>
                                <button class="btn btn-secondary" onclick="filterInvoices('all')">All</button>
                                <button class="btn btn-danger" onclick="filterInvoices('unpaid')">Unpaid</button>
                                <button class="btn btn-success" onclick="filterInvoices('paid')">Paid</button>
                                <button class="btn btn-warning" onclick="filterInvoices('overdue')">Overdue</button>
                            </div>
                            <button class="btn btn-primary" onclick="sendPaymentReminders()">Send Payment Reminders</button>
                        </div>
                        
                        <div class="table-container">
                            <table class="table" id="invoices-table">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Customer</th>
                                        <th>Contract #</th>
                                        <th>Issue Date</th>
                                        <th>Due Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${invoices.map(invoice => `
                                        <tr data-status="${invoice.is_paid ? 'paid' : 'unpaid'}" data-overdue="${isOverdue(invoice)}">
                                            <td>${invoice.invoice_number}</td>
                                            <td>${invoice.customer_name}</td>
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
                                                <button class="btn btn-sm btn-primary" onclick="editInvoice(${invoice.id})">Edit</button>
                                                ${!invoice.is_paid ? 
                                                    `<button class="btn btn-sm btn-success" onclick="markInvoicePaid(${invoice.id})">Mark Paid</button>` : ''}
                                                <button class="btn btn-sm btn-info" onclick="generateInvoicePDF(${invoice.id})">PDF</button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteInvoice(${invoice.id})">Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="invoice-modal-container"></div>
            `;
        })
        .catch(error => {
            pageContent.innerHTML = `
                <div class="alert alert-danger">
                    Error loading invoices: ${error.message}
                </div>
            `;
        });
}

// User Management Functions (Admin only)
function loadUsers() {
    const pageContent = document.getElementById('page-content');
    
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        pageContent.innerHTML = `
            <div class="alert alert-danger">
                Access denied. Admin privileges required.
            </div>
        `;
        return;
    }
    
    // Show loading state
    pageContent.innerHTML = '<div class="text-center"><p>Loading users...</p></div>';
    
    // Fetch users
    apiRequest('/api/users')
        .then(users => {
            pageContent.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>User Management</h1>
                    <button class="btn btn-primary" onclick="showUserModal()">Add User</button>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Last Login</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(user => `
                                        <tr>
                                            <td>${user.username}</td>
                                            <td>${user.first_name} ${user.last_name}</td>
                                            <td>${user.email}</td>
                                            <td>${user.role === 'admin' ? 'Admin' : 'User'}</td>
                                            <td>${formatDate(user.last_login)}</td>
                                            <td class="actions">
                                                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                                                ${user.id !== currentUser.id ? 
                                                    `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>` : ''}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div id="user-modal-container"></div>
            `;
        })
        .catch(error => {
            pageContent.innerHTML = `
                <div class="alert alert-danger">
                    Error loading users: ${error.message}
                </div>
            `;
        });
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatContractStatus(status) {
    switch (status) {
        case 'draft':
            return '<span class="text-secondary">Draft</span>';
        case 'active':
            return '<span class="text-primary">Active</span>';
        case 'completed':
            return '<span class="text-success">Completed</span>';
        case 'cancelled':
            return '<span class="text-danger">Cancelled</span>';
        default:
            return status;
    }
}

function isOverdue(invoice) {
    if (invoice.is_paid) return false;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return dueDate < today;
}

function filterInvoices(filter) {
    const table = document.getElementById('invoices-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const isPaid = row.getAttribute('data-status') === 'paid';
        const isOverdueInvoice = row.getAttribute('data-overdue') === 'true';
        
        switch (filter) {
            case 'all':
                row.style.display = '';
                break;
            case 'paid':
                row.style.display = isPaid ? '' : 'none';
                break;
            case 'unpaid':
                row.style.display = !isPaid ? '' : 'none';
                break;
            case 'overdue':
                row.style.display = isOverdueInvoice ? '' : 'none';
                break;
        }
    });
}

function sendPaymentReminders() {
    apiRequest('/api/invoices/send-reminders', 'POST')
        .then(response => {
            alert(`Payment reminders sent for ${response.reminder_count} overdue invoices.`);
        })
        .catch(error => {
            alert(`Error sending payment reminders: ${error.message}`);
        });
}

function generateInvoicePDF(invoiceId) {
    // Open PDF in new tab
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
}

// Initialize Font Awesome (if available)
function loadFontAwesome() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
}

// Call this function to load Font Awesome
loadFontAwesome();

// Include the modals.js script in the main HTML file
document.addEventListener('DOMContentLoaded', function() {
    // Create a script element for modals.js
    const modalsScript = document.createElement('script');
    modalsScript.src = '/static/js/modals.js';
    document.body.appendChild(modalsScript);
});

// Include the contract_pdf.js script in the main HTML file
document.addEventListener('DOMContentLoaded', function() {
    // Create a script element for contract_pdf.js
    const contractPdfScript = document.createElement('script');
    contractPdfScript.src = '/static/js/contract_pdf.js';
    document.body.appendChild(contractPdfScript);
});

// Include the tests.js script in the main HTML file
document.addEventListener('DOMContentLoaded', function() {
    // Create a script element for tests.js
    const testsScript = document.createElement('script');
    testsScript.src = '/static/js/tests.js';
    document.body.appendChild(testsScript);
});
