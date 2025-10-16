# Quick Start Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## First Time Setup

### Creating Your First User

1. Click the **Register** button in the top-right corner
2. Enter a username, email, and password
3. Click **Register**
4. You'll be redirected to login - enter your credentials
5. You're now logged in and can create auctions!

### Creating Your First Auction

1. After logging in, click the **+ Create Auction** button
2. Fill in the auction details:
   - Title: Name of the item
   - Description: Detailed description
   - Starting Price: Minimum bid amount
   - End Time: When the auction closes
3. Click **Create Auction**
4. Your auction will appear in the list!

### Placing a Bid

1. Click on any auction card to view details
2. If you're logged in and not the seller, you'll see a bid form
3. Enter your bid amount (must be higher than current price)
4. Click **Place Bid**
5. Your bid will be recorded in the bid history!

## Development Mode

For development with auto-reload:
```bash
npm run dev
```

## Configuration

Create a `.env` file to customize settings (optional):
```
PORT=3000
JWT_SECRET=your-secret-key-here
DB_PATH=./auction.db
```

## Testing the API

You can also test the API directly using curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Register a user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123"}'

# Get all auctions
curl http://localhost:3000/api/auctions
```

## Troubleshooting

**Port already in use?**
- Change the PORT in your `.env` file
- Or stop the process using port 3000

**Database issues?**
- Delete `auction.db` and restart the server
- A fresh database will be created automatically

**Login not working?**
- Clear your browser's localStorage
- Make sure you registered first

## Features Overview

✅ User registration and login  
✅ Create auctions with title, description, price, and end time  
✅ Browse open and closed auctions  
✅ Place bids on auctions  
✅ View bid history  
✅ Close your own auctions  
✅ JWT-based authentication  
✅ Secure password hashing  

## Need Help?

Check the main [README.md](README.md) for detailed API documentation and architecture information.
