const API_URL = '/api';
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAuctions('open');
    
    document.getElementById('loginBtn').addEventListener('click', showLogin);
    document.getElementById('registerBtn').addEventListener('click', showRegister);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('createAuctionBtn').addEventListener('click', showCreateAuction);
});

// Authentication
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (authToken && currentUser) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        document.getElementById('username').style.display = 'inline-block';
        document.getElementById('username').textContent = `Welcome, ${currentUser.username}`;
        document.getElementById('createAuctionBtn').style.display = 'inline-block';
    }
}

function showLogin() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function hideAuth() {
    document.getElementById('authSection').style.display = 'none';
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('Login successful!', 'success');
            hideAuth();
            checkAuth();
            loadAuctions('open');
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            setTimeout(() => showLogin(), 1500);
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('registerBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('username').style.display = 'none';
    document.getElementById('createAuctionBtn').style.display = 'none';
    showMessage('Logged out successfully', 'success');
    loadAuctions('open');
}

// Auctions
async function loadAuctions(status = 'open') {
    try {
        const response = await fetch(`${API_URL}/auctions?status=${status}`);
        const auctions = await response.json();
        
        const auctionsList = document.getElementById('auctionsList');
        
        if (auctions.length === 0) {
            auctionsList.innerHTML = '<p class="loading">No auctions found</p>';
            return;
        }
        
        auctionsList.innerHTML = auctions.map(auction => `
            <div class="auction-card" onclick="viewAuction(${auction.id})">
                <h3>${auction.title}</h3>
                <p>${auction.description.substring(0, 100)}${auction.description.length > 100 ? '...' : ''}</p>
                <div class="price">$${auction.current_price.toFixed(2)}</div>
                <p><strong>Seller:</strong> ${auction.seller_name}</p>
                <p><strong>Ends:</strong> ${new Date(auction.end_time).toLocaleString()}</p>
                <span class="status ${auction.status}">${auction.status.toUpperCase()}</span>
            </div>
        `).join('');
    } catch (error) {
        showMessage('Failed to load auctions', 'error');
    }
}

async function viewAuction(id) {
    try {
        const response = await fetch(`${API_URL}/auctions/${id}`);
        const auction = await response.json();
        
        const modal = document.getElementById('auctionModal');
        const detail = document.getElementById('auctionDetail');
        
        let bidSection = '';
        if (authToken && auction.status === 'open' && currentUser.id !== auction.seller_id) {
            bidSection = `
                <div class="bid-section">
                    <h3>Place a Bid</h3>
                    <input type="number" id="bidAmount" placeholder="Bid Amount" step="0.01" min="${auction.current_price + 0.01}">
                    <button onclick="placeBid(${id})" class="btn btn-primary">Place Bid</button>
                </div>
            `;
        }
        
        let closeButton = '';
        if (authToken && currentUser.id === auction.seller_id && auction.status === 'open') {
            closeButton = `<button onclick="closeAuction(${id})" class="btn" style="background: #e53e3e;">Close Auction</button>`;
        }
        
        detail.innerHTML = `
            <h2>${auction.title}</h2>
            <p style="margin: 10px 0;">${auction.description}</p>
            <div class="price">Current Price: $${auction.current_price.toFixed(2)}</div>
            <p><strong>Starting Price:</strong> $${auction.starting_price.toFixed(2)}</p>
            <p><strong>Seller:</strong> ${auction.seller_name}</p>
            <p><strong>Status:</strong> <span class="status ${auction.status}">${auction.status.toUpperCase()}</span></p>
            <p><strong>Ends:</strong> ${new Date(auction.end_time).toLocaleString()}</p>
            ${closeButton}
            ${bidSection}
            <div class="bid-list">
                <h3>Bid History (${auction.bids.length} bids)</h3>
                ${auction.bids.map(bid => `
                    <div class="bid-item">
                        <span><strong>${bid.bidder_name}</strong> - $${bid.amount.toFixed(2)}</span>
                        <span>${new Date(bid.created_at).toLocaleString()}</span>
                    </div>
                `).join('') || '<p>No bids yet</p>'}
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        showMessage('Failed to load auction details', 'error');
    }
}

function closeModal() {
    document.getElementById('auctionModal').style.display = 'none';
}

async function placeBid(auctionId) {
    const amount = parseFloat(document.getElementById('bidAmount').value);
    
    if (!amount || amount <= 0) {
        showMessage('Please enter a valid bid amount', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auctions/${auctionId}/bid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ amount })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Bid placed successfully!', 'success');
            closeModal();
            loadAuctions('open');
        } else {
            showMessage(data.error || 'Failed to place bid', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function showCreateAuction() {
    document.getElementById('createAuctionSection').style.display = 'block';
    
    // Set minimum end time to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('auctionEndTime').min = now.toISOString().slice(0, 16);
}

function hideCreateAuction() {
    document.getElementById('createAuctionSection').style.display = 'none';
}

async function createAuction() {
    const title = document.getElementById('auctionTitle').value;
    const description = document.getElementById('auctionDescription').value;
    const starting_price = parseFloat(document.getElementById('auctionPrice').value);
    const end_time = document.getElementById('auctionEndTime').value;
    
    if (!title || !description || !starting_price || !end_time) {
        showMessage('All fields are required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auctions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, starting_price, end_time })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Auction created successfully!', 'success');
            hideCreateAuction();
            // Clear form
            document.getElementById('auctionTitle').value = '';
            document.getElementById('auctionDescription').value = '';
            document.getElementById('auctionPrice').value = '';
            document.getElementById('auctionEndTime').value = '';
            loadAuctions('open');
        } else {
            showMessage(data.error || 'Failed to create auction', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function closeAuction(auctionId) {
    if (!confirm('Are you sure you want to close this auction?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auctions/${auctionId}/close`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Auction closed successfully!', 'success');
            closeModal();
            loadAuctions('open');
        } else {
            showMessage(data.error || 'Failed to close auction', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('auctionModal');
    if (event.target === modal) {
        closeModal();
    }
}
